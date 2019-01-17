import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = theme => ({
  container: {
    "max-width": "1200px",
    margin: "0 auto",
    border: "1px solid gray"
  },
  root: {
    display: "flex",
    flexWrap: "wrap",

    "flex-direction": "row",
    "flex-wrap": "wrap"
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 60
  },
  buttons: {
    flex: "1 1 100%"
  },
  input: {
    width: 60
  },
  label: {
    fontSize: 9
  },
  button: {
    "font-size": "9px"
  },
  row: {
    display: "flex",
    margin: 2,
    "flex-direction": "row",
    "flex-wrap": "wrap"
  },

  column: {
    flex: 1,
    "align-items": "flex-end",
    "justify-content": "flex-end"
  },
  column2: {
    flex: 1
  }
});

export default withStyles(styles)(
  ({
    classes,
    ticker,
    time_interval,
    under_bid_price,
    over_my_price,
    quantity,
    number_of_runs,
    number_of_open_orders,
    pause_price,
    running,
    paused,
    update_under_bid_price,
    update_over_ask_price,
    update_time_interval,
    update_quantity,
    update_number_of_runs,
    update_number_of_open_orders,
    update_pause_price,
    startStopWorker,
    pause_resume_worker,
    update_worker
  }) => (
    <div className={classes.container} autoComplete="off">
      <div className={classes.row}>
        <div className={classes.column}>
          <div className={classes.formControl}>
            <label className={classes.label}>Under Bid </label>
            <input
              type={"number"}
              value={under_bid_price}
              onChange={({ target }) => update_under_bid_price(target.value)}
              className={classes.input}
            />
          </div>
        </div>
        <div className={classes.column}>
          <div className={classes.formControl}>
            <label className={classes.label}>Over avg </label>
            <input
              type={"number"}
              value={over_my_price}
              onChange={({ target }) => update_over_ask_price(target.value)}
              className={classes.input}
            />
          </div>
        </div>

        <div className={classes.column}>
          <div className={classes.formControl}>
            <label className={classes.label}>Interval </label>
            <input
              type={"number"}
              value={time_interval}
              onChange={({ target }) => update_time_interval(target.value)}
              className={classes.input}
            />
          </div>
        </div>

        <div className={classes.column}>
          <div className={classes.formControl}>
            <label className={classes.label}>Qty </label>
            <input
              type={"number"}
              value={quantity}
              onChange={({ target }) => update_quantity(target.value)}
              className={classes.input}
            />
          </div>
        </div>
      </div>
      <div className={classes.row}>
        <div className={classes.column}>
          <div className={classes.formControl}>
            <label className={classes.label}>Number Of Runs </label>
            <input
              type={"number"}
              value={number_of_runs}
              onChange={({ target }) => update_number_of_runs(target.value)}
              className={classes.input}
            />
          </div>
        </div>
        <div className={classes.column}>
          <div className={classes.formControl}>
            <label className={classes.label}># Open Orders </label>
            <input
              type={"number"}
              value={number_of_open_orders}
              onChange={({ target }) =>
                update_number_of_open_orders(target.value)
              }
              className={classes.input}
            />
          </div>
        </div>
        <div className={classes.column}>
          <div className={classes.formControl}>
            <label className={classes.label}>Pause Price</label>
            <input
              type={"number"}
              value={pause_price}
              onChange={({ target }) => update_pause_price(target.value)}
              className={classes.input}
            />
          </div>
        </div>
      </div>

      <div className={classes.row}>
        <div className={classes.column}>
          <div className={classes.formControl}>
            {(ticker || "").toUpperCase()}
          </div>
        </div>
        <div className={classes.column}>
          <div className={classes.formControl}>
            <button
              className={classes.button}
              onClick={startStopWorker}
              disabled={!ticker}
            >
              {running ? "STOP" : "START"}
            </button>
          </div>
        </div>
        <div className={classes.column}>
          <div className={classes.formControl}>
            <button
              className={classes.button}
              onClick={pause_resume_worker}
              disabled={!running}
            >
              {paused ? "RESUME" : "PAUSE"}
            </button>
          </div>
        </div>
        <div className={classes.column}>
          <div className={classes.formControl}>
            <button
              className={classes.button}
              onClick={update_worker}
              disabled={!running}
            >
              UPDATE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
);
