import axios from "axios";

const API_ROOT =
  process.env.NODE_ENV === "production"
    ? `${window.location.origin}`
    : "http://localhost:3001";

const post = async (endpoint, data) => {
  try {
    // if (endpoint === "login" && sessionStorage.getItem("sp"))
    //   return { response: {}, data };

    const response = await axios.post(`${API_ROOT}/${endpoint}`, data);
    
    // if (endpoint === "login") {
    //   // sessionStorage.setItem("sp", response.payload.data.token);
    // }

    return { response, data };
  } catch (e) {
    return { detail: e.toString() };
  }
};

export const login = async ({ login }) => await post("login", login);
export const place_cancel_order = async ({ cancel_order }) => await post("place_cancel_order", cancel_order);
export const place_sell_order = async ({ sell_order }) => await post("place_sell_order", sell_order);
export const place_buy_order = async ({ buy_order }) => await post("place_buy_order", buy_order);
export const place_stop_loss_order = async ({ stop_order }) => await post("place_stop_loss_order", stop_order);