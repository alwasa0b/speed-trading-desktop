import authentication from "../../app/reducers/authentication";

describe("reducers", () => {
  describe("authentication", () => {
    it("should handle initial state", () => {
      expect(authentication(undefined, {})).toMatchSnapshot();
    });

    it("should handle LOGIN_SUCCESS", () => {
        expect(authentication(undefined, {type:"LOGIN_SUCCESS"})).toMatchSnapshot();
      });
  });
});
