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
    minWidth: 60
  },
  input: {
    width: 60
  },
  label: {
    fontSize: 9
  },
  button: {
    "font-size": "9px"
  }
});

export default withStyles(styles)(
  ({
    classes,
    time_interval,
    under_bid_price,
    over_my_price,
    quantity,
    running,
    update_under_bid_price,
    update_over_ask_price,
    update_time_interval,
    update_quantity,
    startStopWorker
  }) => (
    <div className={classes.root} autoComplete="off">
      <div className={classes.formControl}>
        <label className={classes.label}>Under Bid </label>
        <input
          type={"number"}
          min={0}
          value={under_bid_price}
          onChange={({ target }) => update_under_bid_price(target.value)}
          className={classes.input}
        />
      </div>

      <div className={classes.formControl}>
        <label className={classes.label}>Over avg </label>
        <input
          type={"number"}
          min={0}
          value={over_my_price}
          onChange={({ target }) => update_over_ask_price(target.value)}
          className={classes.input}
        />
      </div>
      <div className={classes.formControl}>
        <label className={classes.label}>Interval </label>
        <input
          type={"number"}
          min={0}
          value={time_interval}
          onChange={({ target }) => update_time_interval(target.value)}
          className={classes.input}
        />
      </div>

      <div className={classes.formControl}>
        <label className={classes.label}>Qty </label>
        <input
          type={"number"}
          min={0}
          value={quantity}
          onChange={({ target }) => update_quantity(target.value)}
          className={classes.input}
        />
      </div>

      <div className={classes.formControl}>
        <button className={classes.button} onClick={startStopWorker}>
          {running ? "STOP" : "START"}
        </button>
      </div>
    </div>
  )
);
