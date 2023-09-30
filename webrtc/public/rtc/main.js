
// 本地视频预览窗口
const localVideo = document.querySelector('#user-1')

// 远端视频预览窗口
const remoteVideo = document.querySelector('#user-2')

// 连接信令服务器button
const btnConn = document.querySelector('#connserver')

// 断开信令服务器button
const btnLeave = document.querySelector('#leave')

// 查看Offer文本窗口
const offer = document.querySelector('#offer')

// 查看Answer文本窗口
const answer = document.querySelector('#answer')

const pcConfig = {
  iceServers: [
    {
      // TURN 服务器地址
      urls: 'turn:124.70.60.216:5666',
    //   urls: 'stun:124.70.60.216:5666',
    //   urls: 'stun:stun.1.google.com:19302',
      // TURN 服务器用户名称
      username: 'coturn',
      // TURN 服务器密码
      credential: '123456',
    },
  ],
  // 默认使用relay 方式传输数据
  iceTransportPolicy: 'relay',
  iceCandidtePoolSize: '0',
}

// 本地视频流
let localStream = null
// 远端视频流
let remoteStream = null
// PeerConnection
let pc = null

// 房间号
let roomid
let socket = null

// offer 描述
let offerdesc = null

// 状态机，初始为init
let state = 'init'

/**
 * 功能： 判断此浏览器是在PC端，还是在移动端。
 * 返回值：false，说明当前操作系统是移动端；true，说明当前的操作系统是PC端。
 */

function IsPC() {
  let userAgentInfo = navigator.userAgent
  const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']
  let flag = true

  Agents.forEach((agent) => {
    if (userAgentInfo.indexOf(agent) > 0) {
      flag = false
    }
  })

  return flag
}

/**
 * 功能：判断是Android 端 还是IOS端。
 *
 * 返回值：true，说明是Android端；
 * false，说明是IOS端。
 */

function IsAndroid() {
  const u = navigator.userAgent

  const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1
  const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
  if (isAndroid) {
    // 这个是android系统
    return true
  }
  if (isIOS) {
    // 这个是IOS系统
    return false
  }
}

/**
 * 功能： 从url中获取指定的域值
 * 返回值：指定的域值或是false
 */

function getQueryVariable(variable) {
  const query = window.location.search.substring(1)
  const vars = query.split('&')
  let value
  vars.forEach((item) => {
    const pair = item.split('=')
    if (pair[0] === variable) {
      value = pair[1]
    }
  })
  return value
}

/**
 * 功能：向对端发消息
 * 返回值：无
 */

function sendMessage(roomid, data) {
  console.log('send message to other end', roomid, data)
  if (!socket) {
    console.log('socket is null')
    return 
  }
  socket.emit('message', roomid, data)
}

/**
 * 功能： 与信令服务器建立socket.io连接；
 * 并根据更新状态机。
 *
 * 返回值：无
 */

function conn() {
  // 连接信令服务器
  socket = io.connect()
    console.log('是否进行了链接', socket)
  // 'joined' 消息处理函数
  socket.on('joined', (roomid, id) => {
    console.log('receive joined message!', roomid, id)

    // 状态机变更为'joined
    state = 'joined'

    /**
     * 如果视Mesh方案，第一个人不该在这里创建
     * peerConnection，而是要等待所有端都收到
     * 一个'otherjoin' 消息时再创建
     */

    // 创建PeerConnection 并绑定音视频轨
    createPeerConnection()
    bindTracks()

    // 设置button状态
    btnConn.disabled = true
    btnLeave.disabled = false

    console.log('receive joined message, state=', state)
  })

  // otherjoin 消息处理函数
  socket.on('otherjoin', (roomid) => {
    console.log('receive joined message:', roomid, state)

    // 如果是多人，没加入一个人都要创建一个新的PeerConnection
    if (state === 'joined_unbind') {
      createPeerConnection()
      bindTracks()
    }

    // 状态机变更为joined_conn
    state = 'joined_conn'

    // 开始“呼叫”对方
    call()

    console.log('receive other_join message, state=', state)
  })

  // full 消息处理函数
  socket.on('full', (roomid, id) => {
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
    alert('房间已满！')
  })

  // leaved 消息处理函数
  socket.on('leaved', (roomid, id) => {
    console.log('receive leaved message', roomid, id)

    // 状态机变为leaved
    state = 'leaved'
    // 关闭socket.io连接
    socket.disconnect()
    console.log('receive leaved message, state=', state)

    // 改变button 状态
    btnConn.disabled = false
    btnLeave.disabled = true
  })

  // bye 消息处理函数
  socket.on('bye', (room, id) => {
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
  })

  // 收到对端消息处理函数
  socket.on('message', (roomid, data) => {
    console.log('receive message!', roomid, data)

    if (data === null || data === undefined) {
      console.error('the message is invalid')

      return
    }

    // 如果收到SDP 是offer
    if (data.hasOwnProperty('type') && data.type === 'offer') {
      offer.value = data.sdp

      // 进行媒体协商
      pc.setRemoteDescription(new RTCSessionDescription(data))

      // 创建answer
      pc.createAnswer().then(getAnswer).catch(handleAnswerError)

      // 如果收到的SDP 是answer
    } else if (data.hasOwnProperty('type') && data.type == 'answer') {
      answer.value = data.sdp

      // 进行媒体协商
      pc.setRemoteDescription(new RTCSessionDescription(data))

      // 如果收到的是Candidate消息
    } else if (data.hasOwnProperty('type') && data.type === 'candidate') {
      const candidate = new RTCIceCandidate({
        sdpMLineIndex: data.label,
        candidate: data.candidate,
      })

      // 将远端Candidiate 消息添加到PeerConnection中
      pc.addIceCandidate(candidate)
    } else {
      console.log('该消息是无效的xiao', data)
    }
  })

  // 从url中获取roomid
  roomid = getQueryVariable('room')

  // 发送'join'消息
  socket.emit('join', roomid)

  return true
}

/**
 * 功能：打开音视频设备，并连接信令服务器
 * 返回值：永远为true
 */

function connSignalServer() {
  // 开启本地视频
  start()

  return true
}

/**
 * 功能：打开音视频设备成功时的回调函数
 *
 * 返回值：永远为true
 */

function getMediaStream(stream) {
  // 将从设备上获取到的音视频track 添加到localStream中
  if (localStream) {
    stream.getAudioTracks().forEach((track) => {
      localStream.addTrack(track)
      stream.removeTrack(track)
    })
  } else {
    localStream = stream
  }

  //  本地视频标签与本地流绑定
  localVideo.srcObject = localStream

  /**
   * 调用conn() 函数的位置特别重要，一定要在getMeiaStream 调用之后再调用它，否则会出现绑定失败的情况
   */

  // setup connection
  conn()
}

/**
 * 功能：错误处理函数
 *
 * 返回值：无
 */

function handleError(err) {
  console.error('Failed to get Media Stream!', err)
}

/**
 * 功能：打开音视频设备
 *
 * 返回值：无
 */

function start() {
  let constraints
  console.log()
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error('the getUserMedia is no supported!')
    return
  } else {
    constraints = {
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    }
    navigator.mediaDevices.getUserMedia(constraints).then(getMediaStream).catch(handleError)
  }
}

/**
 * 功能：获得远端媒体流
 *
 * 返回值：无
 */

function getRemoteStream(e) {
  // 存放远端视频流
  remoteStream = e.streams[0]
    console.log('对应的视频流', remoteStream)
  // 远端视频标签与远端视频流绑定
  remoteVideo.srcObject = e.streams[0]
}

/**
 * @desc 处理Offer 错误
 * @return {undefined} 无
 */

function handleOfferError(err) {
  console.error('Failed to create offer:', err)
}

/**
 * @desc 处理Answer错误
 * @return {undefined} 无
 */
function handleAnswerError(err) {
  console.error('Failed to create answer:', err)
}

/**
 * @desc 获取Answer SDP描述符的回调函数
 * @return {undefined} 无
 */
function getAnswer(desc) {
  // 设置Answer
  pc.setLocalDescription(desc)
  console.log('对应的getAnswer', desc)
  // 将Answer 显示出来
  answer.value = desc.sdp

  // 将Answer SDP发送给对端
  sendMessage(roomid, desc)
}

/**
 * @desc 获取Offer SDP描述符的回调函数
 * @return {undefined} 无
 */

function getOffer(desc) {
  // 设置Offer
  pc.setLocalDescription(desc)

  // 将Offer显示出来
  offer.value = desc.sdp
  offerdesc = desc

  // 将Offer SDP发送给对端
  sendMessage(roomid, offerdesc)
}

/**
 * @desc 创建PeerConnection
 * @return {undefined} 无
 */
function createPeerConnection() {
  /**
   * 如果是多人的话，再这里要创建一个新的连接.
   * 新创建好的要放到一个映射表中
   */
  // key = userid, value = peerConnection
  console.log('create RTCPeerConnection!')
  if (!pc) {
    // 创建PeerConnection 对象
    pc = new RTCPeerConnection(pcConfig)

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
 * @desc 将音视频track 绑定到PeerConnection对象中发
 * @return {undefined} description
 */

function bindTracks() {
  console.log('bind tracks into RTCPeerConnection!')
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
    pc.addTrack(track, localStream)
  })
}

/**
 * @desc 开启'呼叫'
 * @return {undefined} 无
 */

function call() {
  if (state === 'joined_conn') {
    const offerOptions = {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1,
    }
    /**
     * 创建Offer，
     * 如果成功，则回调getOffer()方法
     * 如果失败，则回调handleOfferError()方法
     */
    pc.createOffer(offerOptions).then(getOffer).catch(handleOfferError)
  }
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
  btnConn.disabled = false
  btnLeave.disabled = true
}

// 为Button 设置单击事件
btnConn.onclick = connSignalServer
btnLeave.onclick = leave
