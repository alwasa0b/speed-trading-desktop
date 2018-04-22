import {
  UPDATE_SELL_ORDER_TYPE_TYPE,
  UPDATE_SELL_ORDER_PRICE_PRICE,
  UPDATE_SELL_ORDER_QUANTITY_TYPE,
  UPDATE_SELL_ORDER_QUANTITY
} from "../constants/sell";

import { POSITIONS_UPDATED } from "../constants/messages";

export default (state = {}, action) => {
  switch (action.type) {
    case POSITIONS_UPDATED:
      if (Object.keys(state).length !== action.data.length)
        return action.data.reduce(
          (p, n) => ({
            ...p,
            [n.symbol]: {
              quantity: Math.floor(
                (state[n.symbol] || {}).quantity || n.quantity
              ),
              quantity_type: (state[n.symbol] || {}).quantity_type || "count"
            }
          }),
          {}
        );
      return state;
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
          quantity: 0
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
