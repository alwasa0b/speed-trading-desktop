import {
  PLACE_SELL_REQUEST_SUCCESS,
  PLACE_SELL_REQUEST,
  UPDATE_SELL_ORDER_TYPE_TYPE,
  UPDATE_SELL_ORDER_PRICE_PRICE
} from "../constants/sell";
import { ipcRenderer } from "electron";

const sell_order_success = () => ({ type: PLACE_SELL_REQUEST_SUCCESS });
export const place_sell_order = ({ sell_order }) => async (
  dispatch,
  getState
) => {
  const { instrument, quantity, symbol } = sell_order;

  await ipcRenderer.send(PLACE_SELL_REQUEST, {
    ...getState().sell_order,
    quantity,
    instrument,
    symbol
  });

  ipcRenderer.once(PLACE_SELL_REQUEST_SUCCESS, async (event, data) => {
    dispatch(sell_order_success(data));
  });
};

export const update_sell_order_type = ({ order_type }) => {
  return { type: UPDATE_SELL_ORDER_TYPE_TYPE, order_type };
};

export const update_sell_order_price = ({ price }) => {
  return { type: UPDATE_SELL_ORDER_PRICE_PRICE, price };
};
