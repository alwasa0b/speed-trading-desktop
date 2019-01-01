const retryPromise = fn => {
  let count = 10;
  const attempt = async (...callArgs) => {
    try {
      return await fn(...callArgs);
    } catch (e) {
      console.log("reattempting ", callArgs);
      if (count === 10) return { error: true };
      count -= 1;
      return await fn(...callArgs);
    }
  };

  return attempt;
};

export default ({ username, password }) => {
  return new Promise(resolve => {
    const Robinhood = require("robinhood")(
      {
        username,
        password
      },
      () => {
        // promisfy all functions
        Object.keys(Robinhood).forEach(key => {
          // console.log('key', key);
          const origFn = Robinhood[key];
          Robinhood[key] = promisfy(origFn);
        });
        resolve(Robinhood);
      }
    );
  });
};

const promisfy = origFn => (...callArgs) => {
  return new Promise((resolve, reject) => {
    origFn.apply(null, [
      ...callArgs,
      (error, response, body) => {
        return error || !body ? reject(error) : resolve(body);
      }
    ]);
  });
};

export const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
