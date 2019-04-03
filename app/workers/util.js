import { logger } from "../logger";
import promiseRetry from "promise-retry";

const promisfy = (origFn, key) => (...callArgs) => {
  return promiseRetry({ retries: 5 }, (retry, number) => {
    if (number > 1)
      logger.error(`reattempting ${key} ${JSON.stringify(callArgs)}`);

    return new Promise((resolve, reject) => {
      origFn.apply(null, [
        ...callArgs,
        (error, response, body) => {
          return error || !body || response.statusCode > 399
            ? reject(error || { message: body.detail })
            : resolve(body);
        }
      ]);
    }).catch(err => {
      if (err.code === "ETIMEDOUT" || err.code === "ENOTFOUND") {
        retry(err);
      }

      throw err;
    });
  });
};

export default ({ username, password }) => {
  return new Promise(resolve => {
    const Robinhood = require("robinhood")(
      {
        username,
        password
      },
      () => {
        Object.keys(Robinhood).forEach(key => {
          const origFn = Robinhood[key];
          Robinhood[key] = promisfy(origFn, key);
        });
        resolve(Robinhood);
      }
    );
  });
};

export const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

export const active = ({ order }) =>
  order.state !== "cancelled" &&
  order.state !== "rejected" &&
  order.state !== "filled" &&
  order.state !== "error";

export const activeOrders = orders => orders.filter(active);

export function roundIt(value) {
  return Number((Math.round(Math.floor(value * 10000)) / 10000).toFixed(2));
}

export const cancel = async b => await b.cancel();
