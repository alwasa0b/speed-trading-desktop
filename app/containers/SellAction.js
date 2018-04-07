import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import SellAction from "../components/SellAction";
import * as sell from "../actions/sell.js";
import * as stop from "../actions/stop.js";

export default connect(
  ({ sell_order }) => ({
    order_type: sell_order.order_type,
    price: sell_order.price
  }),
  dispatch => bindActionCreators({ ...sell, ...stop }, dispatch)
)(SellAction);
