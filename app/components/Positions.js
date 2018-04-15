import React from "react";
import NumberParser from "./NumberParser";
import SellAction from "../containers/SellAction";
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
  cell: {
    display: "table-cell",
    padding: "3px 10px",
    "font-size": "11px"
  }
});

const gain = position =>
  (position.cur_price - position.average_buy_price) /
  position.average_buy_price;

export default withStyles(styles)(({ classes, positions = [] }) => {
  return (
    <div className={classes.table}>
      <div className={classes.table}>
        <div className={classes.headerRow}>
          <div className={classes.cell}>Symbol</div>
          <div className={classes.cell}>Qty</div>
          <div className={classes.cell}>Average Price</div>
          <div className={classes.cell}>Gain %</div>
          <div className={classes.cell}>Gain $</div>
          <div className={classes.cell}>Action</div>
        </div>
        {positions.map((position, i) => (
          <div className={classes.row} key={i}>
            <div className={classes.cell}>{position.symbol}</div>
            <div className={classes.cell}>
              <NumberParser value={position.quantity} fix={0} />
            </div>
            <div className={classes.cell}>
              <NumberParser value={position.average_buy_price} />
            </div>
            <div className={classes.cell}>
              <NumberParser value={gain(position) * 100} />
            </div>
            <div className={classes.cell}>
              <NumberParser
                value={
                  gain(position) *
                  position.average_buy_price *
                  position.quantity
                }
              />
            </div>
            <div className={classes.cell}>
              <SellAction position={position} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
