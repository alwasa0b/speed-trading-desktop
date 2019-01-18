import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";
const styles = theme => ({
  root: {
    display: "flex",
    "flex-flow": "column",
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
    color: "#DC143Cd"
  },
  warn: {
    color: "#FF8C00"
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
    "font-size": "9px",
    "margin-top": "auto",
    "margin-left": "auto",
    "margin-bottom": "5px",
    "margin-right": "6px"
  }
});

export default withStyles(styles)(({ classes, messages, clear }) => {
  return (
    <div className={classes.root}>
      <div className={classes.formControl}>
        {messages.map((m, i) => (
          <div
            className={
              m.type === "ERROR"
                ? classes.error
                : m.type === "WARN"
                ? classes.warn
                : classes.info
            }
            key={i}
          >
            {m.message}
          </div>
        ))}
      </div>
      <button className={classes.button} onClick={clear}>
        CLEAR
      </button>
    </div>
  );
});
