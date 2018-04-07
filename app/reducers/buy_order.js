import {
  UPDATE_QUANTITY,
  UPDATE_SELL_ORDER_TYPE,
  UPDATE_BUY_ORDER_TYPE,
  UPDATE_BUY_PRICE,
  UPDATE_SELL_PRICE
} from "../constants/buy";

export default (
  state = {
    quantity: "",
    sell_order_type: "none",
    sell_price: "",
    buy_order_type: "bid",
    buy_price: ""
  },
  action
) => {
  switch (action.type) {
    case UPDATE_QUANTITY:
      return { ...state, quantity: action.quantity };
    case UPDATE_SELL_ORDER_TYPE:
      return { ...state, sell_order_type: action.sell_order_type };
    case UPDATE_BUY_ORDER_TYPE:
      return { ...state, buy_order_type: action.buy_order_type };
    case UPDATE_BUY_PRICE:
      return { ...state, buy_price: action.buy_price };
    case UPDATE_SELL_PRICE:
      return { ...state, sell_price: action.sell_price };
    default:
      return state;
  }
}
