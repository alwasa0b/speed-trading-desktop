import messages from "../../app/reducers/messages";
import {
  POSITIONS_UPDATED,
  ORDERS_UPDATED,
  PRICE_UPDATED
} from "../../app/constants/messages";

describe("reducers", () => {
  describe("messages", () => {
    it("should handle initial state", () => {
      expect(messages(undefined, {})).toMatchSnapshot();
    });

    it("should handle POSITIONS_UPDATED", () => {
      expect(
        messages(undefined, {
          type: POSITIONS_UPDATED,
          data: [{ symbol: "symbol" }]
        })
      ).toMatchSnapshot();
    });

    it("should handle ORDERS_UPDATED", () => {
      expect(
        messages(undefined, {
          type: ORDERS_UPDATED,
          data: [{ symbol: "symbol" }]
        })
      ).toMatchSnapshot();
    });

    it("should handle PRICE_UPDATED", () => {
      expect(
        messages(undefined, {
          type: PRICE_UPDATED,
          data: 10
        })
      ).toMatchSnapshot();
    });
  });
});
