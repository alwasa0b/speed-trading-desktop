import React from "react";
import NumberParser from "./NumberParser";

export default ({ orders = [], place_cancel_order }) => (
  <div className={"st-orders-section-wrapper"}>
    <div className={"st-section-title"}>Orders:</div>
    <div className={"st-orders-header-row"}>
      <div className={"symbol-column-header"}>Symbol</div>
      <div className={"qty-column-header"}>Qty</div>
      <div className={"price-column-header"}>Price</div>
      <div className={"stop-price-column-header"}>Stop Price</div>
      <div className={"status-column-header"}>Status</div>
      <div className={"action-column-header"}>Action</div>
    </div>
    <div className={"st-orders"}>
      {orders.map((order, i) => (
        <div className={"orders-row"} key={i}>
          <div className={"symbol-column"}>{order.symbol}</div>
          <div className={"qty-column"}>
            <NumberParser value={order.quantity} fix={0} />
          </div>
          <div className={"price-column"}>
            <NumberParser value={order.average_price} />
          </div>
          <div className={"stop-price-column"}>
            <NumberParser value={order.stop_price} />
          </div>
          <div className={"status-column"}>{order.state}</div>
          <div className={"st-action-column"}>
            <button
              onClick={() => place_cancel_order({ cancel_order: order })}
              disabled={order.state === "cancelled" || order.state === "filled"}
            >
              Cancel
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
