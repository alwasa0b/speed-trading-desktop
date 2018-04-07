import React from "react";
import Home from "../containers/Home";
import Login from "../containers/Login";

export default ({ loggedIn }) => <div>{loggedIn ? <Home /> : <Login />}</div>;
