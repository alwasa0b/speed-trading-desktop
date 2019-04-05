import { logger } from "../logger";
import { timeout, activeOrders, cancel, timeoutWithClear } from "./util";
import buy_order_handle from "./buy_order_handle";
import buy_order_status_changed from "./buy_order_status_changed";
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

  let buy_orders = [];
  let sell_orders = [];
  let average_cost = { price: 0 };

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
        buy_orders,
        symbol,
        sell_orders,
        over_bids,
        average_cost
      },
      emitter
    );

    reset();

    logger.info("updated");
  }

  let paused = false;
  const should_trade = () => !paused && last_price < (ceiling_price || hod);

  const cancelReplace = async o => await o.cancelReplace(last_price);

  let buy_status_changed = buy_order_status_changed(
    {
      buy_orders,
      symbol,
      sell_orders,
      over_bids,
      average_cost
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

  let inTrade = false;
  let running = true;

  async function trade() {
    while (inTrade && running) {
      await timeout(interval);
      logger.warn("waiting on a processing trade call");
    }

    try {
      if (!running || !should_trade()) return;

      inTrade = true;
      //wait on processing orders
      while (
        buy_orders.some(s => s.processing) ||
        sell_orders.some(s => s.processing)
      ) {
        await timeout(1000);
        logger.warn("trade waiting on processing orders before processing");
      }

      const active_buy_orders = activeOrders(buy_orders);

      if (active_buy_orders.length > 0) {
        if (average_cost.price && locked) {
          //do nothing for now
        } else {
          logger.info("replacing buy orders..");

          buy_orders.push(
            ...(await Promise.all(active_buy_orders.map(cancelReplace)))
          );
        }
      } else {
        logger.info("placing new buy orders..");
        buy_orders.push(...(await Promise.all(bids.map(createBuyOrder))));
      }
    } catch (error) {
      logger.error(`ERROR in trade: ${JSON.stringify(error)}..`);
    }

    inTrade = false;
  }

  async function main_loop() {
    await timeout(wait_price_updates);

    while (running) {
      trade();
      await handled_timeout.timeout(interval);
    }
  }

  function reset() {
    exit();
    handled_timeout.clear();
  }

  emitter.addListener(`RESET_${symbol.toLocaleLowerCase()}`, reset);

  const exit = () => buy_orders.forEach(cancel);
  emitter.addListener("EXIT", exit);

  function stop() {
    buy_orders.forEach(cancel);

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
    sell_orders.push(
      ...(await Promise.all(
        activeOrders(sell_orders).map(o => o.cancelReplace(last_price - 0.05))
      ))
    );
    logger.info("panicked");
  }

  main_loop();

  return { stop, id, update, pause, resume, panic };
};
