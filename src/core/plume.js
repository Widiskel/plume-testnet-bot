import { ethers } from "ethers";
import { Helper } from "../utils/helper.js";
import logger from "../utils/logger.js";
import { account } from "../../account.js";
import { API } from "../api/api.js";
import { RPC } from "./rpc.js";
import { GOON_ABI, GOON_CONTRACT } from "./goon_token.js";
import { CHECKIN_IMPL_CONTRACT } from "./check_in.js";
import { Wallet } from "ethers";

export class Plume extends API {
  constructor(acc) {
    super("https://points-api.plumenetwork.xyz");

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
        /**
         * @type {Wallet}
         */
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
    await this.fetch(
      "/faucet",
      "POST",
      undefined,
      body,
      undefined,
      "https://faucet.plumenetwork.xyz/api"
    )
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

  async connectDappPlume() {
    await Helper.delay(1000, this.acc, `Connecting to plum DAPPS...`, this);
    await this.fetch("/auth/nonce", "POST", undefined, {})
      .then(async (data) => {
        const msg = `miles.plumenetwork.xyz wants you to sign in with your Ethereum account:
${this.wallet.address}

Please sign with your account

URI: https://miles.plumenetwork.xyz
Version: 1
Chain ID: 161221135
Nonce: ${data}
Issued At: 2024-07-23T05:42:33.571Z`;

        const signatre = await this.wallet.signMessage(msg);
        const connectBody = {
          message: msg,
          signature: signatre,
          referrer: "PLUME-PLQU2",
          strategy: "web3",
        };
        await this.fetch("/authentication", "POST", undefined, connectBody)
          .then(async (data) => {
            this.token = data.accessToken;
            this.user = data.user;
            await Helper.delay(
              1000,
              this.acc,
              `Connected to plume DAPSS`,
              this
            );
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  }

  async checkIn() {
    try {
      await Helper.delay(2000, this.acc, `Try to Check In...`, this);
      const functionName = "checkIn()";
      const functionHash = ethers.keccak256(ethers.toUtf8Bytes(functionName));
      const checkInData = functionHash.slice(0, 10);

      const feeData = await this.provider.getFeeData();
      logger.info(`Fee Data : ${JSON.stringify(feeData)}`);
      const nonce = await this.provider.getTransactionCount(
        this.wallet.address
      );
      logger.info(`Nonce : ${nonce}`);

      const err = false;
      const gas = await this.wallet
        .estimateGas({
          data: checkInData,
          to: CHECKIN_IMPL_CONTRACT,
        })
        .catch(async (err) => {
          if (err.message.includes("estimateGas")) {
            await Helper.delay(
              2000,
              this.acc,
              `Failed to estimate gas, posible already check in. Skipping Check in.`,
              this
            );
            err = true;
          } else {
            throw err;
          }
        });

      if (err == false && gas != undefined) {
        logger.info(`GAS ${gas}`);

        const tx = {
          to: CHECKIN_IMPL_CONTRACT,
          from: this.wallet.address,
          nonce,
          data: checkInData,
          gas: gas,
          gasPrice: feeData.gasPrice,
        };

        logger.info(`TX ${JSON.stringify(Helper.serializeBigInt(tx))}`);

        await this.executeTx(tx);
      }
    } catch (error) {
      throw error;
    }
  }

  async executeTx(tx) {
    try {
      await Helper.delay(500, this.acc, `Building Tx...`, this);
      logger.info(JSON.stringify(Helper.serializeBigInt(tx)));
      const txRes = await this.wallet.sendTransaction(tx);
      await Helper.delay(500, this.acc, `Transaction Sended ...`, this);
      await Helper.delay(
        500,
        this.acc,
        `Waiting Transaction Confirmation ...`,
        this
      );
      const txRev = await txRes.wait();
      logger.info(JSON.stringify(Helper.serializeBigInt(txRev)));
      await Helper.delay(
        2000,
        this.acc,
        `Transaction Success, TX Hash: ${txRev.hash}`,
        this
      );
      await this.getBalance(true);
    } catch (error) {
      throw error;
    }
  }
}
