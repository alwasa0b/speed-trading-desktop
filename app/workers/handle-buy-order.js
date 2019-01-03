import { timeout } from "./util";
import { logger } from "../logger";
import { Robinhood } from "../robinhood-service";

export default async function({
  sell_order_type,
  order,
  sell_price,
  options,
  instrument,
  symbol,
  quantity
}) {
  if (sell_order_type === "none") return;

  while (true) {
    const { state, average_price } = await Robinhood.url(order.url);

    if (state === "cancelled") {
      logger.info(`id: ${order.id} cancelled`);
      break;
    }

    if (state === "filled") {
      logger.info("order filled..");

      sell_price = parseFloat(sell_price).toFixed(2);

      if (sell_order_type === "limit") {
        const over_bid = parseFloat(
          Number(average_price) + Number(sell_price)
        ).toFixed(2);

        logger.info("placing sell order...");
        logger.info(`id: ${order.id}, sell: ${over_bid}`);

        await Robinhood.place_sell_order({
          ...options,
          bid_price: over_bid
        });
      }

      if (sell_order_type === "stop") {
        logger.info("placing stop loss...");
        logger.info(`id: ${order.id}, stop: ${sell_price}`);

        await Robinhood.place_sell_order({
          instrument: { url: instrument, symbol },
          quantity,
          stop_price: sell_price,
          type: "market",
          trigger: "stop"
        });
      }

      break;
    }

    logger.info("waiting for order to fill...");
    await timeout(1000);
  }
}
