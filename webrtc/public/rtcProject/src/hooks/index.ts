export * from './utils'
export * from './events'
// import { io } from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js'
import { io } from 'socket.io-client'

import { runEvents } from './events'
import { config } from '../config'
let socket: any = null
let state: string = 'init'
let getRomteStreamFn = null
const peerConData = {} as {
  [key: string]: RTCPeerConnection
}
let otherCode = ''
const offer = {
  value: '',
}
const answer = {
  value: '',
}

/**
 * 功能：打开音视频设备成功时的回调函数
 *
 * 返回值：永远为true
 */

function createUniqueDescriptionId() {
  return Math.random().toString(36).substring(2, 15)
}
export const userCode = createUniqueDescriptionId()

export function getMediaStream(stream) {
  // 将从设备上获取到的音视频track 添加到localStream中
  if (localStream) {
    stream.getAudioTracks().forEach((track) => {
      localStream.addTrack(track)
      stream.removeTrack(track)
    })
  } else {
    localStream = stream
  }

  //   /**
  //    * 调用conn() 函数的位置特别重要，一定要在getMeiaStream 调用之后再调用它，否则会出现绑定失败的情况
  //    */

  //   // setup connection
  //   conn()
}

// 本地视频流
let localStream: string | null = null
// 远端视频流
let remoteStream: string | null = null
// PeerConnection
let pc: RTCPeerConnection | null = null

// 房间号
let roomid: string

// offer 描述
let offerdesc = null

export function createConn(url?: string, callback?: () => void, room: string) {
  getRomteStreamFn = callback
  roomid = room
  if (!socket) {
    socket = io.connect(url)
    console.log('对应的socketid', socket.id)
  }
  // 注册事件
  registerEvents()
  return socket
}

// 注册事件
function registerEvents() {
  // 'joined' 消息处理函数
  socket.on('joined', (roomid: string, id: string) => {
    otherCode = id
    console.log('receive joined message!', roomid, id)
    // 状态机变更为'joined
    state = 'joined'
    /**
     * 如果视Mesh方案，第一个人不该在这里创建
     * peerConnection，而是要等待所有端都收到
     * 一个'otherjoin' 消息时再创建
     */

    // 创建PeerConnection 并绑定音视频轨
    createPeerConnection(id)
    // bindTracks()
    call(id)
    runEvents('joined', roomid, id)
  })

  // 'create' 消息处理函数
  socket.on('created', (roomid: string, id: string) => {
    console.log('执行了', 'created')
    // 状态机变更为'joined
    state = 'created'
    // 创建PeerConnection 并绑定音视频轨
    otherCode = id

    console.log('房间创建', roomid, id)
    runEvents('created', roomid, id)
  })

  // otherjoin 消息处理函数
  socket.on('otherjoin', (roomid: string, userId: string) => {
    console.log('receive otherjoin message:', roomid, state, userId === userCode, typeof socket.id)

    // 如果是多人，每加入一个人都要创建一个新的PeerConnection
    if (state === 'joined_unbind') {
      createPeerConnection(userId)
      bindTracks(userId)
    }

    // 状态机变更为joined_conn
    state = 'joined_conn'

    // 开始“呼叫”对方
    // if (userId === userCode) {
    call(userId)
    // }

    runEvents('otherjoin')
    console.log('receive other_join message, state=', state)
  })

  // full 消息处理函数
  socket.on('full', (roomid: string, id: string) => {
    console.log('receive full message', roomid, id)

    // 关闭socket.io连接
    socket.disconnect()
    // 关断“呼叫”
    hangup()
    // 关闭本地媒体
    closeLocalMedia()
    // 状态机变更为
    state = 'leaved'
    console.log('receive full message, state=', state)
    runEvents('full')
  })

  // leaved 消息处理函数
  socket.on('leaved', (roomid: string, id: string) => {
    console.log('receive leaved message', roomid, id)

    // 状态机变为leaved
    state = 'leaved'
    // 关闭socket.io连接
    socket.disconnect()
    console.log('receive leaved message, state=', state)

    // 改变button 状态
    runEvents('leaved')
  })

  // bye 消息处理函数
  socket.on('bye', (room: string, id: string) => {
    console.log('receive bye message', roomid, id)

    /**
     * 当时Mesh方案时，应该带上当前房间的用户数，
     * 如果当前房价用户数不小于2，则不用修改状态，
     * 并且关闭的应该是对应用户的PeerConnection.
     * 再客户端应该维护一张PeerConnection表，它是
     * key:value的格式，key = userid, value = peerConnection
     */

    // 状态机变更为joined_unbind
    state = 'joined_unbind'

    // 挂断"呼叫"
    hangup()

    offer.value = ''
    answer.value = ''
    console.log('receive bye message, state=', state)
    runEvents('bye')
  })

  // socket.io 连接断开处理函数
  socket.on('disconnect', (socket) => {
    console.log('receive disconnect message!', roomid)

    if (!(state === 'leaved')) {
      // 挂断'呼叫'
      hangup()

      // 关闭本地媒体
      closeLocalMedia()

      // 状态机变更为leaved
      state = 'leaved'
    }

    runEvents('disconnect')
  })

  // 收到对端消息处理函数
  socket.on('message', (roomid, data, id) => {
    console.log('receive message!', roomid, data)
    createPeerConnection(id)
    // bindTracks(id)
    if (data === null || data === undefined) {
      console.error('the message is invalid')
      return
    }
    console.log('对应获取的类型', data.type)
    if (data.hasOwnProperty('type')) {
      switch (data.type) {
        case 'offer': // 如果收到的SDP 是offer
          setOffer(data, id)
          break
        case 'answer': // 如果收到的SDP 是answer
          setAnswer(data)
          break
        case 'candidate': // 如果收到的SDP 是candidate
          setCandidate(data)
          break
        default:
          console.error('异常数据', data)
      }
    } else {
      console.error('数据是无效的')
    }
    runEvents('message')
  })
}

function setOffer(data, id) {
  offer.value = data.sdp

  const pc = peerConData[id]
  if (!pc) {
    console.error('pc对象找不到', pc)
    return
  }
  // 进行媒体协商
  pc.setRemoteDescription(new RTCSessionDescription(data))

  // 创建answer
  pc.createAnswer()
    .then(function (desc) {
      // 设置Answer
      pc.setLocalDescription(desc)
      console.log('对应的getAnswer', desc)

      // 将Answer SDP发送给对端
      sendMessage(roomid, desc)
    })
    .catch(function (error) {
      console.log('获取answer异常', error)
    })
}
function setAnswer(data) {
  const pc = peerConData[otherCode]
  console.log('设置answer的时候', otherCode, pc)
  // 进行媒体协商
  pc.setRemoteDescription(new RTCSessionDescription(data))
}
function setCandidate(data) {
  const pc = peerConData[otherCode]
  console.log('设置candidate的时候', otherCode, pc)
  const candidate = new RTCIceCandidate({
    sdpMLineIndex: data.label,
    candidate: data.candidate,
  })

  // 将远端Candidiate 消息添加到PeerConnection中
  pc.addIceCandidate(candidate)
}

/**
 * @desc 创建PeerConnection
 * @return {undefined} 无
 */
function createPeerConnection(userId) {
  console.log('是否有userId', userId)
  /**
   * 如果是多人的话，再这里要创建一个新的连接.
   * 新创建好的要放到一个映射表中
   */
  // key = userid, value = peerConnection

  let pc = peerConData[userId]
  if (!pc) {
    pc = peerConData[userId] = new RTCPeerConnection(config)
  } else {
    console.log('已经创建过了')
    return
  }
  console.log('create RTCPeerConnection!')
  if (!pc) {
    // 创建PeerConnection 对象

    // 当收集到Candidate 后
    pc.onicecandidate = (e) => {
      console.log('执行了', e)
      if (e.candidate) {
        console.log(`candidate${JSON.stringify(e.candidate.toJSON())}`)

        // 将Candidate 发送给对端
        sendMessage(roomid, {
          type: 'candidate',
          label: e.candidate.sdpMLineIndex,
          id: e.candidate.sdpMid,
          candidate: e.candidate.candidate,
        })
      } else {
        console.log('this is the end candidate')
      }
    }
    /**
     * 当PeerConnection 对象收到的远端音视频流时
     * 触发ontrack事件
     * 并回调getRemoteStream函数
     */
    pc.ontrack = getRemoteStream
  } else {
    console.log('the pc have be created!')
  }
}

/**
 * 功能：获得远端媒体流
 *
 * 返回值：无
 */

function getRemoteStream(e) {
  //   // 存放远端视频流
  //   remoteStream = e.streams[0]
  //   console.log('对应的视频流', remoteStream)
  //   // 远端视频标签与远端视频流绑定
  //   remoteVideo.srcObject = e.streams[0]
  if (typeof getRomteStreamFn === 'function') {
    getRomteStreamFn(e.streams[0])
  }
}

/**
 * @desc 将音视频track 绑定到PeerConnection对象中发
 * @return {undefined} description
 */

function bindTracks(id) {
  console.log('bind tracks into RTCPeerConnection!')
  const pc = peerConData[id]
  if (pc === null && localStream === undefined) {
    console.error('pc is null or undefined')
    return
  }

  if (localStream === null && localStream === undefined) {
    console.error('localStream is null or undefined!')
    return
  }

  // 将本地音视频流中所有track 添加到PeerConnection对象中
  localStream.getTracks().forEach((track) => {
    console.log('是否存在pc', pc?.addTrack)
    pc.addTrack(track, localStream)
  })
}

/**
 * @desc 开启'呼叫'
 * @return {undefined} 无
 */

function call(id) {
  const pc = peerConData[id]
  //   if (state === 'joined_conn') {
  const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1,
  }
  /**
   * 创建Offer，
   * 如果成功，则回调getOffer()方法
   * 如果失败，则回调handleOfferError()方法
   */
  pc.createOffer(offerOptions as RTCOfferOptions)
    .then(getOffer.bind(this, id))
    .catch(handleOfferError)
  //   }
}

/**
 * @desc 获取Offer SDP描述符的回调函数
 * @return {undefined} 无
 */

function getOffer(id, desc: RTCSessionDescriptionInit) {
  const pc = peerConData[id]
  // 设置Offer
  pc.setLocalDescription(desc)

  // 将Offer显示出来
  offerdesc = desc
  console.log('用户主动发送offer', id, desc, pc)
  // 将Offer SDP发送给对端
  sendMessage(roomid, offerdesc, id)
}

/**
 * @desc 处理Offer 错误
 * @return {undefined} 无
 */

function handleOfferError(err) {
  console.error('Failed to create offer:', err)
}

/**
 * @desc 挂断'呼叫'
 * @return {undefined} description
 */

function hangup() {
  if (!pc) {
    return
  }
  offerdesc = null

  // 将PeerConnection 连接关掉
  pc.close()
  pc = null
}

/**
 * @desc  关闭本地媒体
 * @return {undefined} 无
 */

function closeLocalMedia() {
  if (!(localStream === null || localStream === undefined)) {
    // 遍历每个track, 并将其关闭
    localStream.getTracks.forEach((track) => {
      track.stop()
    })
  }
  localStream = null
}

/**
 * @desc 离开房间
 * @return {undefined} 无
 */

function leave() {
  // 向信令服务器发送leave消息
  socket.emit('leave', roomid)

  // 挂断'呼叫'
  hangup()

  // 关闭本地媒体
  closeLocalMedia()

  offer.value = ''
  answer.value = ''
}

/**
 * 功能：向对端发消息
 * 返回值：无
 */

function sendMessage(roomid: string, data, userId?: string) {
  console.log('send message to other end', roomid, data)
  if (!socket) {
    console.log('socket is null')
    return
  }
  socket.emit('message', roomid, data, userId)
}

/**
 * @desc 发送当前状态以及房间号
 */

export function sendStateAndRoomId(state: runEvents, roomid: string) {
  if (!socket) {
    console.error('请先初始化socket')
  }
  socket.emit(state, roomid)
}
