import { Robinhood } from "../robinhood-service";
import { logger } from "../logger";
import { timeout, roundIt } from "./util";
const uuid = require("uuid/v4");

const buy_order_handle = async (
  { last_price, under_bid, quantity, instrument, type },
  callback
) => {
  const id = uuid();
  const buy_order = {
    id,
    processing: true,
    order: {},
    last_price,
    under_bid,
    quantity,
    instrument,
    type
  };

  buy_order.handled = () => {
    buy_order.order.state = "handled";
  };

  buy_order.cancel = async () => {
    try {
      buy_order.processing = true;
      if (buy_order.state !== "cancelled") {
        await Robinhood.cancel_order(buy_order.order);
        await update();
      }
    } catch (error) {
      logger.error("failed to buy_order.cancel");
    }

    return buy_order;
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

      buy_order.order = {
        state: "error",
        id,
        under_bid,
        quantity,
        instrument,
        type
      };
    }
    statusCheckLoop();
    buy_order.processing = false;
  }

  let check_status_again = 5;
  let executions = [];

  const partial_order = () =>
    buy_order.order.executions.reduce(
      (p, n, i) => {
        if (!executions.some(e => e.id === n.id)) {
          executions.push(n);

          return {
            price:
              (p.price * p.quantity + Number(n.quantity) * Number(n.price)) /
              (p.quantity + Number(n.quantity)),
            quantity: p.quantity + Number(n.quantity)
          };
        }
        return p;
      },
      { quantity: 0, price: 0 }
    );

  const partial_buy_order = () => {
    const last_qty = executions.reduce((p, n) => p + n.quantity, 0);
    const partial = partial_order();
    logger.warn(`creating partial_buy_order manually..`);
    return {
      state: buy_order.order.state,
      id: buy_order.order.id,
      cumulative_quantity: partial.quantity - last_qty,
      average_price: partial.price,
      instrument: buy_order.order.instrument
    };
  };

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
          buy_order.order.executions.length > executions.length
        ) {
          buy_order.processing = true;
          await callback(partial_buy_order());
          buy_order.processing = false;
        }
      }
      buy_order.processing = true;
      if (executions.length > 0) {
        await callback(partial_buy_order());
      } else {
        await callback(buy_order.order);
      }
      buy_order.processing = false;
    } catch (error) {
      logger.error("error while checking order status");
      logger.error(`${error}`);

      if (check_status_again) {
        await timeout(3000);
        check_status_again -= 1;
        statusCheckLoop();
      } else {
        buy_order.processing = true;
        await callback(
          buy_order.order || {
            state: "error",
            id,
            under_bid,
            quantity,
            instrument,
            type
          }
        );
        buy_order.processing = false;
      }
    }
  }

  await placeOrder();

  return buy_order;
};

export default buy_order_handle;
