module.exports = async (Robinhood, { instrument, quantity, price, symbol }) => {
  try {
    const options = {
      instrument: { url: instrument, symbol },
      quantity,
      stop_price: price,
      type: "market",
      trigger: "stop"
    };
    
    const orderPlacedRes = await Robinhood.place_sell_order(options);

    return orderPlacedRes;
  } catch (e) {
    return { detail: e.toString() };
  }
};