import React from "react";
import FormControl from "@material-ui/core/FormControl";
import withStyles from "@material-ui/core/styles/withStyles";
import Typography from "@material-ui/core/Typography";

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
  },
  input: {
    width: "70px"
  },
  ticker: {
    "justify-content": "right",
    fontSize: "16px",
    fontWeight: "500"
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
          className={classes.input}
          onKeyDown={e =>
            e.key === "Enter" ? update_price({ symbol: e.target.value }) : null
          }
        />
      </div>
      <div className={classes.ticker}>
        <span>{(price.symbol || "").toUpperCase()}</span>
      </div>
    </div>
  );
});
