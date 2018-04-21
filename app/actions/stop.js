import {
  PLACE_STOP_REQUEST,
  PLACE_STOP_REQUEST_SUCCESS
} from "../constants/stop";

import { ipcRenderer } from "electron";

const stop_order_success = () => ({ type: PLACE_STOP_REQUEST_SUCCESS });
export const place_stop_loss_order = ({
  stop_order,
  price,
  order_type
}) => async dispatch => {
  const { instrument, quantity, symbol } = stop_order;

  await ipcRenderer.send(PLACE_STOP_REQUEST, {
    price,
    order_type,
    quantity,
    instrument,
    symbol
  });

  ipcRenderer.once(PLACE_STOP_REQUEST_SUCCESS, async (event, data) => {
    dispatch(stop_order_success(data));
  });
};
