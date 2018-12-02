import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";

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
  quantityControl: {
    margin: theme.spacing.unit,
    maxWidth: 220,
    maxHeight: 20
  },
  input: {
    width: 70
  },
  quantityInput: {
    marginLeft: 2,
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
    quantity_type,
    update_quantity,
    update_buy_order_type,
    update_buy_price,
    update_quantity_type
  }) => (
    <div className={classes.root}>
      <div className={classes.quantityControl}>
        <label className={classes.label}>Qty: </label>
        <select
          value={quantity_type}
          onChange={({ target }) =>
            update_quantity_type({
              quantity_type: target.value
            })
          }
        >
          <option value={"count"}>#</option>
          <option value={"percentage"}>%</option>
        </select>
        <input
          type="number"
          className={classes.quantityInput}
          value={quantity}
          min={0}
          max={quantity_type === "percentage" ? 100 : Infinity}
          onChange={({ target }) =>
            update_quantity({
              quantity:
                quantity_type === "percentage" && Number(target.value) > 100
                  ? 100
                  : Number(target.value)
            })
          }
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
