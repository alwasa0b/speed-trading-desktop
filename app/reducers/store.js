import { createStore, applyMiddleware } from "redux";
import reducers from "./";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import socket from "./socket";

const composeEnhancers = composeWithDevTools({});

const store = createStore(
  reducers,
  composeEnhancers(applyMiddleware(thunk, socket))
);

export default store;
