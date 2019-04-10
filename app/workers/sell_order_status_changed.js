import { logger } from "../logger";
import { roundIt } from "./util";

export default ({ sell_orders, buy_orders, symbol, average_costs }, emitter) =>
  async function sell_order_status_changed(order) {
    try {
      if (order.state === "partially_filled") {
        logger.warn("sell order partially_filled.. waiting!!");
        return;
      }

      if (order.state !== "filled") {
        logger.info(`sell order ${JSON.stringify(order.state)}`);
        return;
      }

      logger.info(
        `sold #${Math.floor(order.cumulative_quantity)} of ${symbol}@${roundIt(
          order.average_price
        )}!!`
      );

      if (sell_orders.length - 1 === 0) {
        emitter.emit(`RESET_${symbol.toLocaleLowerCase()}`, symbol);
        average_costs.splice(0, average_costs.length);
      }
    } catch (error) {
      logger.error(`error handling sell order ${JSON.stringify(error)}`);
    } finally {
      if (order.state !== "partially_filled") {
        const removeIndex = sell_orders.findIndex(
          item => item.order.id === order.id
        );
        ~removeIndex && sell_orders.splice(removeIndex, 1);
      }
    }
  };
