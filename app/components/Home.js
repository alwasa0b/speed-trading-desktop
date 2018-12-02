import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import Paper from "@material-ui/core/Paper";
import OrderAction from "../containers/OrderAction";
import Positions from "../containers/Positions";
import Orders from "../containers/Orders";
import Ticker from "../containers/Ticker";
import AutoSellOrder from "../containers/AutoSellOrder.js";
import AutoOrder from "../containers/AutoOrder.js";
import Progress from "../containers/Progress.js";

const styles = theme => ({
  paper: {
    "justify-self": "center",
    "font-size": "11px"
  },
  container: {
    margin: "1.5px"
  }
});
export default withStyles(styles)(
  class Home extends React.PureComponent {
    componentDidMount() {
      this.props.update_positions();
      this.props.update_orders();
      this.props.start_logging();
    }
    render() {
      return (
        <div>
          <Paper className={this.props.classes.paper} elevation={4}>
            <div className={this.props.classes.container}>
              <Ticker />
            </div>
            <div className={this.props.classes.container}>
              <OrderAction />
            </div>
            <div className={this.props.classes.container}>
              <AutoSellOrder />
            </div>
            <div className={this.props.classes.container}>
              <AutoOrder />
            </div>
            <div className={this.props.classes.container}>
              <Positions />
            </div>
            <div className={this.props.classes.container}>
              <Orders />
            </div>
            <div className={this.props.classes.container}>
              <Progress />
            </div>
          </Paper>
        </div>
      );
    }
  }
);
