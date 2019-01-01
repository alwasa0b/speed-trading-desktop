import { Robinhood } from "../robinhood-service";
import mapLimit from "promise-map-limit";
import { logger } from "../logger";
export { default as place_sell_order } from "./place-sell-order";
export { default as place_buy_order } from "./place-buy-order";
export { default as place_stop_loss_order } from "./place-stop-loss-order";
export { default as auto_trader_service } from "./auto-trader";

export const place_cancel_order = async order => {
  const placedOrder = await Robinhood.cancel_order(order.price);
  logger.info(
    `cancel order placed for ticker ${order.symbol} and price ${order.price}..`
  );
  return placedOrder;
};

export const update_price = (callback, symbol) => async () => {
  let price = await Robinhood.quote_data(symbol);
  callback({
    price: price.results[0].last_trade_price,
    instrument: price.results[0].instrument,
    symbol: price.results[0].symbol
  });
};

export const update_positions = callback => async () => {
  const resl = await Robinhood.nonzero_positions();
  let arr = await mapLimit(resl.results, 1, async order => {
    let ticker = await Robinhood.url(order.instrument);
    let price = await Robinhood.quote_data(ticker.symbol);
    return {
      symbol: ticker.symbol,
      cur_price: price.results[0].last_trade_price,
      ...order
    };
  });

  callback(arr);
};

export const update_orders = callback => async () => {
  let options = { updated_at: getDate() };
  let orders = await Robinhood.orders(options);
  let tickers = await mapLimit(orders.results, 1, async order => {
    let ticker = await Robinhood.url(order.instrument);
    return { symbol: ticker.symbol, ...order };
  });

  callback(tickers);
};

function getDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!

  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  return yyyy + "-" + mm + "-" + dd;
}
