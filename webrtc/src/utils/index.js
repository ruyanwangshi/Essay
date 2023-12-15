const os = require('os')

exports.getIpPost = function () {
  let ipObject = {
    IPv4: '',
    IPv6: '',
  }
  // 获取网络接口信息
  const networkInteerfaces = os.networkInterfaces()

  // 遍历所有网络接口
  for (const interfaceName in networkInteerfaces) {
    const interfaces = networkInteerfaces[interfaceName]
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // 找到第一个非内部的IPv4地址
        !ipObject.IPv4 && (ipObject.IPv4 = iface.address)
        // console.log(`IPv4 地址 (${interfaceName})：${iface.address}`)
      } else if (iface.family === 'IPv6' && !iface.internal) {
        // 找到第一个非内部的IPv6地址
        !ipObject.IPv6 && (ipObject.IPv6 = iface.address)
        // console.log(`IPv6 地址 (${interfaceName})： ${iface.family}`)
      }
    }
  }
  return ipObject
}
