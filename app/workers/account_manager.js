import { logger } from "../logger";
import { Robinhood } from "../robinhood-service";
import { timeout } from "./util";

export default async (emitter, ipcMain) => {
  let account = {};
  try {
    while (true) {
      await timeout(700);
      const {
        results: [acc]
      } = await Robinhood.accounts();

      account = acc;

      emitter.emit(`ACCOUNT_UPDATED`, account);
    }
  } catch (error) {
    logger.error(`account error ${JSON.stringify(error)}`);
  }
};
