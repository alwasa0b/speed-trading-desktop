import { logger } from "../logger";
import { Robinhood } from "../robinhood-service";
import { timeout } from "./util";

export default async (emitter, ipcMain) => {
  update(emitter);
};

async function update(emitter) {
  try {
    while (true) {
      await timeout(700);
      const {
        results: [account]
      } = await Robinhood.accounts();

      emitter.emit(`ACCOUNT_UPDATED`, account);
    }
  } catch (error) {
    logger.error(`account error ${JSON.stringify(error)}`);
    await timeout(5000);
    update(emitter);
  }
}
