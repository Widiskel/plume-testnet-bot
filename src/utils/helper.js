import bip39 from "bip39";
import twist from "./twist.js";

export class Helper {
  static delay = (ms, acc, msg, obj) => {
    return new Promise((resolve) => {
      let remainingMilliseconds = ms;

      if (acc) {
        twist.log(msg, acc, obj, `Delaying for ${this.msToTime(ms)}`);
      } else {
        twist.info(`Delaying for ${this.msToTime(ms)}`);
      }

      const interval = setInterval(() => {
        remainingMilliseconds -= 1000;
        if (acc) {
          twist.log(
            msg,
            acc,
            obj,
            `Delaying for ${this.msToTime(remainingMilliseconds)}`
          );
        } else {
          twist.info(`Delaying for ${this.msToTime(remainingMilliseconds)}`);
        }

        if (remainingMilliseconds <= 0) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        twist.cleanInfo();
        twist.log(msg, acc, obj);
        resolve();
      }, ms);
    });
  };

  static msToTime(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const remainingMillisecondsAfterHours = milliseconds % (1000 * 60 * 60);
    const minutes = Math.floor(remainingMillisecondsAfterHours / (1000 * 60));
    const remainingMillisecondsAfterMinutes =
      remainingMillisecondsAfterHours % (1000 * 60);
    const seconds = Math.round(remainingMillisecondsAfterMinutes / 1000);

    return `${hours} Hours ${minutes} Minutes ${seconds} Seconds`;
  }

  static random(min, max) {
    const rand = Math.floor(Math.random() * (max - min + 1)) + min;
    return rand;
  }

  static randomUserAgent() {
    const list_useragent = [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/125.2535.60 Mobile/15E148 Safari/605.1.15",
      "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 EdgA/124.0.2478.104",
      "Mozilla/5.0 (Linux; Android 10; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 EdgA/124.0.2478.104",
      "Mozilla/5.0 (Linux; Android 10; VOG-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 OPR/76.2.4027.73374",
      "Mozilla/5.0 (Linux; Android 10; SM-N975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 OPR/76.2.4027.73374",
    ];
    return list_useragent[Math.floor(Math.random() * list_useragent.length)];
  }

  static serializeBigInt = (obj) => {
    return JSON.parse(
      JSON.stringify(obj, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
  };

  static isMnemonic(input) {
    return bip39.validateMnemonic(input);
  }

  static isPrivateKey(input) {
    const regex = /^[a-fA-F0-9]{64}$/;
    return regex.test(input);
  }

  static determineType(input) {
    if (this.isMnemonic(input)) {
      return "Secret Phrase";
    } else if (this.isPrivateKey(input)) {
      return "Private Key";
    } else {
      return "Unknown";
    }
  }
}
