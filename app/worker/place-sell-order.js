module.exports = async (Robinhood, { instrument, order_type, price, quantity, symbol }) => {
  try {

    let quote;
    if (order_type === "bid")
      quote = await Robinhood.quote_data(symbol);

    let options = {
      type: "limit",
      quantity,
      bid_price: order_type === "bid" ? quote.results[0].last_trade_price : price,
      instrument
    };

    const orderPlacedRes = await Robinhood.place_sell_order(options);

    return orderPlacedRes;
  } catch (e) {
    return { detail: e.toString() };
  }
};
