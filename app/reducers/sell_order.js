import {
  UPDATE_SELL_ORDER_TYPE_TYPE,
  UPDATE_SELL_ORDER_PRICE_PRICE
} from "../constants/sell";

export default (
  state = {
    order_type: "bid",
    price: 0
  },
  action
) => {
  switch (action.type) {
    case UPDATE_SELL_ORDER_TYPE_TYPE:
      return { ...state, order_type: action.order_type };
    case UPDATE_SELL_ORDER_PRICE_PRICE:
      return { ...state, price: action.price };
    default:
      return state;
  }
};
