module.exports = async (Robinhood, { instrument, quantity, bid_price }) => {
  try {
    let options = {
      type: "limit",
      quantity,
      bid_price,
      instrument
    };
    const orderPlacedRes = await Robinhood.place_sell_order(options);

    return orderPlacedRes;
  } catch (e) {
    return { detail: e.toString() };
  }
};
