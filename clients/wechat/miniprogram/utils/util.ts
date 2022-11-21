//将wx的函数Promise化
export const promisify: any = (fn: any) => {
  return function (obj: any = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res: any) {
        resolve(res)
      }

      obj.fail = function (res: any) {
        reject(res)
      }

      fn(obj)//执行函数，obj为传入函数的参数
    })
  }
}