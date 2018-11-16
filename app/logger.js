import { ipcMain } from "electron";

import {
  START_LOGGING,
  PROGRESS_UPDATE,
  ERROR,
  INFO,
  WARN
} from "./constants/messages";

export let logger;

ipcMain.on(START_LOGGING, event => {
  const error = message =>
    event.sender.send(PROGRESS_UPDATE, { message, type: ERROR });
  const info = message =>
    event.sender.send(PROGRESS_UPDATE, { message, type: INFO });
  const warn = message =>
    event.sender.send(PROGRESS_UPDATE, { message, type: WARN });

  logger = { error, info, warn };
});
