import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  UPDATE_USERNAME,
  UPDATE_PASSWORD
} from "../constants/login";
// import * as service from "./service";
const { ipcRenderer } = require("electron");

const login_success = () => ({ type: LOGIN_SUCCESS });
const login_failed = () => ({ type: LOGIN_FAILURE });

export const login = () => async (dispatch, getState) => {
  await ipcRenderer.send("login", { login: getState().login });
  dispatch(login_success());
};


export const update_username = ({ username }) => ({
  type: UPDATE_USERNAME,
  username
});

export const update_password = ({ password }) => ({
  type: UPDATE_PASSWORD,
  password
});
