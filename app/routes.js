import React from "react";
import { Switch, Route } from "react-router";
import App from "./containers/App";

export default () => (
  <App>
    <Switch>
      <Route path="/" component={App} />
    </Switch>
  </App>
);
