import { Robinhood } from "../robinhood-service";
import { logger } from "../logger";
import { timeout, roundIt } from "./util";
const uuid = require("uuid/v4");

const buy_order_handle = async (
  { last_price, under_bid, quantity, instrument, type },
  callback
) => {
  const id = uuid();
  const buy_order = { id, processing: true, order: {} };

  buy_order.cancel = async () => {
    try {
      buy_order.processing = true;
      await Robinhood.cancel_order(buy_order.order);
      await timeout(1000);
      await update();
    } catch (error) {
      logger.error("failed to buy_order.cancel");
    }

    return buy_order;
  };

  buy_order.cancelReplace = async price => {
    let order;
    buy_order.processing = true;

    try {
      await Robinhood.cancel_order(buy_order.order);
      await timeout(1000);
      await update();
      const options = {
        last_price: price,
        under_bid,
        quantity,
        instrument,
        type
      };

      order = await buy_order_handle(options, callback);
    } catch (error) {
      logger.error(
        `failed to buy_order.cancelReplace ${JSON.stringify(error)}`
      );
      order = { order: { state: "error", id: uuid() } };
    }

    return order;
  };

  async function update() {
    try {
      await timeout(1000);
      buy_order.order = await Robinhood.url(buy_order.order.url);
    } catch (error) {
      logger.error(`error updating buy order ${JSON.stringify(error)}`);
    }
  }

  let try_again = 3;

  async function placeOrder() {
    try {
      const bid_price = roundIt(last_price - under_bid);

      const options = {
        type,
        quantity,
        instrument,
        bid_price
      };

      logger.info(
        `placing buy order qty: ${options.quantity}, bid: ${options.bid_price}`
      );

      buy_order.order = await Robinhood.place_buy_order(options);

      if (!buy_order.order) throw Error("order is null");
    } catch (error) {
      logger.error(`error placing order ${JSON.stringify(error)}`);

      if (try_again) {
        await timeout(3000);
        try_again -= 1;
        await placeOrder();
        return;
      }

      buy_order.order = { state: "error", id };
    }
    statusCheckLoop();
    buy_order.processing = false;
  }

  let check_status_again = 5;
  let partial_fills = 0;

  async function statusCheckLoop() {
    try {
      while (
        buy_order.order.state !== "filled" &&
        buy_order.order.state !== "cancelled" &&
        buy_order.order.state !== "rejected" &&
        buy_order.order.state !== "error"
      ) {
        await update();

        if (
          buy_order.order.state === "partially_filled" &&
          buy_order.order.executions.length > partial_fills
        ) {
          partial_fills = buy_order.order.executions.length;
          logger.info(`buy partial_fills: ${JSON.stringify(buy_order.order)}`);
          // callback(buy_order.order);
        }
      }
      buy_order.processing = true;
      callback(buy_order.order);
    } catch (error) {
      logger.error("error while checking order status");
      logger.error(`${error}`);

      if (check_status_again) {
        await timeout(3000);
        check_status_again -= 1;
        statusCheckLoop();
      } else {
        buy_order.processing = true;
        callback(buy_order.order || { state: "error", id });
      }
    }
  }

  await placeOrder();

  return buy_order;
};

export default buy_order_handle;
