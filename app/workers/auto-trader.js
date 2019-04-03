import {
  START_WORKER,
  STOP_WORKER,
  WORKER_STARTED,
  WORKER_STOPPED,
  PAUSE_WORKER,
  WORKER_PAUSED,
  WORKER_UPDATED,
  UPDATE_WORKER,
  RESUME_WORKER,
  WORKER_RESUMED,
  PANIC
} from "../constants/messages";

import dca_trader from "./dca_trader";

export default (ipcMain, emitter) => {
  let auto_trader = null;

  ipcMain.on(START_WORKER, async (event, instructions) => {
    auto_trader = await dca_trader(instructions, emitter, ownId => {
      if (auto_trader.id !== ownId) return;
      event.sender.send(WORKER_STOPPED);
    });
    event.sender.send(WORKER_STARTED);
  });

  ipcMain.on(PAUSE_WORKER, event => {
    auto_trader.pause();
    event.sender.send(WORKER_PAUSED);
  });

  ipcMain.on(RESUME_WORKER, event => {
    auto_trader.resume();
    event.sender.send(WORKER_RESUMED);
  });

  ipcMain.on(UPDATE_WORKER, (event, instructions) => {
    auto_trader.update(instructions);
    event.sender.send(WORKER_UPDATED);
  });

  ipcMain.on(PANIC, (event, instructions) => {
    auto_trader.panic();
    event.sender.send(WORKER_UPDATED);
  });

  ipcMain.on(STOP_WORKER, event => {
    auto_trader.stop();
    event.sender.send(WORKER_STOPPED);
  });
};
