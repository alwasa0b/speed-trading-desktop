import {
    POSITIONS_UPDATED,
    ORDERS_UPDATED,
    PRICE_UPDATED
  } from "../constants/messages";


export default (state = {}, action) => {
    switch (action.type) {
      case POSITIONS_UPDATED:
        return { ...state, positions: action.data };
      case ORDERS_UPDATED:
        return { ...state, orders: action.data };
      case PRICE_UPDATED:
        return { ...state, price: action.data };
      default:
        return state;
    }
  }
  