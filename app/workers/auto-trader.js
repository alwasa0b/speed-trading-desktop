import {
  START_WORKER,
  STOP_WORKER,
  WORKER_STARTED,
  WORKER_STOPPED
} from "../constants/messages";

import { logger } from "../logger";
import { Robinhood } from "../robinhood-service";
const uuidv4 = require("uuid/v4");

export default ipcMain => {
  let auto_trader = null;

  const stop = event => {
    logger.info("stopping");
    auto_trader.stop();
    event.sender.send(WORKER_STOPPED);
  };

  ipcMain.on(START_WORKER, (event, instructions) => {
    auto_trader = new AutoTrader(instructions, ownId => {
      if (auto_trader.id !== ownId) return;
      event.sender.send(WORKER_STOPPED);
    });
    auto_trader.start();
    event.sender.send(WORKER_STARTED);
  });

  ipcMain.on(STOP_WORKER, stop);
};

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

class AutoTrader {
  _activityTrading = false;
  _numberOfTradeRuns = 0;
  _activeOrders = 0;
  _openOrders = [];
  id = uuidv4();

  constructor(instructions, onStop) {
    this._instructions = instructions;
    this._onStop = onStop;
  }

  start = async () => {
    this._activityTrading = true;
    try {
      while (this._activityTrading) {
        if (this._shouldExecuteNewTrade()) {
          this._trade({
            instructions: this._instructions
          });

          this._numberOfTradeRuns++;
        }

        logger.info(`waiting ${this._instructions.time_interval} seconds..`);

        await timeout(this._instructions.time_interval * 1000);
      }
      logger.info("stopped..");
      this._onStop(this.id);
    } catch (error) {
      logger.info("stopped..");
      this._onStop(this.id);
    }
  };

  stop = () => {
    logger.info("stopped..");
    this._activityTrading = false;
  };

  _trade = async ({ instructions, orderNumber }) => {
    try {
      logger.info("starting a buy order..");

      this._activeOrders++;

      if (this._openOrders.length >= instructions.number_of_open_orders) {
        const oldestOrder = this._openOrders.shift();
        logger.info(`old buy order id: ${oldestOrder.id} is being canceled..`);
        Robinhood.cancel_order(oldestOrder);
      }

      const buyOrder = await this._buy_order(instructions);

      this._openOrders.push(buyOrder);

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

        this._openOrders = this._openOrders.filter(
          o => o.id !== filledOrder.id
        );

        this._activeOrders--;
      }

      if (filledOrder.state === "cancelled") {
        this._openOrders = this._openOrders.filter(
          o => o.id !== filledOrder.id
        );
        this._activeOrders--;
      }

      if (this._activeOrders === 0 && !this._shouldExecuteNewTrade()) {
        this._activityTrading = false;
      }
    } catch (error) {
      this._activityTrading = false;
      this._onStop(this.id);
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
    if (!this._activityTrading) return;
    const quote = await Robinhood.quote_data(symbol);

    const bid_price = parseFloat(
      Number(quote.results[0].last_trade_price) - Number(under_bid_price)
    ).toFixed(2);

    const options = {
      type: this._numberOfTradeRuns === 1 ? "market" : "limit",
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
    if (!this._activityTrading) return;
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
    while (this._activityTrading) {
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
    while (this._activityTrading) {
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

  _shouldExecuteNewTrade() {
    return (
      !this._instructions.number_of_runs ||
      this._instructions.number_of_runs > this._numberOfTradeRuns
    );
  }
}
