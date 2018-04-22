import React from "react";
import { withStyles } from "material-ui/styles";

const styles = theme => ({
  root: {
    display: "flex"
  },
  formControl: {
    marginRight: theme.spacing.unit,
    maxWidth: 80
  },
  input: {
    width: 50
  },
  button: {
    "font-size": "9px"
  },
  quantityControl: {
    margin: theme.spacing.unit,
    maxWidth: 220,
    maxHeight: 20
  },
  quantityInput: {
    marginLeft: 2,
    width: 70
  }
});

export default withStyles(styles)(
  ({
    classes,
    order_type = "bid",
    price = 0,
    position,
    quantity_type,
    quantity,
    place_stop_loss_order,
    place_sell_order,
    update_sell_order_type,
    update_sell_order_price,
    update_quantity_type = "count",
    update_quantity
  }) => (
    <div className={classes.root}>
      <div className={classes.quantityControl}>
        <label className={classes.label}>Quantity: </label>
        <select
          value={quantity_type}
          onChange={({ target }) =>
            update_quantity_type({
              quantity_type: target.value,
              symbol: position.symbol
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
                  : Number(target.value),
              symbol: position.symbol
            })
          }
        />
      </div>
      <div className={classes.formControl}>
        <select
          value={order_type}
          onChange={({ target }) =>
            update_sell_order_type({
              order_type: target.value,
              symbol: position.symbol
            })
          }
        >
          <option value="bid">Bid</option>
          <option value="limit">Limit</option>
          <option value="stop">Stop</option>
        </select>
      </div>
      <div className={classes.formControl}>
        <input
          className={classes.input}
          type={"number"}
          value={price}
          disabled={order_type === "bid"}
          onChange={({ target }) =>
            update_sell_order_price({
              price: target.value,
              symbol: position.symbol
            })
          }
        />
      </div>
      <div className={classes.formControl}>
        <button
          className={classes.button}
          disabled={order_type !== "bid" && price === 0}
          onClick={() =>
            order_type === "stop"
              ? place_stop_loss_order({
                  stop_order: position,
                  price,
                  order_type
                })
              : place_sell_order({
                  sell_order: position,
                  price,
                  order_type,
                  quantity,
                  quantity_type
                })
          }
        >
          Sell All
        </button>
      </div>
    </div>
  )
);
