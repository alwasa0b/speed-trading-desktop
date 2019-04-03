import sell_order_status_changed from "../../app/workers/sell_order_status_changed";

jest.mock("../../app/logger", () => ({ logger: { info: jest.fn() } }));
const { logger } = require("../../app/logger");

describe("test sell order status changed", () => {
  it("should be defined", async () => {
    const sell_orders = [];
    const buy_orders = [];
    const symbol = "";
    const quantity = await sell_order_status_changed({
      buy_orders,
      sell_orders,
      symbol
    });
    expect(quantity).toBeDefined();
  });

  it("should just call logger if order status is partially_filled", async () => {
    const sell_orders = [];
    const buy_orders = [];
    const symbol = "";
    const order = { state: "partially_filled" };
    const quantity = await sell_order_status_changed({
      buy_orders,
      sell_orders,
      symbol
    });
    logger.info = jest.fn();
    await quantity(order);
    expect(logger.info).toHaveBeenCalledWith(
      "sell order partially_filled.. waiting!!"
    );
  });

  it("should just call logger with order status if order status is not partially_filled", async () => {
    const sell_orders = [];
    const buy_orders = [];
    const symbol = "";
    const order = { state: "whatever" };

    const quantity = await sell_order_status_changed({
      buy_orders,
      sell_orders,
      symbol
    });

    logger.info = jest.fn();
    await quantity(order);
    expect(logger.info).toHaveBeenCalledWith(
      `sell order ${JSON.stringify(order.state)}`
    );
  });

  it("should remove order if order status is not partially_filled", async () => {
    const order = { state: "whatever", id: 1 };

    const sell_orders = [order];
    const buy_orders = [];
    const symbol = "";

    const quantity = await sell_order_status_changed({
      buy_orders,
      sell_orders,
      symbol
    });

    await quantity(order);
    expect(sell_orders).toHaveLength(0);
  });

  it("should call cancel on all buy orders if last order status is filled", async () => {
    const order = { state: "filled", id: 1 };

    const cancel1 = jest.fn();
    const cancel2 = jest.fn();

    const buy_order1 = { cancel: cancel1 };

    const buy_order2 = { cancel: cancel2 };

    const sell_orders = [{ order }];
    const buy_orders = [buy_order1, buy_order2];
    const symbol = "";

    const quantity = await sell_order_status_changed({
      buy_orders,
      sell_orders,
      symbol
    });

    await quantity(order);
    expect(cancel1).toHaveBeenCalledTimes(1);
    expect(cancel2).toHaveBeenCalledTimes(1);
  });

  it("should not call cancel on supporting buy orders if we still have orders to filled", async () => {
    const order = { state: "filled", id: 1 };

    const cancel1 = jest.fn();
    const cancel2 = jest.fn();

    const buy_order1 = { cancel: cancel1 };

    const buy_order2 = { cancel: cancel2 };

    const sell_orders = [
      { order },
      { order: { state: "working on it", id: 2 } }
    ];
    const buy_orders = [buy_order1, buy_order2];
    const symbol = "";

    const quantity = await sell_order_status_changed({
      buy_orders,
      sell_orders,
      symbol
    });

    await quantity(order);
    expect(cancel1).toHaveBeenCalledTimes(0);
    expect(cancel2).toHaveBeenCalledTimes(0);
  });
});
