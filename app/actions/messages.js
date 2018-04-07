import {
  UPDATE_POSITIONS,
  UPDATE_ORDERS,
  UPDATE_PRICE,
  PRICE_UPDATED,
  POSITIONS_UPDATED,
  ORDERS_UPDATED
} from "../constants/messages";

const { ipcRenderer } = require("electron");

export const update_positions = () => async dispatch => {
  await ipcRenderer.removeAllListeners(POSITIONS_UPDATED);
  await ipcRenderer.send(UPDATE_POSITIONS);

  ipcRenderer.on(POSITIONS_UPDATED, async (event, data) => {
    dispatch({ type: POSITIONS_UPDATED, data });
  });
};

export const update_orders = () => async dispatch => {
  await ipcRenderer.removeAllListeners(ORDERS_UPDATED);
  await ipcRenderer.send(UPDATE_ORDERS);

  ipcRenderer.on(ORDERS_UPDATED, async (event, data) => {
    dispatch({ type: ORDERS_UPDATED, data });
  });
};

export const update_price = ({ symbol }) => async (dispatch, getState) => {
  await ipcRenderer.removeAllListeners(PRICE_UPDATED);
  await ipcRenderer.send(UPDATE_PRICE, { symbol });

  ipcRenderer.on(PRICE_UPDATED, async (event, data) => {
    dispatch({ type: PRICE_UPDATED, data });
  });
};
