import { account } from "./account.js";
import { Config } from "./src/config/config.js";
import { Plume } from "./src/core/plume.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";
import twist from "./src/utils/twist.js";

async function operation(acc) {
  try {
    const plume = new Plume(acc);
    await plume.connectWallet();
    await plume.getBalance();
    await plume.getFaucet("ETH");
    await plume.getFaucet("GOON");

    if (plume.balance.ETH == 0) {
      await Helper.delay(30000, acc, `Waiting for ETH faucet...`, plume);
      await plume.getBalance(true);

      if (plume.balance.ETH == 0) {
        await Helper.delay(
          3000,
          acc,
          `ETH balance still 0, skipping account until next loop`,
          plume
        );
        return;
      }
    }

    await plume.connectDappPlume();
    if (plume.balance.ETH != 0) {
      await plume.checkIn();
    }

    // if (plume.balance.GOON == 0) {
    //   await Helper.delay(
    //     30000,
    //     acc,
    //     `Waiting for GOON faucet to be Received...`,
    //     plume
    //   );
    //   await plume.getBalance(true);

    //   if (plume.balance.GOON == 0) {
    //     await Helper.delay(
    //       3000,
    //       acc,
    //       `GOON balance still 0, skipping account until next loop`,
    //       plume
    //     );
    //     return;
    //   }
    // }

    // if (plume.balance.GOON != 0) {
    //   await plume.swapAmbient();
    // }
  } catch (error) {
    if (currentError != maxError) {
      currentError += 1;
      await Helper.delay(
        5000,
        acc,
        `Error - ${error.message} , Retrying using Account ${
          account.indexOf(acc) + 1
        }...`
      );
      await operation(acc);
    } else {
      await Helper.delay(
        5000,
        acc,
        `Error processing Accoung ${
          account.indexOf(acc) + 1
        } & Max Error Reached : ${JSON.stringify(error)}`
      );
    }
  }
}

const maxError = Config.maxErrorCount;
var currentError = 0;
/** Processing Bot */
async function process() {
  logger.clear();
  logger.info(`PLUME AUTO TX BOT STARTED`);
  for (const acc of account) {
    currentError = 0;
    await operation(acc);
  }
  logger.info(`PLUME AUTO TX BOT FINISHED`);
  twist.clear();
  twist.cleanInfo();
  await Helper.delay(
    60000 * 10,
    undefined,
    "All Account processed Delaying for 10 Minutes"
  );
  twist.cleanInfo();
  await process();
}

(async () => {
  console.log("Plume Testnet Tx Bot");
  console.log("By : Widiskel");
  console.log("Note : Don't forget to run git pull to keep up-to-date");
  console.log();
  await process();
})();
