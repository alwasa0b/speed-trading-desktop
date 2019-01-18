import {
  START_WORKER,
  STOP_WORKER,
  WORKER_STARTED,
  WORKER_STOPPED,
  PAUSE_WORKER,
  WORKER_PAUSED,
  WORKER_UPDATED,
  UPDATE_WORKER,
  RESUME_WORKER,
  WORKER_RESUMED
} from "../constants/messages";

import { logger } from "../logger";
import { Robinhood } from "../robinhood-service";
import { timeout } from "./util";
const uuid_v4 = require("uuid/v4");

export default (ipcMain, emitter) => {
  let auto_trader = null;

  ipcMain.on(START_WORKER, (event, instructions) => {
    auto_trader = new AutoTrader(
      instructions,
      ownId => {
        if (auto_trader.id !== ownId) return;
        event.sender.send(WORKER_STOPPED);
      },
      emitter
    );
    auto_trader.start();
    event.sender.send(WORKER_STARTED);
  });

  ipcMain.on(PAUSE_WORKER, event => {
    auto_trader.pause();
    event.sender.send(WORKER_PAUSED);
  });

  ipcMain.on(RESUME_WORKER, event => {
    auto_trader.resume();
    event.sender.send(WORKER_RESUMED);
  });

  ipcMain.on(UPDATE_WORKER, (event, instructions) => {
    auto_trader.update(instructions);
    event.sender.send(WORKER_UPDATED);
  });

  ipcMain.on(STOP_WORKER, event => {
    logger.info("stopping");
    auto_trader.stop();
    event.sender.send(WORKER_STOPPED);
    event.sender.send(WORKER_RESUMED);
  });
};

class AutoTrader {
  _account = {};
  _high = 0;
  _current_price = Number.MAX_SAFE_INTEGER;
  _paused = false;
  _activityTrading = false;
  _numberOfTradeRuns = 0;
  _activeOrders = 0;
  _openOrders = [];
  id = uuid_v4();

  constructor(instructions, onStop, emitter) {
    this._instructions = instructions;
    this._onStop = onStop;
    this._emitter = emitter;
    this._current_price = Number(instructions.price);
    this._high = Number(instructions.high);
    emitter.on(
      `PRICE_UPDATED_${this._instructions.ticker}`,
      this.updatePausedPrice
    );

    emitter.on(`ACCOUNT_UPDATED`, this.updateAccount);
  }

  updateAccount = account => {
    this._account = account;
  };

  updatePausedPrice = ({ price, high }) => {
    this._current_price = Number(price);
    this._high = this._high || Number(high);
  };

  update(instructions) {
    this._instructions = instructions;
  }

  pause() {
    this._paused = true;
  }

  resume() {
    this._paused = false;
  }

  start = async () => {
    this._activityTrading = true;
    logger.info(`starting ${JSON.stringify(this._instructions)}..`);

    //wait until we get updates for price and account
    await timeout(1200);

    try {
      while (this._activityTrading) {
        if (this._shouldExecuteNewTrade()) {
          this._trade();

          this._numberOfTradeRuns++;
        }

        logger.info(`waiting ${this._instructions.time_interval} seconds..`);

        await timeout(this._instructions.time_interval * 1000);
      }
      logger.info("stopped..");
      this._onStop(this.id);
    } catch (error) {
      logger.error("start crashed..");
      logger.error(error.message);
      this._onStop(this.id);
    }
  };

  stop = () => {
    logger.info("stopped..");
    this._activityTrading = false;
    this._emitter.removeListener(
      `PRICE_UPDATED_${this._instructions.ticker}`,
      this.updatePausedPrice
    );
  };

  _trade = async () => {
    try {
      this._cancel_old_order();

      if (!this._haveEnoughBuyingPower()) {
        logger.warn(
          `not enough buying power to buy ${this._instructions.quantity} of ${
            this._instructions.ticker
          }`
        );
        return;
      }

      logger.info("starting a buy order..");

      this._activeOrders++;

      const buyOrder = await this._buy_order(this._instructions);

      this._openOrders.push(buyOrder);

      logger.info(`waiting for buy order id: ${buyOrder.id} to fill..`);
      const filledOrder = await this._makeSureWeFillBuyOrder({
        buyOrder
      });

      await this._sell_buy_order(filledOrder);

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
      logger.error("_trade crashed..");
      logger.error(error.message);
      this._activityTrading = false;
      this._onStop(this.id);
    }
  };

  _buy_order = async ({ instrument, under_bid_price, quantity, symbol }) => {
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

  _sell_order = async ({ filledOrder, over_my_price, symbol }) => {
    const sell_price = parseFloat(
      Number(filledOrder.average_price) + Number(over_my_price)
    ).toFixed(2);

    const options = {
      type: "limit",
      quantity: filledOrder.quantity,
      instrument: { url: filledOrder.instrument, symbol },
      bid_price: sell_price,
      override_day_trade_checks: true
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
    while (this._activityTrading || this._activeOrders.length > 0) {
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

  _makeSureWeFillSellOrder = async ({ sellOrder, filledOrder }) => {
    let numberOfTries = 0;
    while (this._activityTrading || this._activeOrders.length > 0) {
      const order = await Robinhood.url(sellOrder.url);

      if (order.state === "filled") {
        return sellOrder;
      }

      if (order.state === "cancelled") {
        return sellOrder;
      }

      if (order.state === "rejected") {
        sellOrder = await this._sell_order({
          ...this._instructions,
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

  _haveEnoughBuyingPower() {
    return (
      (this._current_price - this._instructions.under_bid_price) *
        this._instructions.quantity <
      this._account.margin_balances.day_trade_buying_power * 0.93
    );
  }

  async _cancel_old_order() {
    if (this._openOrders.length < this._instructions.number_of_open_orders)
      return;

    const oldestOrder = this._openOrders.shift();
    logger.info(`old buy order id: ${oldestOrder.id} is being canceled..`);

    try {
      let counter = 0;
      await Robinhood.cancel_order(oldestOrder);
      let order = {};
      while (order.state !== "cancelled") {
        order = await Robinhood.url(oldestOrder.url);
        await timeout(3000);
        counter += 1;
        if (counter > 5) {
          const test = (await Robinhood.url(oldestOrder.url)).state;
          logger.error(
            `state ${test} order id: ${
              oldestOrder.id
            } was not canceled HANDLE MANUALLY..`
          );
          return;
        }
      }

      logger.info(`order id: ${oldestOrder.id} was canceled..`);
    } catch (error) {
      logger.error(`failed to cancel order id: ${oldestOrder.id}..`);
      logger.error(error.message);
      const order = await Robinhood.url(oldestOrder.url);
      logger.error(`order: ${oldestOrder.id} state: ${order.state}..`);
      this._sell_buy_order(order);
    }
  }

  async _sell_buy_order(order) {
    if (order.state === "cancelled") return;

    logger.info(`starting sell order for buy order id: ${order.id}..`);

    const sellOrder = await this._sell_order({
      ...this._instructions,
      filledOrder: order
    });

    logger.info(
      `waiting for sell order id: ${sellOrder.id} for buy order id: ${
        order.id
      } to fill..`
    );

    await this._makeSureWeFillSellOrder({
      sellOrder,
      filledOrder: order
    });

    logger.info(`order sold!`);
    this._openOrders = this._openOrders.filter(o => o.id !== order.id);
    this._activeOrders--;
  }

  _shouldExecuteNewTrade() {
    //todo: add account cash and max stock price
    return (
      (!this._instructions.number_of_runs ||
        this._instructions.number_of_runs > this._numberOfTradeRuns) &&
      !this._paused &&
      this._current_price < (this._instructions.pause_price || this._high)
    );
  }
}
