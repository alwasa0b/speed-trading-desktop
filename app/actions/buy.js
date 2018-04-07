import {
  PLACE_BUY_REQUEST_SUCCESS,
  UPDATE_QUANTITY,
  UPDATE_SELL_ORDER_TYPE,
  UPDATE_BUY_ORDER_TYPE,
  UPDATE_BUY_PRICE,
  UPDATE_SELL_PRICE,
  PLACE_BUY_REQUEST
} from "../constants/buy";
const { ipcRenderer } = require("electron");

const buy_order_success = () => ({ type: PLACE_BUY_REQUEST_SUCCESS });
export const place_buy_order = () => async (dispatch, getState) => {
  const { buy_order, messages } = getState();
  const { instrument, symbol } = messages.price;

  await ipcRenderer.send(PLACE_BUY_REQUEST, {
    ...buy_order,
    instrument,
    symbol
  });

  ipcRenderer.once(PLACE_BUY_REQUEST_SUCCESS, async (event, data) => {
    dispatch(buy_order_success(data));
  });
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
