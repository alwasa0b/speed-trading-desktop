import sinon, { spy } from "sinon";
import * as actions from "../../app/actions/cancel";
import {
  PLACE_CANCEL_REQUEST_SUCCESS,
  PLACE_CANCEL_REQUEST
} from "../../app/constants/cancel";

describe("cancel actions", () => {
  it("should call ipc.send with cancel_order", () => {
    const fn = actions.place_cancel_order({
      cancel_order: {
        instrument: "instrument",
        symbol: "symbol"
      }
    });
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), once: spy() };

    fn(dispatch, () => {}, ipc);

    expect(
      ipc.send.calledWith(PLACE_CANCEL_REQUEST, {
        instrument: "instrument",
        symbol: "symbol"
      })
    ).toBe(true);
  });

  it("should start listening to ipc.once", done => {
    const fn = actions.place_cancel_order({
      cancel_order: {
        instrument: "instrument",
        symbol: "symbol"
      }
    });
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), once: spy() };

    fn(dispatch, () => {}, ipc);

    setTimeout(() => {
      expect(
        ipc.once.calledWith(
          PLACE_CANCEL_REQUEST_SUCCESS,
          sinon.match.typeOf("function")
        )
      ).toBe(true);
      done();
    }, 5);
  });
});
