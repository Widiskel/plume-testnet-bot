import { ethers } from "ethers";
import { Helper } from "../utils/helper.js";
import logger from "../utils/logger.js";
import { Config } from "../config/config.js";
import { account } from "../../account.js";
import { API } from "../api/api.js";
import { RPC } from "./rpc.js";
import { GOON_ABI, GOON_CONTRACT } from "./goon_token.js";

export class Plume extends API {
  constructor(acc) {
    super("https://faucet.plumenetwork.xyz/api");
    this.acc = acc;
    this.provider = RPC.provider;
  }

  async connectWallet() {
    try {
      const data = this.acc.replace(/^0x/, "");
      await Helper.delay(
        1000,
        this.acc,
        `Connecting to Account : ${account.indexOf(this.acc) + 1}`,
        this
      );
      const type = Helper.determineType(data);
      logger.info(`Account Type : ${type}`);
      if (type == "Secret Phrase") {
        this.wallet = new ethers.Wallet.fromPhrase(data, this.provider);
      } else if (type == "Private Key") {
        this.wallet = new ethers.Wallet(data.trim(), this.provider);
      } else {
        throw Error("Invalid account Secret Phrase or Private Key");
      }
      await Helper.delay(
        1000,
        this.acc,
        `Wallet connected ${JSON.stringify(this.wallet.address)}`,
        this
      );
    } catch (error) {
      throw error;
    }
  }

  async getBalance(update = false) {
    try {
      if (!update) {
        await Helper.delay(
          500,
          this.acc,
          `Getting Wallet Balance of ${this.wallet.address}`,
          this
        );
      }
      const goonContract = new ethers.Contract(
        GOON_CONTRACT,
        GOON_ABI,
        this.provider
      );

      const ethBalance = ethers.formatEther(
        await this.provider.getBalance(this.wallet.address)
      );
      const goonBalance = ethers.formatUnits(
        await goonContract.balanceOf(this.wallet.address),
        await goonContract.decimals()
      );

      this.balance = {
        ETH: ethBalance,
        GOON: goonBalance,
      };
    } catch (error) {
      throw error;
    }
  }

  async getFaucet(token) {
    await Helper.delay(
      1000,
      this.acc,
      `Getting ${token} Faucet for ${this.wallet.address}`,
      this
    );
    const body = {
      walletAddress: this.wallet.address,
      token: token,
    };
    await this.fetch("/faucet", "POST", undefined, body)
      .then(async (res) => {
        await Helper.delay(
          1000,
          this.acc,
          `Executing ${token} Faucet Transaction`,
          this
        );
        await this.executeTx(res);
      })
      .catch((err) => {
        throw err;
      });
  }

  async executeTx(tx) {
    const txRes = await this.wallet.sendTransaction(tx);
    await Helper.delay(500, this.acc, `Building Tx...`, this);
    logger.info(JSON.stringify(tx));
    const txRev = await txRes.wait();
    await Helper.delay(
      2000,
      this.acc,
      `Transaction Success, TX Hash: ${txRev.hash}`,
      this
    );
    logger.info(JSON.stringify(txRev));
    await this.getBalance(true);
  }
}
