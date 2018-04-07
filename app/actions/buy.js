import {
  PLACE_BUY_REQUEST_SUCCESS,
  UPDATE_QUANTITY,
  UPDATE_SELL_ORDER_TYPE,
  UPDATE_BUY_ORDER_TYPE,
  UPDATE_BUY_PRICE,
  UPDATE_SELL_PRICE
} from "../constants/buy";
// import * as service from "./service";

const buy_order_success = () => ({ type: PLACE_BUY_REQUEST_SUCCESS });
export const place_buy_order = () => async (dispatch, getState) => {
  const { buy_order, messages } = getState();
  const { instrument, symbol } = messages.price;
  // const buy_order_response = await service.place_buy_order({
  //   buy_order: {
  //     ...buy_order,
  //     instrument,
  //     symbol
  //   }
  // });
  dispatch(buy_order_success(buy_order_response));
};

export const update_quantity = ({ quantity }) => ({
  type: UPDATE_QUANTITY,
  quantity
});

export const update_sell_order_type = ({ sell_order_type }) => ({
  type: UPDATE_SELL_ORDER_TYPE,
  sell_order_type
});

export const update_buy_order_type = ({ buy_order_type }) => ({
  type: UPDATE_BUY_ORDER_TYPE,
  buy_order_type
});

export const update_buy_price = ({ buy_price }) => ({
  type: UPDATE_BUY_PRICE,
  buy_price
});

export const update_sell_price = ({ sell_price }) => ({
  type: UPDATE_SELL_PRICE,
  sell_price
});
