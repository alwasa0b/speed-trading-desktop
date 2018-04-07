import Login from "../components/Login";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as login from "../actions/login";

export default connect(
  ({ login }) => ({
    ...login
  }),
  dispatch => bindActionCreators(login, dispatch)
)(Login);
