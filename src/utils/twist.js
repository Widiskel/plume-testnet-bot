import { Twisters } from "twisters";
import logger from "./logger.js";
import { Plume } from "../core/plume.js";
import { account } from "../../account.js";

class Twist {
  constructor() {
    /** @type  {Twisters}*/
    this.twisters = new Twisters({});
  }

  /**
   * @param {string} acc
   * @param {Plume} plume
   * @param {string} msg
   * @param {string} delay
   */
  log(msg = "", acc = "", plume = new Plume(), delay) {
    if (delay == undefined) {
      logger.info(`Account ${account.indexOf(acc) + 1} - ${msg}`);
      delay = "-";
    }

    const wallet = plume.wallet ?? {};
    const address = wallet.address ?? "-";
    const balance = plume.balance ?? "-";
    const ETHBalance = balance.ETH ?? "-";
    const GOONBalance = balance.GOON ?? "-";

    this.twisters.put(acc, {
      text: `
================= Account ${account.indexOf(acc) + 1} =============
Address             : ${address}
Balance             : ${ETHBalance} ETH | ${GOONBalance} GOON

Status : ${msg}
Delay  : ${delay}
==============================================`,
    });
  }

  clear() {
    this.twisters.flush();
  }

  /**
   * @param {string} msg
   */
  info(msg = "") {
    this.twisters.put(2, {
      text: `
==============================================
Info : ${msg}
==============================================`,
    });
    return;
  }

  cleanInfo() {
    this.twisters.remove(2);
  }
}
export default new Twist();
