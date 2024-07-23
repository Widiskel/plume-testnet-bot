import { addressList } from "./address_list.js";

export class Config {
  static maxErrorCount = 3; //max error retry
  static destAddress = addressList; //address destination list
}
