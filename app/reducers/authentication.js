import { LOGIN_SUCCESS } from "../constants/login";

export default (state = { loggedIn: false }, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        loggedIn: true
      };
    default:
      return state;
  }
};
