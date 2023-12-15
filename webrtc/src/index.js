const http = require('http')
const express = require('express')
const SocketIo = require('socket.io')
const cors = require('cors')
const log4js = require('log4js')
const { getIpPost } = require('./utils/index.js')

const USERCOUNT = 20
const rooms = new Map()

const ipObject = getIpPost()

// 日志的配置项
log4js.configure({
  appenders: {
    file: {
      type: 'file',
      filename: 'app.log',
      layout: {
        type: 'pattern',
        pattern: '%r %p - %m',
      },
    },
  },
  categories: {
    default: {
      appenders: ['file'],
      level: 'debug',
    },
  },
})

const logger = log4js.getLogger()

const app = express()
app.use(cors())
app.use(express.static('public'))

const http_server2 = http.createServer(app)

//io.Socket
const io = SocketIo(http_server2)

function getRoomUserList(room) {
  const myRoom = io.sockets.adapter.rooms.get(room)
  return myRoom
}

// function setRoomUserList(room, userId) {
//   let myRoom = getRoomUserList(room)
//   if (!myRoom) {
//     io.sockets.adapter.rooms.set(room, (myRoom = new Set([userId])))
//   }
//   myRoom.add(userId)
//   return myRoom
// }

// function deleteRoomUser(room, userId) {
//   let myRoom = getRoomUserList(room)
//   if (!myRoom) {
//     return
//   }
//   myRoom.delete(userId)
// }

// 处理链接事件
io.sockets.on('connection', (socket) => {
  // console.log('开始链接', Object.keys(socket), socket['adapter'], socket['handshake']);
  console.log(socket.query)

  // 中转消息
  socket.on('message', (data) => {
    if (!data) {
      console.log('没有要发送的数据', data)
      return
    }
    // console.log(`message, room: ${room}, data, type ${data}`)
    // logger.debug(`message, room: ${room}, data, type ${data}`)
    // socket.to(room).emit('message', room, data, userId)
    console.log('需要转发的对象', data.recUserId, data.sdp.type)
    socket.to(data.recUserId).emit('message', data)
  })

  // 用户加入房间
  socket.on('join', (room, callback) => {
    
    // 设置对应的加入房间和用户
    socket.join(room) // 这个方法会自动把room和当前加入的socket.id映射起来
    const myRoom = getRoomUserList(room)
    
    console.log('房间号', room, '用户列表为：', myRoom, io.sockets.adapter.rooms, callback)
    const users = myRoom.size
    logger.debug(`the userr number of romm (${room}) is ${users}`)

    // 如果房间人未满
    if (users < USERCOUNT) {
      // 发给除自己以外的房间内的所有人
      const params = {
        id: socket.id,
        rooms: [...myRoom]
      }
      callback(paramsFormatter(params))
      // 通知另一个用户，有人来了，广播出自己之外所有的人
      if (users > 1) {
        // 把加入人的socket.id广播给这个房间的其它用户用来初始化对等连接
        socket.to(room).emit('otherjoin', socket.id)
      }
    } else {
      // 如果房间人满了
      socket.leave(room)
      socket.emit('full', room, socket.id)
    }
  })

  function paramsFormatter(params) {
    return JSON.stringify(params)
  }

  // 用户离开房间
  socket.on('leave', (room) => {
    // 从管理列表中将用户删除
    socket.leave(room)
    console.log('有人离开了',room)

    const myRoom = getRoomUserList(room)
    const users = myRoom ? myRoom.size : 0
    
    console.log('房间里面是否还有人', myRoom)
    logger.debug(`the user number of room is ${users}`)

    // 通知其他用户有人离开了
    socket.to(room).emit('bye', room, socket.id)

    // 通知用户服务器已处理
    socket.emit('leaved', room, socket.id)
  })
})

const post = 8080

http_server2.listen(post, 'localhost', () => {
  console.log('对应ip地址', `${ipObject.IPv4}:${post}`)
})
