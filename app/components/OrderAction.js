import React from "react";
import { withStyles } from "material-ui/styles";
const styles = theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    "align-items": "center",
    "justify-content": "center",
    margin: 2,
    border: "1px solid gray"
  },
  formControl: {
    margin: theme.spacing.unit,
    maxWidth: 120,
    maxHeight: 20
  },
  input: {
    width: 70
  },
  label: {
    fontSize: 9
  }
});

export default withStyles(styles)(
  ({
    classes,
    price = {},
    buy_order_type,
    place_buy_order,
    quantity,
    buy_price,
    update_quantity,
    update_buy_order_type,
    update_buy_price
  }) => (
    <div className={classes.root}>
      <div className={classes.formControl}>
        <label className={classes.label}>Quantity: </label>
        <input
          type="number"
          className={classes.input}
          min={0}
          onChange={({ target }) => update_quantity({ quantity: target.value })}
        />
      </div>
      <div className={classes.formControl}>
        <select
          value={buy_order_type}
          onChange={({ target }) =>
            update_buy_order_type({
              buy_order_type: target.value
            })
          }
        >
          <option value={"bid"}>Bid</option>
          <option value={"limit"}>Limit</option>
        </select>
      </div>
      <div className={classes.formControl}>
        <label className={classes.label}>Price: </label>
        <input
          type="number"
          className={classes.input}
          min={0}
          disabled={buy_order_type !== "limit"}
          onChange={({ target }) =>
            update_buy_price({
              buy_price: target.value
            })
          }
        />
      </div>
      <div className={classes.formControl}>
        <button
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
  )
);
