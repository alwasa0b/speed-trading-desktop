import init from "./workers/util";

export let Robinhood;

export const login = async credentials => {
  Robinhood = await init(credentials);
  return { loggedin: true };
};

export const logout = async credentials => {
  if (Robinhood == null) return;
  Robinhood = await Robinhood.expire_token();
  Robinhood = null;
  return { loggedout: true };
};
