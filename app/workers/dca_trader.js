import { logger } from "../logger";
import {
  timeout,
  activeOrders,
  timeoutWithClear,
  clean_orders,
  cancel
} from "./util";
import buy_order_handle from "./buy_order_handle";
import buy_order_status_changed from "./buy_order_status_changed";
import sell_order_handle from "./sell_order_handle";
const uuid_v4 = require("uuid/v4");
const min_interval_allowed = 20;

const wait_price_updates = 10000;
export default async (
  {
    under_bid_price,
    quantity,
    time_interval,
    over_my_price,
    symbol,
    instrument,
    pause_price,
    locked
  },
  emitter,
  on_stopped
) => {
  const id = uuid_v4();
  const handled_timeout = timeoutWithClear();
  const transactions = [];

  let last_price = 0;

  let interval =
    (time_interval >= min_interval_allowed
      ? time_interval
      : min_interval_allowed) * 1000;

  let ceiling_price = pause_price;

  let hod = 0;

  let over_bids = over_my_price.split(",").map(Number);
  let bids = under_bid_price.split(",").map(Number);
  let qts = quantity.split(",").map(Number);

  if (bids.length !== qts.length)
    throw new Error("bid and qty count don't match");

  let trader = { inTrade: false, pause_callbacks: false, transactions };
  let buy_orders = [];
  let sell_orders = [];
  let average_costs = [];

  async function update_price({ price, high }) {
    last_price = Number(price);
    hod = Number(high);
  }

  emitter.addListener(
    `PRICE_UPDATED_${symbol.toLocaleLowerCase()}`,
    update_price
  );

  async function update({
    under_bid_price,
    quantity,
    time_interval,
    over_my_price,
    pause_price
  }) {
    bids = under_bid_price.split(",").map(Number);
    qts = quantity.split(",").map(Number);

    if (bids.length !== qts.length)
      throw new Error("bid and qty count don't match");

    interval =
      (time_interval >= min_interval_allowed
        ? time_interval
        : min_interval_allowed) * 1000;

    over_bids = over_my_price.split(",").map(Number);
    ceiling_price = pause_price;

    buy_status_changed = buy_order_status_changed(
      {
        trader,
        buy_orders,
        symbol,
        sell_orders,
        over_bids,
        average_costs
      },
      emitter
    );

    reset();

    logger.info("updated");
  }

  let paused = false;
  const should_trade = () => !paused && last_price < (ceiling_price || hod);

  const cancelReplace = async () => {
    const orders = await exit();
    const new_orders = await Promise.all(
      orders.map(
        async o =>
          await buy_order_handle(
            {
              last_price,
              under_bid: o.under_bid,
              quantity: o.quantity,
              instrument: { url: instrument, symbol },
              type: "limit"
            },
            buy_status_changed
          )
      )
    );
    buy_orders.push(...new_orders);
  };

  let buy_status_changed = buy_order_status_changed(
    {
      trader,
      buy_orders,
      symbol,
      sell_orders,
      over_bids,
      average_costs
    },
    emitter
  );

  const createBuyOrder = async (under_bid, i) =>
    await buy_order_handle(
      {
        last_price,
        under_bid,
        quantity: qts[i],
        instrument: { url: instrument, symbol },
        type: "limit"
      },
      buy_status_changed
    );

  let running = true;

  async function trade() {
    while (trader.inTrade && running) {
      logger.warn("waiting on a processing trade call");
      await timeout(min_interval_allowed * 1000);
    }

    try {
      if (!running || !should_trade()) return;

      trader.inTrade = true;
      //wait on processing orders
      while (
        buy_orders.some(s => s.processing) ||
        sell_orders.some(s => s.processing)
      ) {
        await timeout(1000);
        logger.warn("trade waiting on processing orders before processing");
      }

      const active_buy_orders = activeOrders(buy_orders);
      trader.pause_callbacks = true;
      if (active_buy_orders.length > 0) {
        if (average_costs.length > 0 && locked) {
          //do nothing for now
        } else {
          logger.info("replacing buy orders..");

          await cancelReplace();
        }
      } else {
        logger.info("placing new buy orders..");
        buy_orders.push(...(await Promise.all(bids.map(createBuyOrder))));
      }
      clean_orders(buy_orders);
    } catch (error) {
      logger.error(`ERROR in trade: ${JSON.stringify(error)}..`);
    }
    trader.pause_callbacks = false;
    trader.inTrade = false;
  }

  async function main_loop() {
    await timeout(wait_price_updates);

    while (running) {
      trade();
      await handled_timeout.timeout(interval);
    }
  }

  async function reset() {
    await exit();
    handled_timeout.clear();
  }

  emitter.addListener(`RESET_${symbol.toLocaleLowerCase()}`, reset);

  const exit = async () => await Promise.all(buy_orders.map(cancel));

  emitter.addListener("EXIT", exit);

  async function stop() {
    await exit();

    emitter.removeListener(
      `PRICE_UPDATED_${symbol.toLocaleLowerCase()}`,
      update_price
    );

    emitter.removeListener(`RESET_${symbol.toLocaleLowerCase()}`, reset);
    emitter.removeListener("EXIT", exit);

    running = false;
    on_stopped(id);
    logger.info("stopped");
  }

  function pause() {
    paused = true;
    logger.info("paused");
  }

  function resume() {
    paused = false;
    logger.info("resumed");
  }

  async function panic() {
    const orders = await Promise.all(sell_orders.map(cancel));
    const new_orders = await Promise.all(
      orders.map(
        async o =>
          await sell_order_handle(
            {
              bid_price: last_price - 0.05,
              quantity:
                o.quantity -
                o.order.executions.reduce((p, n) => p + Number(n.quantity), 0),
              instrument: { url: instrument, symbol },
              type: "limit"
            },
            o.callback
          )
      )
    );
    sell_orders.push(...new_orders);
    logger.info("panicked");
  }

  main_loop();

  return { stop, id, update, pause, resume, panic };
};
