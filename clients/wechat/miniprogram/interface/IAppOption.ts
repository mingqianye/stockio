// IAppOption.ts
import { StockioClient } from "../client/shared/clientCore";

export default interface IAppOption {
  globalData: {
    systemInfo?: WechatMiniprogram.GetSystemInfoSuccessCallbackResult,
    stockioClient?: StockioClient,
    userInfo: string
  }

  eventQueue?: Array<any> | undefined

  observeGlobalData(): void

  observe(obj: any, key: PropertyKey): void

  emitWatch(obj: any, key: PropertyKey, value: any): void

  onWatch(content: any): void

  offWatch(content: any): void
}
