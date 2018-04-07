let excutedOrder;
module.exports = async (
  Robinhood,
  {
    instrument,
    quantity,
    bid_price,
    symbol,
    placeSellOrder = false,
    placestopLoss = false,
    customPrice = false,
    sellPrice,
    stopLossPrice
  }
) => {
  // {
  //     url:"https://api.robinhood.com/instruments/450dfc6d-5510-4d40-abfb-f633b7d9be3e/",
  //     symbol: "AAPL"
  //   }

  //   type: "limit",
  //     quantity: 1,
  //     bid_price: 150,
  //     instrument: {
  //       url:
  //         "https://api.robinhood.com/instruments/450dfc6d-5510-4d40-abfb-f633b7d9be3e/",
  //       symbol: "AAPL"
  //     }
  try {
    let quote;

    if (!customPrice) quote = await Robinhood.quote_data(symbol);
    
    let options = {
      type: "limit",
      quantity,
      bid_price: customPrice ? bid_price : quote.results[0].last_trade_price,
      instrument: { url: instrument, symbol }
    };
    

    const orderPlacedRes = await Robinhood.place_buy_order(options);

    if (placeSellOrder) {
      console.log("sell " + sellPrice);
      excutedOrder = setInterval(async () => {
        let order = await Robinhood.url(orderPlacedRes.url);
        if (order.state === "filled") {
          console.log("order filled");
          console.log("placing sell order");
          await Robinhood.place_sell_order({
            ...options,
            bid_price: sellPrice
          });

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
