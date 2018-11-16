import Progress from "../components/Progress";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as auto from "../actions/auto.js";

export default connect(
  ({ auto_order }) => auto_order,
  dispatch => bindActionCreators(auto, dispatch)
)(Progress);
