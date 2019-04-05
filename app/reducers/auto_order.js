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
  WORKER_STARTED,
  WORKER_STOPPED,
  PROGRESS_UPDATE,
  TICKER_UPDATED,
  WORKER_PAUSED,
  WORKER_RESUMED,
  TOGGLE_LOCKED
} from "../constants/messages";

export default (
  state = {
    time_interval: 260,
    under_bid_price: ".3, .8, 1.8, 3",
    over_my_price: ".03, .08, .03, 0",
    quantity: "10, 15, 30, 45",
    running: false,
    messages: [],
    number_of_open_orders: 3,
    number_of_runs: 500,
    pause_price: 0,
    ticker: "",
    paused: false,
    locked: true
  },
  action
) => {
  switch (action.type) {
    case TICKER_UPDATED:
      return { ...state, ticker: action.payload };
    case UPDATE_PAUSE_PRICE:
      return { ...state, pause_price: parseNumber(action.payload) };
    case UPDATE_NUMBER_OF_OPEN_ORDERS:
      return { ...state, number_of_open_orders: parseNumber(action.payload) };
    case NUMBER_OF_RUNS:
      return { ...state, number_of_runs: parseNumber(action.payload) };
    case UPDATE_TIME_INTERVAL:
      return { ...state, time_interval: parseNumber(action.payload) };
    case UPDATE_UNDER_BID_PRICE:
      return { ...state, under_bid_price: action.payload };
    case UPDATE_OVER_ASK_PRICE:
      return { ...state, over_my_price: action.payload };
    case UPDATE_QUANTITY_AUTO:
      return { ...state, quantity: action.payload };
    case WORKER_STARTED:
      return { ...state, running: true };
    case WORKER_STOPPED:
      return { ...state, running: false };
    case WORKER_PAUSED:
      return { ...state, paused: true };
    case WORKER_RESUMED:
      return { ...state, paused: false };
    case TOGGLE_LOCKED:
      return { ...state, locked: !state.locked };
    case PROGRESS_UPDATE:
      let messages = [...state.messages, action.payload];
      return { ...state, messages };
    case CLEAR:
      return { ...state, messages: [] };
    default:
      return state;
  }
};

function parseNumber(payload) {
  return payload !== "" ? Number(payload) : "";
}
