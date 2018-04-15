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
          <div className="divTableCell">Symbol</div>
          <div className="divTableCell">Qty</div>
          <div className="divTableCell">Average Price</div>
          <div className="divTableCell">Gain %</div>
          <div className="divTableCell">Gain $</div>
          <div className="divTableCell">Action</div>
        </div>
        {positions.map((position, i) => (
          <div className={classes.row} key={i}>
            <div className={"divTableCell"}>{position.symbol}</div>
            <div className={"divTableCell"}>
              <NumberParser value={position.quantity} fix={0} />
            </div>
            <div className={"divTableCell"}>
              <NumberParser value={position.average_buy_price} />
            </div>
            <div className={"divTableCell"}>
              <NumberParser value={gain(position) * 100} />
            </div>
            <div className={"divTableCell"}>
              <NumberParser
                value={
                  gain(position) *
                  position.average_buy_price *
                  position.quantity
                }
              />
            </div>
            <div className={"divTableCell"}>
              <SellAction position={position} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
