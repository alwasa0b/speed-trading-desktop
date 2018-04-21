import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import SellAction from "../components/SellAction";
import * as sell from "../actions/sell.js";
import * as stop from "../actions/stop.js";

export default connect(null, dispatch =>
  bindActionCreators({ ...sell, ...stop }, dispatch)
)(SellAction);
