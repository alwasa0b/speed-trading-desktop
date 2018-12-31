import {
  START_WORKER,
  STOP_WORKER,
  WORKER_STARTED,
  WORKER_STOPPED
} from "../constants/messages";

import { logger } from "../logger";
import { Robinhood } from "../robinhood-service";

module.exports = ipcMain => {
  let auto_trader = null;

  const stop = event => {
    logger.info("stopping");
    auto_trader.stop();
    event.sender.send(WORKER_STOPPED);
  };

  ipcMain.on(START_WORKER, (event, instructions) => {
    auto_trader = new AutoTrader(instructions, () =>
      event.sender.send(WORKER_STOPPED)
    );
    auto_trader.start();
    event.sender.send(WORKER_STARTED);
  });

  ipcMain.on(STOP_WORKER, stop);
};

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

class AutoTrader {
  _running = false;
  numberOfRuns = 0;

  constructor(instructions, onStop) {
    this._instructions = instructions;
    this._onStop = onStop;
  }

  start = async () => {
    this._running = true;
    try {
      while (this._running) {
        if (this._instructions.number_of_runs <= this.numberOfRuns) {
          this._running = false;
          this._onStop();
          break;
        }
        this._trade({ instructions: this._instructions });

        logger.info(
          `waiting ${this._instructions.time_interval * 1000} seconds..`
        );

        await timeout(this._instructions.time_interval * 1000);
        this.numberOfRuns++;
      }
    } catch (error) {
      this._onStop();
    }
  };

  stop = () => {
    this._running = false;
  };

  _trade = async ({ instructions }) => {
    try {
      logger.info("starting a buy order..");
      const buyOrder = await this._buy_order(instructions);

      logger.info(`waiting for buy order id: ${buyOrder.id} to fill..`);
      const filledOrder = await this._makeSureWeFillBuyOrder({
        instructions,
        buyOrder
      });

      if (filledOrder.state !== "cancelled") {
        logger.info(`starting sell order for buy order id: ${buyOrder.id}..`);
        const sellOrder = await this._sell_order({
          ...instructions,
          filledOrder
        });

        logger.info(
          `waiting for sell order id: ${sellOrder.id} for buy order id: ${
            buyOrder.id
          } to fill..`
        );

        await this._makeSureWeFillSellOrder({
          sellOrder,
          instructions,
          filledOrder
        });

        logger.info(`order sold!`);
      }
    } catch (error) {
      this._onStop();
    }
  };

  _buy_order = async ({
    instrument,
    messages,
    over_my_price,
    under_bid_price,
    quantity,
    symbol
  }) => {
    if (!this._running) return;
    const quote = await Robinhood.quote_data(symbol);

    const bid_price = parseFloat(
      Number(quote.results[0].last_trade_price) - Number(under_bid_price)
    ).toFixed(2);

    const options = {
      type: "limit",
      quantity,
      bid_price,
      instrument: { url: instrument, symbol }
    };

    logger.info(`buy order options ${JSON.stringify(options)}..`);

    const result = await Robinhood.place_buy_order(options);

    logger.info(
      `buy order - id: ${result.id}, buy: ${result.price}, quantity: ${
        result.quantity
      } was placed..`
    );

    return result;
  };

  _sell_order = async ({
    instructions,
    filledOrder,
    over_my_price,
    symbol
  }) => {
    if (!this._running) return;
    const sell_price = parseFloat(
      Number(filledOrder.average_price) + Number(over_my_price)
    ).toFixed(2);

    const options = {
      type: "limit",
      quantity: filledOrder.quantity,
      instrument: { url: filledOrder.instrument, symbol },
      bid_price: sell_price
    };

    logger.info(`sell order options ${JSON.stringify(options)}..`);

    const result = await Robinhood.place_sell_order(options);

    logger.info(
      `sell order - id: ${result.id}, buy: ${result.price}, quantity: ${
        result.quantity
      } was placed..`
    );

    return result;
  };

  _makeSureWeFillBuyOrder = async ({ buyOrder }) => {
    let numberOfTries = 0;
    while (this._running) {
      const order = await Robinhood.url(buyOrder.url);

      if (order.state === "filled") {
        return order;
      }

      if (order.state === "cancelled") {
        return order;
      }

      await timeout(700);

      numberOfTries++;

      if (numberOfTries > 5) {
        //todo: what happen when buy order doesn't fill in x time??
      }
    }
  };

  _makeSureWeFillSellOrder = async ({
    sellOrder,
    instructions,
    filledOrder
  }) => {
    let numberOfTries = 0;
    while (this._running) {
      const order = await Robinhood.url(sellOrder.url);

      if (order.state === "filled") {
        return sellOrder;
      }

      if (order.state === "cancelled") {
        return sellOrder;
      }

      if (order.state === "rejected") {
        sellOrder = await this._sell_order({
          ...instructions,
          filledOrder
        });
      }

      await timeout(700);

      numberOfTries++;

      if (numberOfTries > 5) {
        //todo: what happen when buy order doesn't fill in x time??
      }
    }
  };
}
