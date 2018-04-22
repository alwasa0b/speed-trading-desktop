import buy_order from "../../app/reducers/buy_order";
import {
  update_quantity,
  update_quantity_type,
  update_sell_order_type,
  update_buy_order_type,
  update_buy_price,
  update_sell_price
} from "../../app/actions/buy";

describe("reducers", () => {
  describe("buy_order", () => {
    it("should handle initial state", () => {
      expect(buy_order(undefined, {})).toMatchSnapshot();
    });

    it("should handle update_quantity", () => {
      expect(
        buy_order(undefined, update_quantity({ quantity: 1 }))
      ).toMatchSnapshot();
    });

    it("should handle update_quantity_type", () => {
      expect(
        buy_order(
          undefined,
          update_quantity_type({ quantity_type: "quantity_test_type" })
        )
      ).toMatchSnapshot();
    });

    it("should handle update_sell_order_type", () => {
      expect(
        buy_order(
          undefined,
          update_sell_order_type({ sell_order_type: "sell_order_test_type" })
        )
      ).toMatchSnapshot();
    });

    it("should handle update_buy_order_type", () => {
      expect(
        buy_order(
          undefined,
          update_buy_order_type({ buy_order_type: "buy_order_test_type" })
        )
      ).toMatchSnapshot();
    });

    it("should handle update_buy_price", () => {
      expect(
        buy_order(undefined, update_buy_price({ buy_price: 2 }))
      ).toMatchSnapshot();
    });

    it("should handle update_sell_price", () => {
      expect(
        buy_order(undefined, update_sell_price({ sell_price: 3 }))
      ).toMatchSnapshot();
    });
  });
});
