import net from 'node:net'
let count = 0
let timer = null
let cahe = new Uint8Array
const socket = net.connect({
  port: 3001,
  host: 'localhost',
  onread: {
    // Reuses a 4KiB Buffer for every read from the socket.
    buffer: Buffer.alloc(4 * 1024),
    callback: function (nread, buf) {
      // Received data is available in `buf` from 0 to `nread`.
    //   console.log(123, buf.toString('utf8', 0, nread))
    console.log('对应缓冲区buff', buf, nread)
    //   if (timer) {
    //     clearTimeout(timer)
    //   }
    //   timer = setTimeout(() => {
    //     socket.write(`测试传过去信息${count++}\r\n`)
    //     socket.pipe(socket)
    //   }, 1000)
    },
  },
})
socket.write(`你好服务器\r\n`)
socket.pipe(socket)
socket.addListener('data', (value) => {
  console.log('来自服务器的消息', value.toString('utf-8'))
})
