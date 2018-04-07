const mapLimit = require("promise-map-limit");

const splitIntoChunks = (array, size) => {
  const cloned = array.slice();
  var splitUp = [];
  while (cloned.length > 0) splitUp.push(cloned.splice(0, size));
  return splitUp;
};

function flatten(array) {
  return array.reduce(
    (r, e) => (Array.isArray(e) ? (r = r.concat(flatten(e))) : r.push(e) && r),
    []
  );
}

module.exports = async (orders, apiFn) => {
  let arr = await mapLimit(orders, 1, async order => {
    let ticker = await apiFn(order.instrument);

    return { symbol: ticker.symbol, ...order };
  });
  return arr;
};
