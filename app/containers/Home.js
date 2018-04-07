import Home from "../components/Home";
import { bindActionCreators } from "redux";
import * as messages from "../actions/messages.js";
import { connect } from "react-redux";

export default connect(null, dispatch =>
  bindActionCreators(messages, dispatch)
)(Home);
