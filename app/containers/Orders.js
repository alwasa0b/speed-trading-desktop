import Orders from "../components/Orders";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as cancel from "../actions/cancel.js";

export default connect(
  ({ messages }) => ({
    orders: messages.orders
  }),
  dispatch => bindActionCreators(cancel, dispatch)
)(Orders);
