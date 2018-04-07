import React from "react";

export default ({ price = {}, update_price }) => {
  return (
    <div className={"st-ticker-wrapper"}>
      <div className={"st-ticker-price"}>
        <div className={"st-ticker-live"}>
          <input
            id="ticker"
            onKeyDown={e =>
              e.key === "Enter"
                ? update_price({ symbol: e.target.value })
                : null
            }
          />
        </div>
        <div className={"st-ticker-price-label"} id="display-ticker">
          Current Price:
        </div>
        <div className={"st-ticker-price-value"} id="display-ticker">
          {price.price}
        </div>
      </div>
    </div>
  );
};
