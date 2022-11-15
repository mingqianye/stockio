// IAppOption.ts
import { StockioClient } from "../client/shared/clientCore";

export default interface IAppOption {
  globalData: {
    stockioClient?: StockioClient
  }
}
