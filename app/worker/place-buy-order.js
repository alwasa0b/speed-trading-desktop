module.exports = async (
  Robinhood,
  {
    instrument,
    quantity,
    buy_price,
    symbol,
    buy_order_type,
    sell_order_type,
    sell_price
  }
) => {
  try {
    let quote, excutedOrder;
    const bid_type = buy_order_type === "bid";
    if (bid_type) quote = await Robinhood.quote_data(symbol);

    let options = {
      type: "limit",
      quantity,
      bid_price: bid_type ? quote.results[0].last_trade_price : buy_price,
      instrument: { url: instrument, symbol }
    };

    console.log("buy order options", options);

    const orderPlacedRes = await Robinhood.place_buy_order(options);
    console.log(`id: ${orderPlacedRes.id}, buy: ${orderPlacedRes.price}`);

    if (sell_order_type !== "none") {
      excutedOrder = setInterval(async () => {
        let order = await Robinhood.url(orderPlacedRes.url);

        if (order.state === "cancelled") {
          console.log(`id: ${orderPlacedRes.id} cancelled`);
          clearInterval(excutedOrder);
          return;
        }

        if (order.state === "filled") {
          console.log("order filled..");

          if (sell_order_type === "limit") {
            console.log("placing sell order...");
            console.log(`id: ${orderPlacedRes.id}, sell: ${sellPrice}`);
            await Robinhood.place_sell_order({
              ...options,
              bid_price: sell_price
            });
          }

          if (sell_order_type === "stop") {
            console.log("placing stop loss...");
            console.log(`id: ${orderPlacedRes.id}, stop: ${stopLossPrice}`);
            await Robinhood.place_sell_order({
              instrument: { url: instrument, symbol },
              quantity,
              stop_price: sell_price,
              type: "market",
              trigger: "stop"
            });
          }

          clearInterval(excutedOrder);
        }
      }, 600);
    }

    return orderPlacedRes;
  } catch (e) {
    if (excutedOrder) clearInterval(excutedOrder);
    return { detail: e.toString() };
  }
};
