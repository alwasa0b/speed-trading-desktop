import sinon, { spy } from "sinon";
import * as actions from "../../app/actions/messages";
import {
  UPDATE_POSITIONS,
  UPDATE_ORDERS,
  UPDATE_PRICE,
  PRICE_UPDATED,
  POSITIONS_UPDATED,
  ORDERS_UPDATED
} from "../../app/constants/messages";

describe("messages actions", () => {
  it("should call ipc.removeAllListeners with POSITIONS_UPDATED", done => {
    const fn = actions.update_positions();
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), on: spy(), removeAllListeners: spy() };

    fn(dispatch, () => {}, ipc);

    setTimeout(() => {
      expect(ipc.removeAllListeners.calledWith(POSITIONS_UPDATED)).toBe(true);
      done();
    }, 5);
  });

  it("should call ipc.send with UPDATE_POSITIONS", done => {
    const fn = actions.update_positions();
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), on: spy(), removeAllListeners: spy() };

    fn(dispatch, () => {}, ipc);

    setTimeout(() => {
      expect(ipc.send.calledWith(UPDATE_POSITIONS)).toBe(true);
      done();
    }, 5);
  });

  it("should start listening to ipc.on POSITIONS_UPDATED", done => {
    const fn = actions.update_positions();
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), on: spy(), removeAllListeners: spy() };

    fn(dispatch, () => {}, ipc);

    setTimeout(() => {
      expect(
        ipc.on.calledWith(POSITIONS_UPDATED, sinon.match.typeOf("function"))
      ).toBe(true);
      done();
    }, 5);
  });

  it("should call ipc.removeAllListeners with ORDERS_UPDATED", done => {
    const fn = actions.update_orders();
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), on: spy(), removeAllListeners: spy() };

    fn(dispatch, () => {}, ipc);

    setTimeout(() => {
      expect(ipc.removeAllListeners.calledWith(ORDERS_UPDATED)).toBe(true);
      done();
    }, 5);
  });

  it("should call ipc.send with UPDATE_ORDERS", done => {
    const fn = actions.update_orders();
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), on: spy(), removeAllListeners: spy() };

    fn(dispatch, () => {}, ipc);

    setTimeout(() => {
      expect(ipc.send.calledWith(UPDATE_ORDERS)).toBe(true);
      done();
    }, 5);
  });

  it("should start listening to ipc.on ORDERS_UPDATED", done => {
    const fn = actions.update_orders();
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), on: spy(), removeAllListeners: spy() };

    fn(dispatch, () => {}, ipc);

    setTimeout(() => {
      expect(
        ipc.on.calledWith(ORDERS_UPDATED, sinon.match.typeOf("function"))
      ).toBe(true);
      done();
    }, 5);
  });

  it("should call ipc.removeAllListeners with PRICE_UPDATED", done => {
    const fn = actions.update_price({ symbol: "test_symbol" });
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), on: spy(), removeAllListeners: spy() };

    fn(dispatch, () => {}, ipc);

    setTimeout(() => {
      expect(ipc.removeAllListeners.calledWith(PRICE_UPDATED)).toBe(true);
      done();
    }, 5);
  });

  it("should call ipc.send with UPDATE_PRICE", done => {
    const fn = actions.update_price({ symbol: "test_symbol" });
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), on: spy(), removeAllListeners: spy() };

    fn(dispatch, () => {}, ipc);

    setTimeout(() => {
      expect(ipc.send.calledWith(UPDATE_PRICE, { symbol: "test_symbol" })).toBe(
        true
      );
      done();
    }, 5);
  });

  it("should start listening to ipc.on PRICE_UPDATED", done => {
    const fn = actions.update_price({ symbol: "test_symbol" });
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), on: spy(), removeAllListeners: spy() };

    fn(dispatch, () => {}, ipc);

    setTimeout(() => {
      expect(
        ipc.on.calledWith(PRICE_UPDATED, sinon.match.typeOf("function"))
      ).toBe(true);
      done();
    }, 5);
  });
});
