import {
  PLACE_SELL_REQUEST_SUCCESS,
  PLACE_SELL_REQUEST,
  UPDATE_SELL_ORDER_TYPE_TYPE,
  UPDATE_SELL_ORDER_PRICE_PRICE,
  UPDATE_SELL_ORDER_QUANTITY,
  UPDATE_SELL_ORDER_QUANTITY_TYPE
} from "../constants/sell";
import { ipcRenderer } from "electron";

const sell_order_success = () => ({ type: PLACE_SELL_REQUEST_SUCCESS });
export const place_sell_order = ({
  sell_order,
  price,
  order_type,
  quantity,
  quantity_type
}) => async dispatch => {
  const {
    instrument,
    symbol,
    quantity: total_quantity,
    shares_held_for_sells
  } = sell_order;

  await ipcRenderer.send(PLACE_SELL_REQUEST, {
    price,
    order_type,
    requested_quantity: quantity,
    instrument,
    symbol,
    quantity_type,
    total_quantity,
    shares_held_for_sells
  });

  ipcRenderer.once(PLACE_SELL_REQUEST_SUCCESS, async (event, data) => {
    dispatch(sell_order_success(data));
  });
};

export const update_sell_order_type = ({ order_type, symbol }) => {
  return { type: UPDATE_SELL_ORDER_TYPE_TYPE, order_type, symbol };
};

export const update_sell_order_price = ({ price, symbol }) => {
  return { type: UPDATE_SELL_ORDER_PRICE_PRICE, price, symbol };
};

export const update_quantity = ({ quantity, symbol }) => ({
  type: UPDATE_SELL_ORDER_QUANTITY,
  quantity,
  symbol
});

export const update_quantity_type = ({ quantity_type, symbol }) => ({
  type: UPDATE_SELL_ORDER_QUANTITY_TYPE,
  quantity_type,
  symbol
});
