import { ADD_SYMBOL } from "../constants/messages";
import { logger } from "../logger";
import { Robinhood } from "../robinhood-service";
import { timeout } from "./util";

export function isEmpty(symbols) {
  return Object.keys(symbols).length === 0;
}

export default async (emitter, ipcMain) => {
  const symbols = {};

  async function addSymbol(symbol) {
    try {
      const {
        results: [ticker]
      } = await Robinhood.quote_data(symbol);

      const fundamentals = await Robinhood.fundamentals(symbol);

      symbols[symbol] = {
        price: ticker.last_trade_price,
        high: fundamentals.high,
        instrument: ticker.instrument,
        symbol: ticker.symbol
      };
      logger.info(`${symbol} added to ticker manager..`);
    } catch (error) {
      logger.error(`error adding ${symbol} ticker to manager..`);
    }
  }

  emitter.addListener(ADD_SYMBOL, addSymbol);

  async function startUpdating() {
    while (true) {
      await timeout(700);
      for (const symbol in symbols) {
        const {
          results: [ticker]
        } = await Robinhood.quote_data(symbol);

        const fundamentals = await Robinhood.fundamentals(symbol);

        if (emitter.listenerCount(`PRICE_UPDATED_${symbol}`) !== 0) {
          symbols[symbol] = {
            price: ticker.last_trade_price,
            high: fundamentals.high,
            instrument: ticker.instrument,
            symbol: ticker.symbol
          };
          emitter.emit(`PRICE_UPDATED_${symbol}`, symbols[symbol]);
        } else {
          delete symbols[symbol];
          logger.info(`${symbol} removed from ticker manager..`);
        }
      }
    }
  }

  startUpdating();
};
