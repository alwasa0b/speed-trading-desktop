import sinon, { spy } from "sinon";
import * as actions from "../../app/actions/buy";
import {
  PLACE_BUY_REQUEST_SUCCESS,
  PLACE_BUY_REQUEST
} from "../../app/constants/buy";

describe("buy actions", () => {
  it("buy_order_success should create buy_order_success action", () => {
    expect(actions.buy_order_success()).toMatchSnapshot();
  });

  it("update_quantity should create update_quantity action with passed quantity", () => {
    expect(actions.update_quantity({ quantity: 50 })).toMatchSnapshot();
  });

  it("update_quantity_type should create update_quantity_type action with passed quantity_type", () => {
    expect(
      actions.update_quantity_type({ quantity_type: "count" })
    ).toMatchSnapshot();
  });

  it("update_sell_order_type should create update_sell_order_type action with passed sell_order_type", () => {
    expect(
      actions.update_sell_order_type({ sell_order_type: "bid" })
    ).toMatchSnapshot();
  });

  it("update_buy_order_type should create update_buy_order_type action with passed buy_order_type", () => {
    expect(
      actions.update_buy_order_type({ buy_order_type: "stop" })
    ).toMatchSnapshot();
  });

  it("update_buy_price should create update_buy_price action with passed buy_price", () => {
    expect(actions.update_buy_price({ buy_price: 10 })).toMatchSnapshot();
  });

  it("update_sell_price should create update_sell_price action with passed sell_price", () => {
    expect(actions.update_sell_price({ sell_price: 10 })).toMatchSnapshot();
  });

  it("should call ipc.send with buy_order", () => {
    const fn = actions.place_buy_order();
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), once: spy() };
    const getState = () => ({
      buy_order: { price: 10 },
      messages: {
        price: { instrument: "test_instrument", symbol: "test_symbol" }
      }
    });

    fn(dispatch, getState, ipc);

    expect(
      ipc.send.calledWith(PLACE_BUY_REQUEST, {
        price: 10,
        instrument: "test_instrument",
        symbol: "test_symbol"
      })
    ).toBe(true);
  });

  it("should start listening to ipc.once", done => {
    const fn = actions.place_buy_order();
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), once: spy() };
    const getState = () => ({
      buy_order: { price: 10 },
      messages: {
        price: { instrument: "test_instrument", symbol: "test_symbol" }
      }
    });
    fn(dispatch, getState, ipc);

    setTimeout(() => {
      expect(
        ipc.once.calledWith(
          PLACE_BUY_REQUEST_SUCCESS,
          sinon.match.typeOf("function")
        )
      ).toBe(true);
      done();
    }, 5);
  });
});
