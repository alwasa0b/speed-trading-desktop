import OrderAction from "../components/OrderAction";
import { bindActionCreators } from "redux";
import * as orders from "../actions/buy.js";
import { connect } from "react-redux";

export default connect(
  ({ messages, buy_order }) => ({
    price: messages.price,
    ...buy_order
  }),
  dispatch => bindActionCreators(orders, dispatch)
)(OrderAction);
