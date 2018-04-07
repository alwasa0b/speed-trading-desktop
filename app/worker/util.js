const retryPromise = fn => {
  const attempt = async (...callArgs) => {
    try {
      return await fn(...callArgs);
    } catch (e) {
      console.log("reattempting ", callArgs);
      return await fn(...callArgs);
    }
  };

  return attempt;
};

module.exports = ({ username, password }) => {
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
          Robinhood[key] = retryPromise((...callArgs) => {
            return new Promise((resolve, reject) => {
              origFn.apply(null, [
                ...callArgs,
                (error, response, body) => {
                  return error || !body ? reject(error) : resolve(body);
                }
              ]);
            });
          });
        });
        resolve(Robinhood);
      }
    );
  });
};
