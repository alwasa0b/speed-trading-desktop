import {
  UPDATE_SELL_ORDER_TYPE_TYPE,
  UPDATE_SELL_ORDER_PRICE_PRICE,
  UPDATE_SELL_ORDER_QUANTITY_TYPE,
  UPDATE_SELL_ORDER_QUANTITY
} from "../constants/sell";

export default (state = {}, action) => {
  switch (action.type) {
    case UPDATE_SELL_ORDER_QUANTITY:
      return {
        ...state,
        [action.symbol]: {
          ...state[action.symbol],
          quantity: action.quantity
        }
      };
    case UPDATE_SELL_ORDER_QUANTITY_TYPE:
      return {
        ...state,
        [action.symbol]: {
          ...state[action.symbol],
          quantity_type: action.quantity_type,
          quantity: ""
        }
      };
    case UPDATE_SELL_ORDER_TYPE_TYPE:
      return {
        ...state,
        [action.symbol]: {
          ...state[action.symbol],
          order_type: action.order_type
        }
      };
    case UPDATE_SELL_ORDER_PRICE_PRICE:
      return {
        ...state,
        [action.symbol]: {
          ...state[action.symbol],
          price: action.price
        }
      };
    default:
      return state;
  }
};
