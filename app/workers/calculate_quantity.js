import { logger } from "../logger";
import { Robinhood } from "../robinhood-service";

export default async function(quantity_type, quantity, bid_price) {
  if (quantity_type !== "percentage") return quantity;

  const account = await Robinhood.accounts();

  const buying_power =
    account.results[0].margin_balances.unallocated_margin_cash;

  const requested = (buying_power * quantity) / 100;

  const qty = Math.floor(requested / bid_price);

  logger.info(`buying_power: ${buying_power}`);
  logger.info(`requested: ${requested}`);
  logger.info(`calculated quantity: ${qty}`);

  return qty;
}
