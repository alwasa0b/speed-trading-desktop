import React from "react";
import Input, { InputLabel, InputAdornment } from "material-ui/Input";
import { MenuItem } from "material-ui/Menu";
import { FormControl, FormHelperText } from "material-ui/Form";
import Select from "material-ui/Select";
import { withStyles } from "material-ui/styles";
import TextField from "material-ui/TextField";
import Typography from "material-ui/Typography";

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
    minWidth: 80
  },
  input: {
    width: 70
  },
  label: {
    fontSize: 9
  }
});

export default withStyles(styles)(
  ({ classes, type, price, update_sell_order_type, update_sell_price }) => (
    <div className={classes.root} autoComplete="off">
      <label className={classes.label}>Auto place Sell Order </label>
      <div className={classes.formControl}>
        <select
          value={type}
          onChange={({ target }) =>
            update_sell_order_type({ sell_order_type: target.value })
          }
        >
          <option value={"none"}>None</option>
          <option value={"limit"}>Limit</option>
          <option value={"stop"}>Stop</option>
        </select>
      </div>
      <div className={classes.formControl}>
        <label className={classes.label}>Sell Price: </label>
        <input
          type={"number"}
          min={0}
          className={classes.input}
          disabled={type === "none"}
          onChange={({ target }) =>
            update_sell_price({ sell_price: target.value })
          }
        />
      </div>
    </div>
  )
);
