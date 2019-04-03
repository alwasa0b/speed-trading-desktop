import { logger } from "../logger";
import { timeout, activeOrders, roundIt } from "./util";
import sell_order_handle from "./sell_order_handle";
import sell_order_status_changed from "./sell_order_status_changed";

export default (
  { buy_orders, symbol, sell_orders, over_bids, average_cost },
  emitter
) => {
  let sell_status_changed = sell_order_status_changed(
    {
      buy_orders,
      symbol,
      sell_orders,
      average_cost
    },
    emitter
  );

  let processing = false;

  return async function buy_order_status_changed(order) {
    while (processing) {
      await timeout(100);
    }
    processing = true;
    try {
      if (order.state !== "partially_filled") {
        logger.info(`removing order state: ${order.state} from buy_orders..`);
        const removeIndex = buy_orders.findIndex(
          item => item.order.id === order.id
        );
        ~removeIndex && buy_orders.splice(removeIndex, 1);
      }

      if (
        order.state === "cancelled" ||
        order.state === "rejected" ||
        order.state === "error"
      ) {
        processing = false;
        return;
      }

      logger.info(
        `bite #${Math.floor(order.cumulative_quantity)} of ${symbol}@${roundIt(
          order.average_price
        )}!!`
      );

      if (order.state === "partially_filled") {
        //todo: what else do I need to do
        logger.info("partially_filled buy order..");
      }

      let active_sell_orders = activeOrders(sell_orders);
      let active_buy_orders = activeOrders(buy_orders);

      while (
        active_sell_orders.some(s => s.processing) ||
        active_buy_orders.some(s => s.processing && order.id !== s.order.id)
      ) {
        await timeout(1000);

        logger.error("wait for processing orders before placing sell orders");

        active_sell_orders = activeOrders(sell_orders);
        active_buy_orders = activeOrders(buy_orders);
      }

      console.log("------------------");
      console.log(`active_sell_orders.length: ${active_sell_orders.length}`);
      console.log(`old total_average_price: ${average_cost.price}`);
      average_cost.price =
        (average_cost.price + Number(order.average_price)) /
        (average_cost.price ? 2 : 1);

      console.log(`order_average_cost: ${order.average_price}`);
      console.log(`current total_average_price: ${average_cost.price}`);

      console.log(
        `current over_bids: ${
          over_bids[
            active_sell_orders.length >= over_bids.length
              ? over_bids.length - 1
              : active_sell_orders.length
          ]
        }`
      );

      // console.log("before::");
      // console.log(JSON.stringify(active_sell_orders, null, 4));

      const bid_price = roundIt(
        average_cost.price +
          over_bids[
            active_sell_orders.length >= over_bids.length
              ? over_bids.length - 1
              : active_sell_orders.length
          ]
      );
      console.log(`sell bid_price: ${bid_price}`);
      console.log("------------------");

      let quantity = Number(order.cumulative_quantity);

      const options = {
        type: "limit",
        quantity,
        instrument: { url: order.instrument, symbol },
        bid_price
      };

      sell_orders.push(await sell_order_handle(options, sell_status_changed));

      if (active_sell_orders.length > 0) {
        sell_orders.push(
          ...(await Promise.all(
            active_sell_orders.map(o => o.cancelReplace(bid_price))
          ))
        );
      }
    } catch (error) {
      logger.error(`error handling buy order ${JSON.stringify(error)}`);
    }

    processing = false;
  };
};
