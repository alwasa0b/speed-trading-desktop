import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Ticker from "../components/Ticker";
import * as messages from "../actions/messages.js";

export default connect(
  ({ messages }) => ({
    price: messages.price
  }),
  dispatch => bindActionCreators(messages, dispatch)
)(Ticker);
