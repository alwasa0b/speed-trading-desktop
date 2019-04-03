import { logger } from "../logger";
import { roundIt, activeOrders } from "./util";
import { timeout } from "rxjs/operator/timeout";

export default ({ sell_orders, buy_orders, symbol, average_cost }, emitter) => {
  let processing = false;

  return async function sell_order_status_changed(order) {
    while (processing) {
      await timeout(100);
    }
    processing = true;
    try {
      if (order.state === "partially_filled") {
        logger.warn("sell order partially_filled.. waiting!!");
        return;
      }

      const removeIndex = sell_orders.findIndex(
        item => item.order.id === order.id
      );
      ~removeIndex && sell_orders.splice(removeIndex, 1);

      if (order.state !== "filled") {
        logger.info(`sell order ${JSON.stringify(order.state)}`);
        return;
      }

      logger.info(
        `sold #${Math.floor(order.cumulative_quantity)} of ${symbol}@${roundIt(
          order.average_price
        )}!!`
      );

      let active_sell_orders = activeOrders(sell_orders);
      let active_buy_orders = activeOrders(buy_orders);

      while (
        active_sell_orders.some(s => s.processing && order.id !== s.order.id) ||
        active_buy_orders.some(s => s.processing)
      ) {
        await timeout(1000);
        logger.error("wait for processing orders before placing sell orders");

        //refresh with new orders
        active_sell_orders = activeOrders(sell_orders);
        active_buy_orders = activeOrders(buy_orders);
      }

      if (active_sell_orders.length === 0) {
        emitter.emit(`RESET_${symbol.toLocaleLowerCase()}`, symbol);
        average_cost.price = 0;
      }
    } catch (error) {
      logger.error(`error handling sell order ${JSON.stringify(error)}`);
    } finally {
      processing = false;
    }
  };
};
