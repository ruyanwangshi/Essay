import net from 'node:net'
let count = 0
let timer = null
const serve = net.createServer((c) => {
  c.on('end', () => {
    console.log('客户端的连接已关闭')
  })
  c.on('data', (value) => {
    console.log('321', value.toString('utf8'))
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      c.write(`hello${count++}\r\n`)
      c.pipe(c)
    }, 1000)
  })
})

serve.on('error', (err) => {
  console.log('tcp连接错误', err)
})

serve.listen(3001, () => {
  console.log('当前tcp绑定的服务是3001')
})

// console.log('对应的serve', serve)

console.log(serve.write)
