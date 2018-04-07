import App from "../components/App";
import { connect } from "react-redux";

export default connect(
  ({ authentication }) => ({
    loggedIn: authentication.loggedIn
  }),
  null
)(App);
