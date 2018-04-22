import sinon, { spy } from "sinon";
import * as actions from "../../app/actions/login";
import { LOGIN_REQUEST, LOGIN_SUCCESS } from "../../app/constants/login";

describe("login actions", () => {
  it("update_username should create update_username action", () => {
    expect(
      actions.update_username({
        username: "test_username"
      })
    ).toMatchSnapshot();
  });

  it("update_password should create update_password action", () => {
    expect(
      actions.update_password({
        password: "test_password"
      })
    ).toMatchSnapshot();
  });

  it("should call ipc.send with stop_order", () => {
    const fn = actions.login();
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), once: spy() };

    fn(
      dispatch,
      () => ({ login: { username: "test_user", password: "test_password" } }),
      ipc
    );

    expect(
      ipc.send.calledWith(LOGIN_REQUEST, {
        login: { username: "test_user", password: "test_password" }
      })
    ).toBe(true);
  });

  it("should start listening to ipc.once", done => {
    const fn = actions.login();
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const ipc = { send: spy(), once: spy() };

    fn(
      dispatch,
      () => ({ login: { username: "test_user", password: "test_password" } }),
      ipc
    );

    setTimeout(() => {
      expect(
        ipc.once.calledWith(LOGIN_SUCCESS, sinon.match.typeOf("function"))
      ).toBe(true);
      done();
    }, 5);
  });
});
