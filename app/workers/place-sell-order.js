import { logger } from "../logger";

export default async (
  Robinhood,
  {
    instrument,
    order_type,
    price,
    requested_quantity,
    quantity_type,
    total_quantity,
    symbol,
    shares_held_for_sells
  }
) => {
  try {
    let quote;
    if (order_type === "bid") quote = await Robinhood.quote_data(symbol);

    let options = {
      type: "limit",
      quantity:
        quantity_type === "percentage"
          ? Math.floor(
              ((total_quantity - shares_held_for_sells) * requested_quantity) /
                100
            )
          : requested_quantity,
      bid_price: parseFloat(
        order_type === "bid" ? quote.results[0].last_trade_price : price
      ).toFixed(2),
      instrument: { url: instrument, symbol }
    };

    logger.info(`sell options: ${JSON.stringify(options)}..`);

    const orderPlacedRes = await Robinhood.place_sell_order(options);

    logger.info("sell order placed");

    return orderPlacedRes;
  } catch (e) {
    return { detail: e.toString() };
  }
};
