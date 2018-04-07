import {
  PLACE_SELL_REQUEST_SUCCESS,
  UPDATE_SELL_ORDER_TYPE_TYPE,
  UPDATE_SELL_ORDER_PRICE_PRICE
} from "../constants/sell";
// import * as service from "./service";

const sell_order_success = () => ({ type: PLACE_SELL_REQUEST_SUCCESS });
export const place_sell_order = ({ sell_order }) => async (
  dispatch,
  getState
) => {
  const { instrument, quantity, symbol } = sell_order;
  // const sell_order_response = await service.place_sell_order({
  //   sell_order: {
  //     ...getState().sell_order,
  //     quantity,
  //     instrument,
  //     symbol
  //   }
  // });
  
  dispatch(sell_order_success(sell_order_response));
};

export const update_sell_order_type = ({ order_type }) => {
  return { type: UPDATE_SELL_ORDER_TYPE_TYPE, order_type };
};

export const update_sell_order_price = ({ price }) => {
  return { type: UPDATE_SELL_ORDER_PRICE_PRICE, price };
};
