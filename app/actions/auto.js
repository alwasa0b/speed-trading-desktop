import {
  UPDATE_TIME_INTERVAL,
  UPDATE_UNDER_BID_PRICE,
  UPDATE_OVER_ASK_PRICE,
  UPDATE_QUANTITY_AUTO,
  NUMBER_OF_RUNS
} from "../constants/auto";
import {
  START_WORKER,
  WORKER_STARTED,
  STOP_WORKER,
  WORKER_STOPPED
} from "../constants/messages";

const { ipcRenderer } = require("electron");

export const update_number_of_runs = payload => ({
  type: NUMBER_OF_RUNS,
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
  const { instrument, symbol } = messages.price;

  ipc.once(WORKER_STARTED, async event => {
    dispatch({ type: WORKER_STARTED });
  });

  ipc.once(WORKER_STOPPED, async event => {
    dispatch({ type: WORKER_STOPPED });
  });

  await ipc.send(START_WORKER, {
    ...auto_order,
    instrument,
    symbol
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
