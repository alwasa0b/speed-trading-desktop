import { connect } from "react-redux";
import Positions from "../components/Positions";

export default connect(
  ({ messages }) => ({
    positions: messages.positions
  }),
  null
)(Positions);
