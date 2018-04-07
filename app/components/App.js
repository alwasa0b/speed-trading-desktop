import React from "react";
import "../styles/App.css";
import Home from "../containers/Home";
import Login from "../containers/Login";

export default ({ loggedIn }) => <div>{loggedIn ? <Home /> : <Login />}</div>;
