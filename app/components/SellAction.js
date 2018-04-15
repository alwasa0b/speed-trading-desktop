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
  }
});

export default withStyles(styles)(
  ({
    classes,
    price,
    position,
    order_type,
    place_stop_loss_order,
    place_sell_order,
    update_sell_order_type,
    update_sell_order_price
  }) => (
    <div className={classes.root}>
      <div className={classes.formControl}>
        <select
          value={order_type}
          onChange={({ target }) =>
            update_sell_order_type({ order_type: target.value })
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
            update_sell_order_price({ price: target.value })
          }
        />
      </div>
      <div className={classes.formControl}>
        <button
          className={classes.button}
          disabled={order_type !== "bid" && price === 0}
          onClick={() =>
            order_type === "stop"
              ? place_stop_loss_order({ stop_order: position })
              : place_sell_order({ sell_order: position })
          }
        >
          Sell All
        </button>
      </div>
    </div>
  )
);
