import createSocketIoMiddleware from "redux-socket.io";
import io from "socket.io-client";
const socket = io("http://localhost:3001");

export default createSocketIoMiddleware(socket, "SERVER/");
