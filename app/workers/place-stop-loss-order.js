import { logger } from "../logger";
import { Robinhood } from "../robinhood-service";

export default async ({ instrument, quantity, price, symbol }) => {
  try {
    const options = {
      instrument: { url: instrument, symbol },
      quantity,
      stop_price: parseFloat(price).toFixed(2),
      type: "market",
      trigger: "stop"
    };

    const orderPlacedRes = await Robinhood.place_sell_order(options);

    logger.info("stop loss order placed");

    return orderPlacedRes;
  } catch (e) {
    return { detail: e.toString() };
  }
};
