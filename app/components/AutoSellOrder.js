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
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  },
  textField: {
    width: 200
  }
});

export default withStyles(styles)(
  ({ classes, type, price, update_sell_order_type, update_sell_price }) => (
    <form className={classes.root} autoComplete="off">
      <Typography>Place Sell Order: </Typography>
      {/* <label></label> */}
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="age-simple">Age</InputLabel>
        <Select
          value={type}
          onChange={({ target }) =>
            update_sell_order_type({ sell_order_type: target.value })
          }
        >
          <MenuItem value={"none"}>None</MenuItem>
          <MenuItem value={"limit"}>Limit</MenuItem>
          <MenuItem value={"stop"}>Stop</MenuItem>
        </Select>
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="value-simple">Sell Price</InputLabel>
        <Input
          type={"number"}
          className={classes.textField}
          disabled={type === "none"}
          onChange={({ target }) =>
            update_sell_price({ sell_price: target.value })
          }
          startAdornment={<InputAdornment position="start">$</InputAdornment>}
        />
      </FormControl>
    </form>
  )
);
