import placeBuy from "../../app/workers/place-buy-order";
jest.mock("../../app/workers/util", () => ({ timeout: jest.fn() }));
const { timeout } = require("../../app/workers/util");

beforeEach(() => {
  jest.resetModules();
});

describe("test placing buy order", () => {
  it("should call place_buy_order once", async () => {
    const quote_data = jest.fn();
    const place_buy_order = jest.fn();
    const Robinhood = jest.fn(() => ({
      quote_data,
      place_buy_order,
      constructor: { name: "Mocked" }
    }));

    await placeBuy(new Robinhood(), {});
    expect(place_buy_order).toHaveBeenCalledTimes(1);
  });

  it("should call place_buy_order with 'limit' order type", async () => {
    const quote_data = jest.fn();
    const place_buy_order = jest.fn();
    const Robinhood = jest.fn(() => ({
      quote_data,
      place_buy_order,
      constructor: { name: "Mocked" }
    }));

    await placeBuy(new Robinhood(), {});

    let options = {
      type: "limit",
      quantity: undefined,
      bid_price: "NaN",
      instrument: { url: undefined, symbol: undefined }
    };

    expect(place_buy_order).toBeCalledWith(options);
  });

  it("should call place_buy_order with passed 'buy_price'", async () => {
    const quote_data = jest.fn();
    const place_buy_order = jest.fn();
    const Robinhood = jest.fn(() => ({
      quote_data,
      place_buy_order,
      constructor: { name: "Mocked" }
    }));
    let options = {
      buy_price: 12
    };

    await placeBuy(new Robinhood(), options);

    expect(place_buy_order).toBeCalledWith({
      type: "limit",
      quantity: undefined,
      bid_price: parseFloat(12).toFixed(2),
      instrument: { url: undefined, symbol: undefined }
    });
  });

  it("should call place_buy_order with passed 'quantity'", async () => {
    const quote_data = jest.fn();
    const place_buy_order = jest.fn();
    const Robinhood = jest.fn(() => ({
      quote_data,
      place_buy_order,
      constructor: { name: "Mocked" }
    }));
    let options = {
      quantity: 1
    };

    await placeBuy(new Robinhood(), options);

    expect(place_buy_order).toBeCalledWith({
      type: "limit",
      quantity: 1,
      bid_price: "NaN",
      instrument: { url: undefined, symbol: undefined }
    });
  });

  it("should call place_buy_order with passed 'symbol'", async () => {
    const quote_data = jest.fn();
    const place_buy_order = jest.fn();
    const Robinhood = jest.fn(() => ({
      quote_data,
      place_buy_order,
      constructor: { name: "Mocked" }
    }));
    let options = {
      symbol: "test"
    };

    await placeBuy(new Robinhood(), options);

    expect(place_buy_order).toBeCalledWith({
      type: "limit",
      quantity: undefined,
      bid_price: "NaN",
      instrument: { url: undefined, symbol: "test" }
    });
  });

  it("should call place_buy_order with passed 'instrument'", async () => {
    const quote_data = jest.fn();
    const place_buy_order = jest.fn();
    const Robinhood = jest.fn(() => ({
      quote_data,
      place_buy_order,
      constructor: { name: "Mocked" }
    }));
    let options = {
      instrument: "test"
    };

    await placeBuy(new Robinhood(), options);

    expect(place_buy_order).toBeCalledWith({
      type: "limit",
      quantity: undefined,
      bid_price: "NaN",
      instrument: { url: "test", symbol: undefined }
    });
  });

  it("should call place_sell_order when 'sell_order_type' is 'limit' and order has been filled", async () => {
    const quote_data = jest.fn();
    const place_buy_order = jest.fn(() =>
      Promise.resolve({ url: "test.order.url" })
    );
    const place_sell_order = jest.fn();
    const url = jest.fn(() => Promise.resolve({ state: "filled" }));
    const Robinhood = jest.fn(() => ({
      quote_data,
      place_buy_order,
      constructor: { name: "Mocked" },
      place_sell_order,
      url
    }));

    let options = {
      sell_order_type: "limit"
    };

    await placeBuy(new Robinhood(), options);

    expect(place_sell_order).toHaveBeenCalledTimes(1);
  });

  it("should not call place_sell_order if order has been canceled", async () => {
    const quote_data = jest.fn();
    const place_buy_order = jest.fn(() =>
      Promise.resolve({ url: "test.order.url" })
    );
    const place_sell_order = jest.fn();
    const url = jest.fn(() => Promise.resolve({ state: "cancelled" }));
    const Robinhood = jest.fn(() => ({
      quote_data,
      place_buy_order,
      constructor: { name: "Mocked" },
      place_sell_order,
      url
    }));

    let options = {
      sell_order_type: "limit"
    };

    await placeBuy(new Robinhood(), options);

    expect(place_sell_order).toHaveBeenCalledTimes(0);
  });

  it("should call timeout if order is still unconfirmed", async () => {
    const quote_data = jest.fn();
    const place_buy_order = jest.fn(() =>
      Promise.resolve({ url: "test.order.url" })
    );
    const place_sell_order = jest.fn();
    const url = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ state: "unconfirmed" }))
      .mockReturnValueOnce(Promise.resolve({ state: "unconfirmed" }))
      .mockReturnValueOnce(Promise.resolve({ state: "unconfirmed" }))
      .mockReturnValueOnce(Promise.resolve({ state: "cancelled" }));

    const Robinhood = jest.fn(() => ({
      quote_data,
      place_buy_order,
      constructor: { name: "Mocked" },
      place_sell_order,
      url
    }));

    let options = {
      sell_order_type: "limit"
    };

    await placeBuy(new Robinhood(), options);

    expect(timeout).toHaveBeenCalledTimes(3);
  });

  it("should call quote_data once when buy_order_type is 'bid'", async () => {
    const quote_data = jest.fn();
    const place_buy_order = jest.fn();
    const Robinhood = jest.fn(() => ({
      quote_data,
      place_buy_order,
      constructor: { name: "Mocked" }
    }));

    await placeBuy(new Robinhood(), { buy_order_type: "bid" });

    expect(quote_data).toHaveBeenCalledTimes(1);
  });

  it("should call quote_data with 'symbol' when buy_order_type is 'bid'", async () => {
    const quote_data = jest.fn();
    const place_buy_order = jest.fn();
    const Robinhood = jest.fn(() => ({
      quote_data,
      place_buy_order,
      constructor: { name: "Mocked" }
    }));

    await placeBuy(new Robinhood(), { buy_order_type: "bid", symbol: "test" });

    expect(quote_data).toHaveBeenCalledWith("test");
  });
});
