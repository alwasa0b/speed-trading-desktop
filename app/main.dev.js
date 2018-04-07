import { app, BrowserWindow, ipcMain } from "electron";
import MenuBuilder from "./menu";
import {
  login,
  place_cancel_order,
  place_stop_loss_order,
  place_buy_order,
  place_sell_order,
  update_price,
  update_positions,
  update_orders
} from "./worker";

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

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    app.quit();
  }
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
    width: 550,
    height: 860,
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
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});

ipcMain.on("login", async function(event, { login: test }) {
  await login(test);
  event.sender.send("USERS_LOGIN_SUCCESS");
});

ipcMain.on("cancel_orders", async (event, order) => {
  const resl = await place_cancel_order(order);
  event.sender.send("order_canceled", resl);
});

ipcMain.on("place_buy_order", async (event, order) => {
  const placedOrder = await place_buy_order(order);
  event.sender.send("buy_order_placed", placedOrder);
});

ipcMain.on("place_sell_order", async (event, order) => {
  const placedOrder = await place_sell_order(order);
  event.sender.send("sell_order_placed", placedOrder);
});

ipcMain.on("place_stop_loss_order", async (event, order) => {
  const placedOrder = await place_stop_loss_order(order);
  event.sender.send("place_stop_loss_order", placedOrder);
});

let update_price_handle;
let update_position_handle;
let update_order_handle;

ipcMain.on("UPDATE_PRICE", async (event, { symbol }) => {
  if (update_price_handle != null) clearInterval(update_price_handle);
  update_price_handle = setInterval(
    update_price(data => event.sender.send("PRICE_UPDATED", data), symbol),
    600
  );
});

ipcMain.on("UPDATE_POSITIONS", event => {
  if (update_position_handle != null) clearInterval(update_position_handle);
  update_position_handle = setInterval(
    update_positions(data => event.sender.send("POSITIONS_UPDATED", data)),
    5000
  );
});

ipcMain.on("UPDATE_ORDERS", event => {
  if (update_order_handle != null) clearInterval(update_order_handle);
  update_order_handle = setInterval(
    update_orders(data => event.sender.send("ORDERS_UPDATED", data)),
    5000
  );
});
