import buy_order_status_changed from "../../app/workers/buy_order_status_changed";

jest.mock("../../app/logger", () => ({ logger: { info: jest.fn() } }));

jest.mock("../../app/workers/sell_order_handle", () => jest.fn());

const { logger } = require("../../app/logger");
const sell_order_handle = require("../../app/workers/sell_order_handle");

describe("test sell order status changed", () => {
  it("should be defined", async () => {
    const sell_orders = [];
    const buy_orders = [];
    const symbol = "";
    const over_bid = 0.1;

    const quantity = await buy_order_status_changed({
      buy_orders,
      symbol,
      sell_orders,
      over_bid
    });

    expect(quantity).toBeDefined();
  });

  it("should NOT remove buy order if status is partially_filled", async () => {
    const sell_orders = [{ order: { state: "filled" } }];

    const buy_orders = [
      { id: 1, order: { state: "partially_filled", id: 1 } },
      { id: 2, order: { state: "rejected", id: 2 } }
    ];

    const order = { state: "partially_filled", id: 1, cumulative_quantity: 0 };
    const symbol = "";
    const over_bid = 0.1;

    const quantity = buy_order_status_changed({
      buy_orders,
      symbol,
      sell_orders,
      over_bid
    });

    await quantity(order);
    expect(buy_orders).toHaveLength(2);
  });

  it("should remove buy order if status in not partially_filled", async () => {
    const sell_orders = [{ order: { state: "filled" } }];

    const buy_orders = [
      { id: 1, order: { state: "cancelled", id: 1 } },
      { id: 2, order: { state: "rejected", id: 2 } }
    ];

    const order = { state: "cancelled", id: 1 };
    const symbol = "";
    const over_bid = 0.1;

    const quantity = buy_order_status_changed({
      buy_orders,
      symbol,
      sell_orders,
      over_bid
    });

    await quantity(order);
    expect(buy_orders).toHaveLength(1);
  });
});

describe("if status is partially_filled", async () => {
  const sell_orders = [{ order: { state: "filled" } }];

  const buy_orders = [
    { id: 1, order: { state: "partially_filled", id: 1 } },
    { id: 2, order: { state: "rejected", id: 2 } }
  ];

  const order = { state: "partially_filled", id: 1 };
  const symbol = "";
  const over_bid = 0.1;

  const quantity = buy_order_status_changed({
    buy_orders,
    symbol,
    sell_orders,
    over_bid
  });

  await quantity(order);

  it("happy", () => {
    expect(buy_orders).toHaveLength(0);
  });

  it("happy2", () => expect(sell_order_handle).toHaveBeenCalledTimes(1));
});
