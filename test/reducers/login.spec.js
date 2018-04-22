import login from "../../app/reducers/login";
import { update_username, update_password } from "../../app/actions/login";

describe("reducers", () => {
  describe("login", () => {
    it("should handle initial state", () => {
      expect(login(undefined, {})).toMatchSnapshot();
    });

    it("should handle update_username", () => {
      expect(
        login(undefined, update_username({ username: "test_username" }))
      ).toMatchSnapshot();
    });

    it("should handle update_password", () => {
      expect(
        login(undefined, update_password({ password: "test_password" }))
      ).toMatchSnapshot();
    });
  });
});
