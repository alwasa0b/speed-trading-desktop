import React from "react";
import NumberParser from "./NumberParser";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = theme => ({
  table: {
    display: "table",
    width: "100%"
  },
  body: {
    display: "table-row-group"
  },
  headerRow: {
    backgroundColor: "#eee",
    display: "table-header-group"
  },
  row: {
    display: "table-row"
  },
  button: {
    "font-size": "11px"
  },
  cell: {
    display: "table-cell",
    padding: "3px 10px",
    "font-size": "11px"
  }
});

export default withStyles(styles)(
  ({ classes, orders = [], place_cancel_order }) => (
    <div className={classes.table}>
      <div className={classes.table}>
        <div className={classes.headerRow}>
          <div className={classes.cell}>Symbol</div>
          <div className={classes.cell}>Qty</div>
          <div className={classes.cell}>Price</div>
          <div className={classes.cell}>Stop Price</div>
          <div className={classes.cell}>Status</div>
          <div className={classes.cell}>Side</div>
          <div className={classes.cell}>Action</div>
        </div>
        {orders
          .filter(o => o.state !== "cancelled" && o.state !== "filled")
          .map((n, i) => {
            return (
              <div className={classes.row} key={n.id}>
                <div className={classes.cell}>{n.symbol}</div>
                <div className={classes.cell}>
                  <NumberParser value={n.quantity} fix={0} />
                </div>
                <div className={classes.cell}>
                  <NumberParser value={n.price || n.average_price} />
                </div>
                <div className={classes.cell}>
                  <NumberParser value={n.stop_price} />
                </div>
                <div className={classes.cell}>
                  {(n.state || "").toUpperCase()}
                </div>
                <div className={classes.cell}>
                  {(n.side || "").toUpperCase()}
                </div>
                <div className={classes.cell}>
                  <button
                    className={classes.button}
                    onClick={() => place_cancel_order({ cancel_order: n })}
                    disabled={n.state === "cancelled" || n.state === "filled"}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  )
);
