import React from "react";
import NumberParser from "./NumberParser";
import { withStyles } from "material-ui/styles";

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
  }
});

export default withStyles(styles)(
  ({ classes, orders = [], place_cancel_order }) => (
    <div className={classes.table}>
      <div className={classes.table}>
        <div className={classes.headerRow}>
          <div className="divTableCell">Symbol</div>
          <div className="divTableCell">Qty</div>
          <div className="divTableCell">Price</div>
          <div className="divTableCell">Stop Price</div>
          <div className="divTableCell">Status</div>
          <div className="divTableCell">Action</div>
        </div>
        {orders.map((n, i) => {
          return (
            <div className={classes.row} key={i}>
              <div className="divTableCell">{n.symbol}</div>
              <div className="divTableCell">
                <NumberParser value={n.quantity} fix={0} />
              </div>
              <div className="divTableCell">
                <NumberParser value={n.average_price} />
              </div>
              <div className="divTableCell">
                <NumberParser value={n.stop_price} />
              </div>
              <div className="divTableCell">{n.state}</div>
              <div className="divTableCell">
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
