import sinon, { spy } from "sinon";
import * as actions from "../../app/actions/sell";
import {
  PLACE_SELL_REQUEST_SUCCESS,
  PLACE_SELL_REQUEST
} from "../../app/constants/sell";

describe("sell actions", () => {
  it("update_sell_order_type should create update_sell_order_type action", () => {
    expect(
      actions.update_sell_order_type({
        order_type: "test_type",
        symbol: "test_symbol"
      })
    ).toMatchSnapshot();
  });

  it("update_sell_order_price should create update_sell_order_price action", () => {
    expect(
      actions.update_sell_order_price({
        price: 100,
        symbol: "test_symbol"
      })
    ).toMatchSnapshot();
  });

  it("update_quantity should create update_quantity action", () => {
    expect(
      actions.update_quantity({
        quantity: 100,
        symbol: "test_symbol"
      })
    ).toMatchSnapshot();
  });

  it("update_quantity_type should create update_quantity_type action", () => {
    expect(
      actions.update_quantity_type({
        quantity_type: "test_quantity_type",
        symbol: "test_symbol",
        quantity: 100
      })
    ).toMatchSnapshot();
  });

  it("should call ipc.send with sell_order", () => {
    const fn = actions.place_sell_order({
      sell_order: {
        instrument: "instrument",
        symbol: "symbol",
        quantity: "total_quantity",
        shares_held_for_sells: "shares_held_for_sells"
      },
      price: 0,
      order_type: "order_type",
      quantity: "requested_quantity",
      quantity_type: "order_type"
    });
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), once: spy() };

    fn(dispatch, () => {}, ipc);

    expect(
      ipc.send.calledWith(PLACE_SELL_REQUEST, {
        price: 0,
        order_type: "order_type",
        requested_quantity: "requested_quantity",
        instrument: "instrument",
        symbol: "symbol",
        quantity_type: "order_type",
        total_quantity: "total_quantity",
        shares_held_for_sells: "shares_held_for_sells"
      })
    ).toBe(true);
  });

  it("should start listening to ipc.once", done => {
    const fn = actions.place_sell_order({
      sell_order: {
        instrument: "instrument",
        symbol: "symbol",
        quantity: "total_quantity",
        shares_held_for_sells: "shares_held_for_sells"
      },
      price: 0,
      order_type: "order_type",
      quantity: "requested_quantity",
      quantity_type: "order_type"
    });
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), once: spy() };

    fn(dispatch, () => {}, ipc);

    setTimeout(() => {
      expect(
        ipc.once.calledWith(
          PLACE_SELL_REQUEST_SUCCESS,
          sinon.match.typeOf("function")
        )
      ).toBe(true);
      done();
    }, 5);
  });
});
