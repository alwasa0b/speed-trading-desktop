module.exports = async (
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
              (total_quantity - shares_held_for_sells) *
                requested_quantity /
                100
            )
          : requested_quantity,
      bid_price: parseFloat(
        order_type === "bid" ? quote.results[0].last_trade_price : price
      ).toFixed(2),
      instrument: { url: instrument, symbol }
    };

    console.log("sell options");
    console.log(options);

    const orderPlacedRes = await Robinhood.place_sell_order(options);

    return orderPlacedRes;
  } catch (e) {
    return { detail: e.toString() };
  }
};
