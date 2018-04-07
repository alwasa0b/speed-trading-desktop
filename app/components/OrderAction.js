import React from "react";
import Ticker from "../containers/Ticker";
import AutoSellOrder from "../containers/AutoSellOrder.js";

export default ({
  price = {},
  buy_order_type,
  place_buy_order,
  quantity,
  buy_price,
  update_quantity,
  update_buy_order_type,
  update_buy_price
}) => (
  <div className={"order-action-wrapper"}>
    <div className={"row"}>
      <Ticker />
    </div>
    <div className={"row"}>
      <div className={"st-label-div"}>Quantity:</div>
      <div className={"st-input-div"}>
        <input
          type="text"
          id="qty"
          className={"input-qty"}
          onChange={({ target }) => update_quantity({ quantity: target.value })}
        />
      </div>
      <div className={"st-text-div"}>@</div>
      <div className={"st-label-div"}>Price:</div>
      <div className={"st-input-div"}>
        <select
          value={buy_order_type}
          onChange={({ target }) =>
            update_buy_order_type({
              buy_order_type: target.value
            })
          }
        >
          <option value="bid">Bid</option>
          <option value="limit">Limit</option>
        </select>
      </div>
      <div className={"st-input-div"}>
        <input
          type="text"
          id="price"
          disabled={buy_order_type !== "limit"}
          className={"input-price"}
          onChange={({ target }) =>
            update_buy_price({
              buy_price: target.value
            })
          }
        />
      </div>
      <div className={"st-btn-div"}>
        <button
          className={"btn-buy"}
          disabled={
            quantity < 1 ||
            (buy_order_type === "limit" && !buy_price) ||
            !price.price
          }
          onClick={place_buy_order}
        >
          Buy
        </button>
      </div>
    </div>
    <div className={"row"}>
      <AutoSellOrder />
    </div>
  </div>
);
