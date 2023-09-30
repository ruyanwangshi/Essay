const http = require('http')
const express = require('express')
const SocketIo = require('socket.io')
const cors = require('cors')
const log4js = require('log4js')

const USERCOUNT = 3

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

app.use(express.static('public'))

// app.all('*', function(req, res, next){
//     res.header('Access-Control-Allow-Origin',  '*');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With, yourHeaderFeild');
//     res.header('Access-Control-Allow-Methods', 'WS, PUT, POST, GET, DELETE, OPTIONS');
//     if (req.method === 'OPTIONS'){
//       res.sendStatus(200);
//     }else{
//       next();
//     }
//   });

// const http_server1 = http.createServer((request, res) => {
//     res.writeHead(200, { 'Content-Type': 'application/json' });
//     res.end(JSON.stringify({
//       data: 'Hello World!',
//     }));
//   })

//   http_server1.listen(8081, 'localhost')

const http_server2 = http.createServer(app)

//io.Socket
const io = SocketIo(http_server2)

// 处理链接事件
io.sockets.on('connection', (socket) => {
    // 中转消息
    socket.on('message', (room, data) => {
        console.log(`message, room: ${room}, data, type ${data.type}`)
        logger.debug(`message, room: ${room}, data, type ${data.type}`)
        socket.to(room).emit('message', room, data)
    })

    // 用户加入房间
    socket.on('join', (room) => {
        
        socket.join(room)
        const myRoom = io.sockets.adapter.rooms.get(room)
        console.log('用户列表为：', myRoom, io.sockets.adapter.rooms)
        const users = myRoom ? myRoom.size : 0
        
        console.log('对应的房间号', room, io.sockets.adapter.rooms);
        logger.debug(`the userr number of romm (${room}) is ${users}`)

        // 如果房间人未满
        if (users < USERCOUNT) {
            // 发给除自己以外的房间内的所有人
            socket.emit(`joined`, room, socket.id)

            // 通知另一个用户，有人来了
            if (users > 1) {
                socket.to(room).emit('otherjoin', room, socket.id)
            }
        } else {
            // 如果房间人满了
            socket.leave(room)
            socket.emit('full', room, socket.id)
        }
    })

    // 用户离开房间
    socket.on('leave', (room) => {
        // 从管理列表中将用户删除
        socket.leave(room)

        const myRoom = io.sockets.adapter.rooms[room]
        const users = myRoom ? Object.keys(myRoom.socket).length : 0

        logger.debug(`the user number of room is ${users}`)

        // 通知其他用户有人离开了
        socket.to(room).emit('bye', room, socket.id)

        // 通知用户服务器已处理
        socket.emit('leaved', room, socket.id)
    })
})

http_server2.listen(8080, 'localhost')

