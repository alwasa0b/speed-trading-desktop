import AutoSellOrder from "../components/AutoSellOrder";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as buy from "../actions/buy.js";

export default connect(
  ({ buy_order }) => ({
    type: buy_order.sell_order_type,
    price: buy_order.sellPrice
  }),
  dispatch => bindActionCreators(buy, dispatch)
)(AutoSellOrder);
