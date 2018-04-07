import React from "react";

export default ({ type, price, update_sell_order_type, update_sell_price }) => (
  <div>
    <label>Place Sell Order</label>
    <div className={"st-input-div"}>
      <select
        value={type}
        onChange={({ target }) =>
          update_sell_order_type({ sell_order_type: target.value })
        }
      >
        <option value="none">None</option>
        <option value="limit">Limit</option>
        <option value="stop">Stop</option>
      </select>
    </div>
    <div className={"st-input-div"}>
      <input
        type="text"
        disabled={type === "none"}
        onChange={({ target }) =>
          update_sell_price({ sell_price: target.value })
        }
      />
    </div>
  </div>
);
