import { logger } from "../logger";
import { timeout, activeOrders, roundIt } from "./util";
import sell_order_handle from "./sell_order_handle";
import sell_order_status_changed from "./sell_order_status_changed";

export default (
  { buy_orders, symbol, sell_orders, over_bids, average_costs },
  emitter
) => {
  let sell_status_changed = sell_order_status_changed(
    {
      buy_orders,
      symbol,
      sell_orders,
      average_costs
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
      if (
        order.state === "cancelled" ||
        order.state === "rejected" ||
        order.state === "error" ||
        order.state === "handled"
      ) {
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

      average_costs.push({
        price: Number(order.average_price),
        quantity: Number(order.cumulative_quantity)
      });

      const qty = average_costs.reduce((p, n) => p + n.quantity, 0);

      const total_average_cost = average_costs.reduce(
        (p, n) => p + n.price * n.quantity,
        0
      );

      const average_cost = total_average_cost / qty;

      const bid_price = roundIt(
        average_cost +
          over_bids[
            active_sell_orders.length >= over_bids.length
              ? over_bids.length - 1
              : active_sell_orders.length
          ]
      );

      const options = {
        type: "limit",
        quantity:
          qty -
          sell_orders.reduce(
            (p, n) => p + Number(n.order.cumulative_quantity),
            0
          ),
        instrument: { url: order.instrument, symbol },
        bid_price
      };

      await Promise.all(active_sell_orders.map(o => o.cancel()));
      sell_orders.push(await sell_order_handle(options, sell_status_changed));
    } catch (error) {
      logger.error(`error handling buy order ${JSON.stringify(error)}`);
    } finally {
      if (order.state !== "partially_filled" && order.state !== "error") {
        logger.info(`removing order state: ${order.state} from buy_orders..`);
        const removeIndex = buy_orders.findIndex(
          item => item.order.id === order.id
        );
        ~removeIndex && buy_orders.splice(removeIndex, 1);
      }

      processing = false;
    }
  };
};
