import tickerManager from "../../app/workers/ticker_manager";
import { EventEmitter } from "events";
import { ADD_SYMBOL, REMOVE_SYMBOL } from "../../app/constants/messages";
import { timeout } from "../../app/workers/util";

// jest.mock("../../app/workers/util", () => ({ timeout: jest.fn() }));
jest.mock("../../app/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn() }
}));
jest.mock("../../app/robinhood-service", () => ({
  Robinhood: {
    fundamentals: jest.fn(() =>
      Promise.resolve({
        results: [
          {
            high: 20
          }
        ]
      })
    ),
    quote_data: jest.fn(() =>
      Promise.resolve({
        results: [
          {
            last_trade_price: 20,
            instrument: "http://AAPL/",
            symbol: "AAPL"
          }
        ]
      })
    )
  }
}));

const { Robinhood } = require("../../app/robinhood-service");

beforeEach(() => {
  jest.resetModules();
  jest.resetAllMocks();
  jest.resetModuleRegistry();
});

describe("test ticker manager", () => {
  it("should initialize fine with empty symbols", async () => {
    try {
      await tickerManager(new EventEmitter());
    } catch (error) {
      expect("crashed").toBe("should not crash");
    }
  });

  it("should call addListener once", async () => {
    const addListener = jest.fn();
    const emitter = { addListener };
    await tickerManager(emitter);
    expect(addListener).toHaveBeenCalledTimes(1);
  });

  it("should call addListener with ADD_SYMBOL", async () => {
    const addListener = jest.fn();
    const emitter = { addListener };
    await tickerManager(emitter);
    expect(addListener).toHaveBeenCalledWith("ADD_SYMBOL", expect.anything());
  });

  it("should emit PRICE_UPDATED with new updated price", async () => {
    const emitter = new EventEmitter();
    const priceUpdates = jest.fn();

    const quote_data = jest
      .fn()
      .mockResolvedValue({
        results: [
          {
            last_trade_price: 400,
            instrument: "http://AAPL/",
            symbol: "AAPL"
          }
        ]
      })
      .mockResolvedValueOnce({
        results: [
          {
            last_trade_price: 20,
            instrument: "http://AAPL/",
            symbol: "AAPL"
          }
        ]
      })
      .mockResolvedValueOnce({
        results: [
          {
            last_trade_price: 20,
            instrument: "http://AAPL/",
            symbol: "AAPL"
          }
        ]
      });

    const fundamentals = jest.fn(() =>
      Promise.resolve({
        high: 20
      })
    );

    Robinhood.quote_data = quote_data;
    Robinhood.fundamentals = fundamentals;

    emitter.addListener(`PRICE_UPDATED_AAPL`, priceUpdates);

    await tickerManager(emitter);
    emitter.emit(ADD_SYMBOL, "AAPL");

    await timeout(3000);

    expect(priceUpdates).toHaveBeenNthCalledWith(1, {
      price: 20,
      high: 20,
      instrument: "http://AAPL/",
      symbol: "AAPL"
    });

    expect(priceUpdates).toHaveBeenNthCalledWith(2, {
      price: 400,
      high: 20,
      instrument: "http://AAPL/",
      symbol: "AAPL"
    });

    emitter.emit(REMOVE_SYMBOL, "AAPL");
  });
});
