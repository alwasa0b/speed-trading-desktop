import { PLACE_CANCEL_REQUEST_SUCCESS } from "../constants/cancel";
// import * as service from "./service";

const cancel_order_success = () => ({ type: PLACE_CANCEL_REQUEST_SUCCESS });
export const place_cancel_order = ({ cancel_order }) => async dispatch => {
  // const cancel_order_response = await service.place_cancel_order({
  //   cancel_order
  // });
  dispatch(cancel_order_success(cancel_order_response));
};
