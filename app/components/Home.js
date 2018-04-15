import React from "react";
import TextField from "material-ui/TextField";
import { FormControl, FormHelperText } from "material-ui/Form";
import { withStyles } from "material-ui/styles";
import Button from "material-ui/Button";
import Paper from "material-ui/Paper";
import OrderAction from "../containers/OrderAction";
import Positions from "../containers/Positions";
import Orders from "../containers/Orders";
import Ticker from "../containers/Ticker";
import AutoSellOrder from "../containers/AutoSellOrder.js";

const styles = theme => ({
  paper: {
    "justify-self": "center"
  }
});
export default withStyles(styles)(
  class Home extends React.PureComponent {
    componentDidMount() {
      this.props.update_positions();
      this.props.update_orders();
    }
    render() {
      return (
        <div>
          <Paper className={this.props.classes.paper} elevation={4}>
            <Ticker />
            <OrderAction />
            <AutoSellOrder />
            <Positions />
            <Orders />
          </Paper>
        </div>
      );
    }
  }
);
