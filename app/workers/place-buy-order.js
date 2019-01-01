import { timeout } from "./util";
import { logger } from "../logger";
import { Robinhood } from "../robinhood-service";

export default async ({
  instrument,
  quantity,
  buy_price,
  symbol,
  buy_order_type,
  sell_order_type,
  sell_price,
  quantity_type
}) => {
  try {
    let quote;
    const bid_type = buy_order_type === "bid";

    if (bid_type) quote = await Robinhood.quote_data(symbol);

    const bid_price = parseFloat(
      bid_type ? quote.results[0].last_trade_price : buy_price
    ).toFixed(2);

    if (quantity_type === "percentage") {
      //todo: need testing.
      const account = await Robinhood.accounts();

      const buying_power =
        account.results[0].margin_balances.unallocated_margin_cash;

      const requested = (buying_power * quantity) / 100;
      quantity = Math.floor(requested / bid_price);

      logger.info(`buying_power: ${buying_power}`);
      logger.info(`requested: ${requested}`);
      logger.info(`calculated quantity: ${quantity}`);
    }

    let options = {
      type: "limit",
      quantity,
      bid_price: bid_price,
      instrument: { url: instrument, symbol }
    };

    logger.info("buy order options", options);

    const order = await Robinhood.place_buy_order(options);

    logger.info(
      `id: ${order.id}, buy: ${order.price}, quantity: ${order.quantity}`
    );

    if (sell_order_type !== "none") {
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
            let over_bid = parseFloat(
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
        await timeout(600);
      }
    }

    return order;
  } catch (e) {
    return { detail: e.toString() };
  }
};
