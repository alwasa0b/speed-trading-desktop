import handleBuyOrder from "../../app/workers/handle-buy-order";
jest.mock("../../app/workers/util", () => ({ timeout: jest.fn() }));
jest.mock("../../app/logger", () => ({ logger: { info: jest.fn() } }));
jest.mock("../../app/robinhood-service", () => ({
  Robinhood: {
    place_buy_order: jest.fn(() => Promise.resolve({ url: "test.order.url" })),
    url: jest.fn(() => Promise.resolve({ state: "unconfirmed" })),
    place_sell_order: jest.fn(() => Promise.resolve({ url: "test.order.url" })),
    quote_data: jest.fn()
  }
}));

const { timeout } = require("../../app/workers/util");
const { Robinhood } = require("../../app/robinhood-service");

beforeEach(() => {
  jest.resetModules();
});

describe("test handling buy order", () => {
  it("should call timeout while order is still unconfirmed", async () => {
    Robinhood.url = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ state: "unconfirmed" }))
      .mockReturnValueOnce(Promise.resolve({ state: "unconfirmed" }))
      .mockReturnValueOnce(Promise.resolve({ state: "unconfirmed" }))
      .mockReturnValueOnce(Promise.resolve({ state: "cancelled" }));
    await handleBuyOrder({ sell_order_type: "stop", order: {} });
    expect(timeout).toHaveBeenCalledTimes(3);
  });

  it("should call place_sell_order when order is filled", async () => {
    Robinhood.url = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ state: "unconfirmed" }))
      .mockReturnValueOnce(Promise.resolve({ state: "unconfirmed" }))
      .mockReturnValueOnce(Promise.resolve({ state: "unconfirmed" }))
      .mockReturnValueOnce(Promise.resolve({ state: "filled" }));

    await handleBuyOrder({ sell_order_type: "limit", order: {} });

    expect(Robinhood.place_sell_order).toHaveBeenCalledTimes(1);
  });
});
