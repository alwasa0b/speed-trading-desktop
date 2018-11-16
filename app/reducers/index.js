import { combineReducers } from "redux";
import authentication from "./authentication";
import messages from "./messages";
import buy_order from "./buy_order";
import sell_orders from "./sell_orders";
import login from "./login";
import auto_order from "./auto_order";

export default combineReducers({
  authentication,
  messages,
  buy_order,
  sell_orders,
  login,
  auto_order
});
