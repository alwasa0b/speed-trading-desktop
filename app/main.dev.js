import { app, BrowserWindow, ipcMain } from "electron";
import MenuBuilder from "./menu";

import {
  place_cancel_order,
  place_stop_loss_order,
  place_buy_order,
  place_sell_order,
  update_positions,
  update_orders,
  auto_trader_service
} from "./workers";

import {
  UPDATE_POSITIONS,
  UPDATE_ORDERS,
  UPDATE_PRICE,
  PRICE_UPDATED,
  POSITIONS_UPDATED,
  ORDERS_UPDATED,
  ADD_SYMBOL
} from "./constants/messages";

import { LOGIN_REQUEST, LOGIN_SUCCESS } from "./constants/login";

import { PLACE_BUY_REQUEST, PLACE_BUY_REQUEST_SUCCESS } from "./constants/buy";

import {
  PLACE_CANCEL_REQUEST,
  PLACE_CANCEL_REQUEST_SUCCESS
} from "./constants/cancel";

import {
  PLACE_SELL_REQUEST,
  PLACE_SELL_REQUEST_SUCCESS
} from "./constants/sell";

import {
  PLACE_STOP_REQUEST,
  PLACE_STOP_REQUEST_SUCCESS
} from "./constants/stop";

import { logout, login } from "./robinhood-service";
import { EventEmitter } from "events";
import ticker_manager from "./workers/ticker_manager";
// import account_manager from "./workers/account_manager";

const emitter = new EventEmitter();

let mainWindow = null;

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === "development" ||
  process.env.DEBUG_PROD === "true"
) {
  require("electron-debug")();
  const path = require("path");
  const p = path.join(__dirname, "..", "app", "node_modules");
  require("module").globalPaths.push(p);
}
process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
});
const installExtensions = async () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

let update_price_handle;
let update_position_handle;
let update_order_handle;

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    app.quit();
  }

  if (update_price_handle) clearInterval(update_price_handle);
  if (update_position_handle) clearInterval(update_position_handle);
  if (update_order_handle) clearInterval(update_order_handle);

  emitter.emit("EXIT");

  logout();
});

app.on("ready", async () => {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_PROD === "true"
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width:
      process.env.NODE_ENV === "development" ||
      process.env.DEBUG_PROD === "true"
        ? 500
        : 500,
    height: 900,
    resizable: false
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on("did-finish-load", () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on("closed", () => {
    if (update_price_handle) clearInterval(update_price_handle);
    if (update_position_handle) clearInterval(update_position_handle);
    if (update_order_handle) clearInterval(update_order_handle);
    emitter.emit("EXIT");
    logout();
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});

ipcMain.on(LOGIN_REQUEST, async function(event, { login: test }) {
  await login(test);
  // account_manager(emitter, ipcMain);
  event.sender.send(LOGIN_SUCCESS);
});

ipcMain.on(PLACE_CANCEL_REQUEST, async (event, order) => {
  const resl = await place_cancel_order(order);
  event.sender.send(PLACE_CANCEL_REQUEST_SUCCESS, resl);
});

ipcMain.on(PLACE_BUY_REQUEST, async (event, order) => {
  const placedOrder = await place_buy_order(order);
  event.sender.send(PLACE_BUY_REQUEST_SUCCESS, placedOrder);
});

ipcMain.on(PLACE_SELL_REQUEST, async (event, order) => {
  const placedOrder = await place_sell_order(order);
  event.sender.send(PLACE_SELL_REQUEST_SUCCESS, placedOrder);
});

ipcMain.on(PLACE_STOP_REQUEST, async (event, order) => {
  const placedOrder = await place_stop_loss_order(order);
  event.sender.send(PLACE_STOP_REQUEST_SUCCESS, placedOrder);
});

let oldSymbol = "";
let update;

ipcMain.on(UPDATE_PRICE, async (event, { symbol }) => {
  if (update == null)
    update = data => {
      event.sender.send(PRICE_UPDATED, data);
    };
  emitter.removeListener(`PRICE_UPDATED_${oldSymbol}`, update);
  oldSymbol = symbol;
  emitter.on(`PRICE_UPDATED_${symbol}`, update);
  emitter.emit(ADD_SYMBOL, symbol);
});

ipcMain.on(UPDATE_POSITIONS, event => {
  if (update_position_handle != null) clearInterval(update_position_handle);
  update_position_handle = setInterval(
    update_positions(data => event.sender.send(POSITIONS_UPDATED, data)),
    2000
  );
});

ipcMain.on(UPDATE_ORDERS, event => {
  if (update_order_handle != null) clearInterval(update_order_handle);
  update_order_handle = setInterval(
    update_orders(data => event.sender.send(ORDERS_UPDATED, data)),
    5000
  );
});

auto_trader_service(ipcMain, emitter);
ticker_manager(emitter, ipcMain);
