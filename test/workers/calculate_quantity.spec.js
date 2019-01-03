import calculateQuantity from "../../app/workers/calculate_quantity";
jest.mock("../../app/workers/util", () => ({ timeout: jest.fn() }));
jest.mock("../../app/logger", () => ({ logger: { info: jest.fn() } }));
jest.mock("../../app/robinhood-service", () => ({
  Robinhood: {
    accounts: jest.fn(() =>
      Promise.resolve({
        results: [{ margin_balances: { unallocated_margin_cash: 10000 } }]
      })
    )
  }
}));

jest.mock("../../app/workers/handle-buy-order");

const { Robinhood } = require("../../app/robinhood-service");

describe("test calculate quantity", () => {
  it("return given quantity when type is not percentage", async () => {
    const quantity = await calculateQuantity("other", 10);
    expect(quantity).toBe(10);
  });

  it("calculate new quantity when type is percentage", async () => {
    const quantity = await calculateQuantity("percentage", 20, 100);
    expect(quantity).toBe(20);
  });

  it("calculate new quantity when account cash is decimal", async () => {
    Robinhood.accounts = jest.fn(() =>
      Promise.resolve({
        results: [{ margin_balances: { unallocated_margin_cash: 12015.235 } }]
      })
    );
    const quantity = await calculateQuantity("percentage", 20, 100);
    expect(quantity).toBe(24);
  });
});
