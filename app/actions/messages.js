import {
  UPDATE_POSITIONS,
  UPDATE_ORDERS,
  UPDATE_PRICE,
  PRICE_UPDATED,
  POSITIONS_UPDATED,
  ORDERS_UPDATED,
  PROGRESS_UPDATE,
  START_LOGGING,
  TICKER_UPDATED
} from "../constants/messages";

const { ipcRenderer } = require("electron");

export const start_logging = () => async (
  dispatch,
  getState,
  ipc = ipcRenderer
) => {
  await ipc.removeAllListeners(PROGRESS_UPDATE);
  ipc.on(PROGRESS_UPDATE, async (event, payload) => {
    dispatch({ type: PROGRESS_UPDATE, payload });
  });
  await ipc.send(START_LOGGING);
};

export const update_positions = () => async (
  dispatch,
  getState,
  ipc = ipcRenderer
) => {
  await ipc.removeAllListeners(POSITIONS_UPDATED);
  await ipc.send(UPDATE_POSITIONS);

  ipc.on(POSITIONS_UPDATED, async (event, data) => {
    dispatch({ type: POSITIONS_UPDATED, data });
  });
};

export const update_orders = () => async (
  dispatch,
  getState,
  ipc = ipcRenderer
) => {
  await ipc.removeAllListeners(ORDERS_UPDATED);
  await ipc.send(UPDATE_ORDERS);

  ipc.on(ORDERS_UPDATED, async (event, data) => {
    dispatch({ type: ORDERS_UPDATED, data });
  });
};

export const update_price = ({ symbol }) => async (
  dispatch,
  getState,
  ipc = ipcRenderer
) => {
  await ipc.removeAllListeners(PRICE_UPDATED);
  await ipc.send(UPDATE_PRICE, { symbol });
  dispatch({ type: TICKER_UPDATED, payload: symbol });

  ipc.on(PRICE_UPDATED, async (event, data) => {
    dispatch({ type: PRICE_UPDATED, data });
  });
};
