import {
  UPDATE_TIME_INTERVAL,
  UPDATE_UNDER_BID_PRICE,
  UPDATE_OVER_ASK_PRICE,
  UPDATE_QUANTITY_AUTO,
  NUMBER_OF_RUNS,
  UPDATE_NUMBER_OF_OPEN_ORDERS,
  UPDATE_PAUSE_PRICE,
  CLEAR
} from "../constants/auto";

import {
  START_WORKER,
  WORKER_STARTED,
  STOP_WORKER,
  WORKER_STOPPED,
  PAUSE_WORKER,
  UPDATE_WORKER,
  WORKER_UPDATED,
  WORKER_PAUSED,
  WORKER_RESUMED,
  RESUME_WORKER,
  PANIC
} from "../constants/messages";

const { ipcRenderer } = require("electron");

export const update_pause_price = payload => ({
  type: UPDATE_PAUSE_PRICE,
  payload
});

export const update_number_of_runs = payload => ({
  type: NUMBER_OF_RUNS,
  payload
});

export const update_number_of_open_orders = payload => ({
  type: UPDATE_NUMBER_OF_OPEN_ORDERS,
  payload
});

export const update_time_interval = payload => ({
  type: UPDATE_TIME_INTERVAL,
  payload
});

export const update_under_bid_price = payload => ({
  type: UPDATE_UNDER_BID_PRICE,
  payload
});

export const update_over_ask_price = payload => ({
  type: UPDATE_OVER_ASK_PRICE,
  payload
});

export const update_quantity = payload => ({
  type: UPDATE_QUANTITY_AUTO,
  payload
});

export const startStopWorker = () => (dispatch, getState) => {
  const { auto_order } = getState();
  if (auto_order.running) stop_worker(dispatch, getState);
  else start_worker(dispatch, getState);
};

const start_worker = async (dispatch, getState, ipc = ipcRenderer) => {
  const { auto_order, messages } = getState();
  const { instrument, symbol, price, high } = messages.price;

  ipc.once(WORKER_STARTED, async event => {
    dispatch({ type: WORKER_STARTED });
  });

  ipc.once(WORKER_STOPPED, async event => {
    dispatch({ type: WORKER_STOPPED });
  });

  await ipc.send(START_WORKER, {
    ...auto_order,
    messages: [],
    instrument,
    symbol,
    price,
    high
  });
};

const stop_worker = async (dispatch, getState, ipc = ipcRenderer) => {
  const { auto_order, messages } = getState();
  const { instrument, symbol } = messages.price;

  await ipc.send(STOP_WORKER, {
    ...auto_order,
    instrument,
    symbol
  });
};

export const pause_resume_worker = () => (dispatch, getState) => {
  const { auto_order } = getState();
  if (auto_order.paused) resume_worker(dispatch, getState);
  else pause_worker(dispatch, getState);
};

const resume_worker = async (dispatch, getState, ipc = ipcRenderer) => {
  await ipc.send(RESUME_WORKER);
};

const pause_worker = async (dispatch, getState, ipc = ipcRenderer) => {
  ipc.once(WORKER_PAUSED, async event => {
    dispatch({ type: WORKER_PAUSED });
  });
  ipc.once(WORKER_RESUMED, async event => {
    dispatch({ type: WORKER_RESUMED });
  });
  await ipc.send(PAUSE_WORKER);
};

export const update_worker = () => async (
  dispatch,
  getState,
  ipc = ipcRenderer
) => {
  const { auto_order, messages } = getState();
  const { instrument, symbol } = messages.price;

  ipc.once(WORKER_UPDATED, async event => {
    dispatch({ type: WORKER_UPDATED });
  });

  await ipc.send(UPDATE_WORKER, {
    ...auto_order,
    instrument,
    symbol
  });
};

export const panic = () => async (dispatch, getState, ipc = ipcRenderer) => {
  await ipc.send(PANIC);
};

export const clear = () => ({ type: CLEAR });
