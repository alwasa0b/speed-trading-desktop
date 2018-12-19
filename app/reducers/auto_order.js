import {
  UPDATE_TIME_INTERVAL,
  UPDATE_UNDER_BID_PRICE,
  UPDATE_OVER_ASK_PRICE,
  UPDATE_QUANTITY_AUTO,
  NUMBER_OF_RUNS
} from "../constants/auto";

import {
  WORKER_STARTED,
  WORKER_STOPPED,
  PROGRESS_UPDATE
} from "../constants/messages";

export default (
  state = {
    time_interval: 60,
    under_bid_price: 0.15,
    over_my_price: 0.15,
    quantity: 10,
    running: false,
    messages: []
  },
  action
) => {
  switch (action.type) {
    case NUMBER_OF_RUNS:
      return { ...state, number_of_runs: parseNumber(action.payload) };
    case UPDATE_TIME_INTERVAL:
      return { ...state, time_interval: parseNumber(action.payload) };
    case UPDATE_UNDER_BID_PRICE:
      return { ...state, under_bid_price: parseNumber(action.payload) };
    case UPDATE_OVER_ASK_PRICE:
      return { ...state, over_my_price: parseNumber(action.payload) };
    case UPDATE_QUANTITY_AUTO:
      return { ...state, quantity: parseNumber(action.payload) };
    case WORKER_STARTED:
      return { ...state, running: true };
    case WORKER_STOPPED:
      return { ...state, running: false };
    case PROGRESS_UPDATE:
      let messages = [...state.messages, action.payload.message];
      return { ...state, messages };
    default:
      return state;
  }
};

function parseNumber(payload) {
  return payload !== "" ? Number(payload) : "";
}
