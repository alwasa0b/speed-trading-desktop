import sell_orders from "../../app/reducers/sell_orders";
import {
  update_sell_order_type,
  update_sell_order_price,
  update_quantity,
  update_quantity_type
} from "../../app/actions/sell";

describe("reducers", () => {
  describe("sell_order", () => {
    it("should handle initial state", () => {
      expect(sell_orders(undefined, {})).toMatchSnapshot();
    });

    it("should handle update_sell_order_type", () => {
      expect(
        sell_orders(
          undefined,
          update_sell_order_type({
            order_type: "test_symbol_type",
            symbol: "test_symbol"
          })
        )
      ).toMatchSnapshot();
    });

    it("should handle update_sell_order_price", () => {
      expect(
        sell_orders(
          undefined,
          update_sell_order_price({ price: 1, symbol: "test_symbol" })
        )
      ).toMatchSnapshot();
    });

    it("should handle update_quantity", () => {
      expect(
        sell_orders(
          undefined,
          update_quantity({ quantity: 1, symbol: "test_symbol" })
        )
      ).toMatchSnapshot();
    });

    it("should handle update_quantity_type", () => {
      expect(
        sell_orders(
          undefined,
          update_quantity_type({
            quantity_type: "test_type",
            symbol: "test_symbol"
          })
        )
      ).toMatchSnapshot();
    });

    it("should handle POSITIONS_UPDATED", () => {
      expect(
        sell_orders(undefined, {
          type: "POSITIONS_UPDATED",
          data: [
            { symbol: "symbol1", quantity: 1 },
            { symbol: "symbol2", quantity: 2 }
          ]
        })
      ).toMatchSnapshot();
    });

    it("should only update quantity_type and quantity for symbol1", () => {
      expect(
        sell_orders(
          {
            symbol1: {
              quantity: 1,
              quantity_type: "count"
            },
            symbol2: {
              quantity: 2,
              quantity_type: "count"
            }
          },
          update_quantity_type({
            quantity_type: "test_type",
            symbol: "symbol1"
          })
        )
      ).toMatchSnapshot();
    });
  });
});
