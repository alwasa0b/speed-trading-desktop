import sinon, { spy } from "sinon";
import * as actions from "../../app/actions/stop";
import {
  PLACE_STOP_REQUEST_SUCCESS,
  PLACE_STOP_REQUEST
} from "../../app/constants/stop";

describe("stop actions", () => {
  it("should call ipc.send with stop_order", () => {
    const fn = actions.place_stop_loss_order({
      stop_order: {
        instrument: "instrument",
        quantity: "quantity",
        symbol: "symbol"
      },
      price: 100
    });
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), once: spy() };

    fn(dispatch, () => {}, ipc);

    expect(
      ipc.send.calledWith(PLACE_STOP_REQUEST, {
        instrument: "instrument",
        quantity: "quantity",
        symbol: "symbol",
        price: 100
      })
    ).toBe(true);
  });

  it("should start listening to ipc.once", done => {
    const fn = actions.place_stop_loss_order({
      stop_order: {
        instrument: "instrument",
        quantity: "quantity",
        symbol: "symbol"
      },
      price: 100
    });
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), once: spy() };

    fn(dispatch, () => {}, ipc);

    setTimeout(() => {
      expect(
        ipc.once.calledWith(
          PLACE_STOP_REQUEST_SUCCESS,
          sinon.match.typeOf("function")
        )
      ).toBe(true);
      done();
    }, 5);
  });
});
