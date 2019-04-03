import init, { timeout } from "./workers/util";

export let Robinhood;

export const login = async credentials => {
  Robinhood = await init(credentials);
  return { loggedin: true };
};

export const logout = async credentials => {
  await timeout(2000);
  if (Robinhood == null) return;
  Robinhood = await Robinhood.expire_token();
  Robinhood = null;
  return { loggedout: true };
};
