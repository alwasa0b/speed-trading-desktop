import { connect } from "react-redux";
import Positions from "../components/Positions";

export default connect(
  ({ messages, sell_orders }) => ({
    positions: messages.positions,
    sell_orders
  }),
  null
)(Positions);
