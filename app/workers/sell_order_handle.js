import { Robinhood } from "../robinhood-service";
import { logger } from "../logger";
import { timeout } from "./util";
const uuid = require("uuid/v4");

const sell_order_handle = async (
  { type = "limit", quantity, instrument, bid_price },
  callback
) => {
  const id = uuid();
  const sell_order = { id, processing: true, order: {} };

  sell_order.cancel = async () => {
    sell_order.processing = true;
    try {
      await Robinhood.cancel_order(sell_order.order);
      await timeout(2000);
    } catch (error) {
      logger.error("failed to cancel order");
    }
    sell_order.processing = false;
  };

  sell_order.cancelReplace = async function cancelReplace(bid) {
    let order;
    sell_order.processing = true;

    try {
      await Robinhood.cancel_order(sell_order.order);
      await timeout(3000);
      sell_order.order = await Robinhood.url(sell_order.order.url);
      const options = {
        type,
        quantity:
          quantity -
          sell_order.order.executions.reduce((p, n) => p + n.quantity, 0),
        instrument,
        bid_price: bid
      };

      sell_order.processing = false;
      order = await sell_order_handle(options, callback);
    } catch (error) {
      logger.error(`failed to cancel order ${JSON.stringify(error)}`);
      order = { order: { state: "error", id } };
    }

    return order;
  };

  async function update() {
    try {
      sell_order.order = await Robinhood.url(sell_order.order.url);
      await timeout(3000);
    } catch (error) {
      logger.error(`error updating sell order ${JSON.stringify(error)}`);
    }
  }

  let try_again = 1;

  async function placeOrder() {
    const options = {
      type,
      quantity,
      instrument,
      bid_price
    };

    try {
      logger.info(
        `placing sell order qty: ${options.quantity}, bid: ${options.bid_price}`
      );
      sell_order.order = await Robinhood.place_sell_order(options);

      if (!sell_order.order) throw Error("order is null");
    } catch (error) {
      logger.error(`error ${JSON.stringify(error)}`);
      logger.error(`error placing sell order ${JSON.stringify(options)}`);

      await timeout(2000);
      if (try_again) {
        try_again -= 1;
        await placeOrder();
      }

      sell_order.order = { state: "error", id };
    }

    statusCheckLoop();
    sell_order.processing = false;
  }

  let check_status_again = 5;
  let partial_fills = 0;

  async function statusCheckLoop() {
    try {
      while (
        sell_order.order.state !== "filled" &&
        sell_order.order.state !== "cancelled" &&
        sell_order.order.state !== "rejected" &&
        sell_order.order.state !== "error"
      ) {
        await update();
        if (
          sell_order.order.state === "partially_filled" &&
          sell_order.order.executions.length > partial_fills
        ) {
          partial_fills = sell_order.order.executions.length;
          logger.info(
            `sell partial_fills: ${JSON.stringify(sell_order.order)}`
          );
          // callback(buy_order.order);
        }
      }
      sell_order.processing = true;
      callback(sell_order.order);
    } catch (error) {
      logger.error("error while checking order status");
      logger.error(`${error}`);

      await timeout(2000);
      if (check_status_again) {
        check_status_again -= 1;
        statusCheckLoop();
      }
    }
  }

  await placeOrder();

  return sell_order;
};

export default sell_order_handle;
