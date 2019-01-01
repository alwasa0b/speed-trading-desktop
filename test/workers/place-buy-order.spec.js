import placeBuy from "../../app/workers/place-buy-order";
jest.mock("../../app/workers/util", () => ({ timeout: jest.fn() }));
jest.mock("../../app/logger", () => ({ logger: { info: jest.fn() } }));
jest.mock("../../app/robinhood-service", () => ({
  Robinhood: {
    place_buy_order: jest.fn(() => Promise.resolve({ url: "test.order.url" })),
    url: jest.fn(() => Promise.resolve({ state: "filled" })),
    place_sell_order: jest.fn(() => Promise.resolve({ url: "test.order.url" })),
    quote_data: jest.fn()
  }
}));
const { timeout } = require("../../app/workers/util");
const { Robinhood } = require("../../app/robinhood-service");

beforeEach(() => {
  jest.resetModules();
});

describe("test placing buy order", () => {
  it("should call place_buy_order once", async () => {
    await placeBuy({});
    expect(Robinhood.place_buy_order).toHaveBeenCalledTimes(1);
  });

  it("should call place_buy_order with 'limit' order type", async () => {
    await placeBuy({});

    let options = {
      type: "limit",
      quantity: undefined,
      bid_price: "NaN",
      instrument: { url: undefined, symbol: undefined }
    };

    expect(Robinhood.place_buy_order).toBeCalledWith(options);
  });

  it("should call place_buy_order with passed 'buy_price'", async () => {
    let options = {
      buy_price: 12
    };

    await placeBuy(options);

    expect(Robinhood.place_buy_order).toBeCalledWith({
      type: "limit",
      quantity: undefined,
      bid_price: parseFloat(12).toFixed(2),
      instrument: { url: undefined, symbol: undefined }
    });
  });

  it("should call place_buy_order with passed 'quantity'", async () => {
    let options = {
      quantity: 1
    };

    await placeBuy(options);

    expect(Robinhood.place_buy_order).toBeCalledWith({
      type: "limit",
      quantity: 1,
      bid_price: "NaN",
      instrument: { url: undefined, symbol: undefined }
    });
  });

  it("should call place_buy_order with passed 'symbol'", async () => {
    let options = {
      symbol: "test"
    };

    await placeBuy(options);

    expect(Robinhood.place_buy_order).toBeCalledWith({
      type: "limit",
      quantity: undefined,
      bid_price: "NaN",
      instrument: { url: undefined, symbol: "test" }
    });
  });

  it("should call place_buy_order with passed 'instrument'", async () => {
    let options = {
      instrument: "test"
    };

    await placeBuy(options);

    expect(Robinhood.place_buy_order).toBeCalledWith({
      type: "limit",
      quantity: undefined,
      bid_price: "NaN",
      instrument: { url: "test", symbol: undefined }
    });
  });

  it("should not call place_sell_order if order has been canceled", async () => {
    Robinhood.url = jest.fn(() => Promise.resolve({ state: "cancelled" }));

    let options = {
      sell_order_type: "limit"
    };

    await placeBuy(options);

    expect(Robinhood.place_sell_order).toHaveBeenCalledTimes(0);
  });

  it("should call place_sell_order when 'sell_order_type' is 'limit' and order has been filled", async () => {
    Robinhood.url = jest.fn(() => Promise.resolve({ state: "filled" }));

    let options = {
      sell_order_type: "limit"
    };

    await placeBuy(options);

    expect(Robinhood.place_sell_order).toHaveBeenCalledTimes(1);
  });

  it("should call timeout if order is still unconfirmed", async () => {
    Robinhood.url = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ state: "unconfirmed" }))
      .mockReturnValueOnce(Promise.resolve({ state: "unconfirmed" }))
      .mockReturnValueOnce(Promise.resolve({ state: "unconfirmed" }))
      .mockReturnValueOnce(Promise.resolve({ state: "cancelled" }));

    let options = {
      sell_order_type: "limit"
    };

    await placeBuy(options);

    expect(timeout).toHaveBeenCalledTimes(3);
  });

  it("should call quote_data once when buy_order_type is 'bid'", async () => {
    await placeBuy({ buy_order_type: "bid" });

    expect(Robinhood.quote_data).toHaveBeenCalledTimes(1);
  });

  it("should call quote_data with 'symbol' when buy_order_type is 'bid'", async () => {
    await placeBuy({ buy_order_type: "bid", symbol: "test" });

    expect(Robinhood.quote_data).toHaveBeenCalledWith("test");
  });
});
