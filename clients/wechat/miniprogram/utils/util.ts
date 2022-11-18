export const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}

//将wx的函数Promise化
export const promisify = (fn: any) => {
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