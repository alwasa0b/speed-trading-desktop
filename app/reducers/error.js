import { UPDATE_USERNAME, UPDATE_PASSWORD } from "../constants/login";

export default (
  state = {
    username: "",
    password: ""
  },
  action
) => {
  switch (action.type) {
    case UPDATE_USERNAME:
      return { ...state, username: action.username };
    case UPDATE_PASSWORD:
      return { ...state, password: action.password };
    default:
      return state;
  }
}
