module.exports = async (
  Robinhood,
  {
    instrument,
    quantity,
    buy_price,
    symbol,
    buy_order_type,
    sell_order_type,
    sell_price,
    quantity_type
  }
) => {
  let excutedOrder;

  try {
    let quote;
    const bid_type = buy_order_type === "bid";
    if (bid_type) quote = await Robinhood.quote_data(symbol);

    const bid_price = parseFloat(
      bid_type ? quote.results[0].last_trade_price : buy_price
    ).toFixed(2);

    if (quantity_type === "percentage") {
      const account = await Robinhood.accounts();

      const buying_power =
        account.results[0].margin_balances.unallocated_margin_cash;
        
      const requested = buying_power * quantity / 100;
      quantity = Math.floor(requested / bid_price);

      console.log(`buying_power: ${buying_power}`);
      console.log(`requested: ${requested}`);
      console.log(`calculated quantity: ${quantity}`);
    }

    let options = {
      type: "limit",
      quantity,
      bid_price: bid_price,
      instrument: { url: instrument, symbol }
    };

    console.log("buy order options", options);

    const orderPlacedRes = await Robinhood.place_buy_order(options);
    console.log(
      `id: ${orderPlacedRes.id}, buy: ${orderPlacedRes.price}, quantity: ${
        orderPlacedRes.quantity
      }`
    );

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

          sell_price = parseFloat(sell_price).toFixed(2);

          if (sell_order_type === "limit") {
            console.log("placing sell order...");
            console.log(`id: ${orderPlacedRes.id}, sell: ${sell_price}`);
            await Robinhood.place_sell_order({
              ...options,
              bid_price: sell_price
            });
          }

          if (sell_order_type === "stop") {
            console.log("placing stop loss...");
            console.log(`id: ${orderPlacedRes.id}, stop: ${sell_price}`);
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
