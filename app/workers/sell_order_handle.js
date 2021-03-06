import { Robinhood } from "../robinhood-service";
import { logger } from "../logger";
import { timeout } from "./util";
const uuid = require("uuid/v4");

const sell_order_handle = async (
  { type = "limit", quantity, instrument, bid_price },
  callback
) => {
  const id = uuid();
  const sell_order = { id, processing: true, order: {}, callback };

  sell_order.cancel = async () => {
    sell_order.processing = true;
    try {
      if (sell_order.state !== "cancelled") {
        await Robinhood.cancel_order(sell_order.order);
        await update();
      }
    } catch (error) {
      sell_order.processing = false;
      logger.error("failed to cancel order");
    }
  };

  async function update() {
    try {
      await timeout(1000);
      sell_order.order = await Robinhood.url(sell_order.order.url);
    } catch (error) {
      logger.error(`error updating sell order ${JSON.stringify(error)}`);
    }
  }

  let try_again = 3;

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

      if (try_again) {
        await timeout(3000);
        try_again -= 1;
        await placeOrder();
        return;
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
      await callback(sell_order.order);
      sell_order.processing = false;
    } catch (error) {
      logger.error("error while checking order status");
      logger.error(`${error}`);

      if (check_status_again) {
        await timeout(3000);
        check_status_again -= 1;
        statusCheckLoop();
      } else {
        sell_order.processing = true;
        await callback(sell_order.order || { state: "error", id });
        sell_order.processing = false;
      }
    }
  }

  await placeOrder();

  return sell_order;
};

export default sell_order_handle;
