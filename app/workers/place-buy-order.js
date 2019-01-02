import { logger } from "../logger";
import { Robinhood } from "../robinhood-service";
import handleBuyOrder from "./handle-buy-order";
import calculateQuantity from "./calculate_quantity";

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

    quantity = await calculateQuantity(quantity_type, quantity, bid_price);

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

    handleBuyOrder({
      sell_order_type,
      order,
      sell_price,
      options,
      instrument,
      symbol,
      quantity
    });

    return order;
  } catch (e) {
    return { detail: e.toString() };
  }
};
