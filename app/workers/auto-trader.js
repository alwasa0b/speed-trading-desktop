import {
  START_WORKER,
  STOP_WORKER,
  WORKER_STARTED,
  WORKER_STOPPED,
  PROGRESS_UPDATE
} from "../constants/messages";

import { logger } from "../logger";
import { Robinhood } from "../robinhood-service";

module.exports = ipcMain => {
  let stopped = false;

  ipcMain.on(START_WORKER, (event, instructions) => {
    stopped = false;
    start({
      instructions
    });
    event.sender.send(WORKER_STARTED);
  });

  const stop = event => {
    logger.info("stopping");
    stopped = true;
  };

  ipcMain.on(STOP_WORKER, stop);

  const start = async ({ instructions }) => {
    if (stopped) {
      stopped = false;
      logger.info("stopped");
      return;
    }
    logger.info("starting a buy order");
    const buyOrder = await buy_order(instructions);

    logger.info("waiting for buy order to fill");
    const filledOrder = await makeSureWeFillBuyOrder({
      instructions,
      buyOrder
    });

    logger.info("starting sell order");
    const sellOrder = await sell_order({
      ...instructions,
      filledOrder
    });

    logger.info("waiting for sell order to fill");
    await makeSureWeFillSellOrder({ sellOrder });

    logger.info(`waiting ${instructions.time_interval * 1000} seconds`);
    setTimeout(() => start({ instructions }), instructions.time_interval);
  };

  const buy_order = async ({
    instrument,
    messages,
    over_my_price,
    under_bid_price,
    quantity,
    symbol
  }) => {
    const quote = await Robinhood.quote_data(symbol);

    const bid_price = parseFloat(
      quote.results[0].bid_price - under_bid_price
    ).toFixed(2);

    const options = {
      type: "limit",
      quantity,
      bid_price,
      instrument: { url: instrument, symbol }
    };

    logger.info(`buy order options ${JSON.stringify(options)}`);

    const result = await Robinhood.place_buy_order(options);

    logger.info(
      `buy order - id: ${result.id}, buy: ${result.price}, quantity: ${
        result.quantity
      } was placed`
    );

    return result;
  };

  const sell_order = async ({ filledOrder, over_my_price, symbol }) => {
    const sell_price = parseFloat(
      filledOrder.average_price + over_my_price
    ).toFixed(2);

    const options = {
      type: "limit",
      quantity: filledOrder.quantity,
      instrument: { url: filledOrder.instrument, symbol },
      bid_price: sell_price
    };

    logger.info(`sell order options ${JSON.stringify(options)}`);

    const result = await Robinhood.place_sell_order(options);

    logger.info(
      `sell order - id: ${result.id}, buy: ${result.price}, quantity: ${
        result.quantity
      } was placed`
    );

    return result;
  };

  const makeSureWeFillBuyOrder = async ({ buyOrder }) => {
    let numberOfTries = 0;
    while (!stopped) {
      const order = await Robinhood.url(buyOrder.url);
      if (order.state === "filled") {
        return buyOrder;
      }

      await timeout(1000);

      numberOfTries++;

      if (numberOfTries > 5) {
        //todo: what happen when buy order doesn't fill in x time??
      }
    }
  };

  const makeSureWeFillSellOrder = async ({ sellOrder }) => {
    let numberOfTries = 0;
    while (!stopped) {
      const order = await Robinhood.url(sellOrder.url);

      if (order.state === "filled") {
        return sellOrder;
      }

      await timeout(1000);

      numberOfTries++;

      if (numberOfTries > 5) {
        //todo: what happen when buy order doesn't fill in x time??
      }
    }
  };

  return { start, stop };
};

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
