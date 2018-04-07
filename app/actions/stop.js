import { PLACE_STOP_REQUEST_SUCCESS } from "../constants/stop";
// import * as service from "./service";

const stop_order_success = () => ({ type: PLACE_STOP_REQUEST_SUCCESS });
export const place_stop_loss_order = ({ stop_order }) => async (
  dispatch,
  getState
) => {
  const { instrument, quantity, symbol } = stop_order;
  // const stop_order_response = await service.place_stop_loss_order({
  //   stop_order: {
  //     ...getState().sell_order,
  //     quantity,
  //     instrument,
  //     symbol
  //   }
  // });
  dispatch(stop_order_success(stop_order_response));
};
