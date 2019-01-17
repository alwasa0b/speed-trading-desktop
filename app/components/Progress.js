import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";
const styles = theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    "align-items": "left",
    "justify-content": "left",
    margin: 2,
    border: "1px solid gray",
    height: "300px",
    overflowY: "auto"
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 60
  },
  error: {
    color: "red"
  },
  info: {
    color: "black"
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

export default withStyles(styles)(({ classes, messages }) => {
  return (
    <div className={classes.root}>
      <div className={classes.formControl}>
        {messages.map((m, i) => (
          <div
            className={m.type === "ERROR" ? classes.error : classes.info}
            key={i}
          >
            {m.message}
          </div>
        ))}
      </div>
    </div>
  );
});
