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
    minWidth: 120,
    height: 20
  },
  price: {
    fontSize: "16px"
  }
});

export default withStyles(styles)(({ classes, price = {}, update_price }) => {
  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <Typography className={classes.price}>{price.price}</Typography>
      </FormControl>
      <div className={classes.formControl}>
        <input
          onKeyDown={e =>
            e.key === "Enter" ? update_price({ symbol: e.target.value }) : null
          }
        />
      </div>
    </div>
  );
});
