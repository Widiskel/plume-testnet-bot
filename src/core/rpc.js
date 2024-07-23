import { ethers } from "ethers";

export class RPC {
  static RPC_URL = "https://testnet-rpc.plumenetwork.xyz/http";
  static provider = new ethers.JsonRpcProvider(this.RPC_URL);
}
