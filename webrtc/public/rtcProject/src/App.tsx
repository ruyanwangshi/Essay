import { FormEvent, useState, useRef, memo, useEffect } from 'react'
import { Button, Modal, Input } from 'antd'
import { openVideoAndAudio } from './hooks'
import { io, Socket } from 'socket.io-client'
import { config } from './config'
import './App.css'
const peerConnectList = new Map<string, RTCPeerConnection>()
let localStream
function App() {
  const [isShow, setShow] = useState(false)
  const [flag, setFlag] = useState(true)
  const [value, setValue] = useState('')
  const localVideo = useRef<HTMLVideoElement | null>(null) // 本地视频
  const remoteVideo = useRef<HTMLVideoElement | null>(null) // 远程视频
  const isJoinRoom = useRef(false) // 是否加入了房间
  const socket = useRef<Socket>() // socket对象
  const myId = useRef('')
  const [userList, setUserList] = useState([])
  /**
   * 创建RTCPeer
   * @param creatorUserId 创建者id，本人
   * @param recUserId 接收者id
   */
  const initPeer = async (creatorUserId: string, recUserId: string) => {
    const peerConnect = new RTCPeerConnection(config)

    // 注册候选者监听事件，ice自动选择最优的连接方式
    peerConnect.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      if (!peerConnect.currentRemoteDescription) return
      if (e.candidate) {
        const res = {
          creatorUserId,
          recUserId,
          sdp: {
            type: 'candidate',
            label: e.candidate.sdpMLineIndex,
            id: e.candidate.sdpMid,
            candidate: e.candidate.candidate,
          },
        }
        socket.current.emit('message', res)
      }
    }

    // 从对等层接收远端视频数据流
    peerConnect.ontrack = (track: RTCTrackEvent) => {
      console.log('是否收到了远程对等层的数据内容', track)
      remoteVideo.current.srcObject = track.streams[0]

      // 分别处理音频和视频
      //   handleVideoAndAudio()
    }

    // 对等层连接状态的变化
    peerConnect.onconnectionstatechange = (ev) => {
      console.log(peerConnect.connectionState, 'onconnectionstatechange')
    }

    setPeerConnectList(creatorUserId, recUserId, peerConnect)
    return peerConnect
  }

  /**
   *
   * @desc 设置对等层映射方法
   * @param creatorUserId 创建人id
   * @param recUserId 接收方id
   * @param peerConnect 映射的对等层对象
   */
  function setPeerConnectList(creatorUserId: string, recUserId: string, peerConnect: RTCPeerConnection) {
    const key = `${creatorUserId}_${recUserId}`
    // 设置对等连接映射对象
    peerConnectList.set(key, peerConnect)
  }

  /**
   * @desc 获取对等层对象句柄
   * @param creatorUserId 创建人id
   * @param recUserId 接收方id
   * @returns RTCPeerConnection
   */
  function getPeerConnectItem(creatorUserId: string, recUserId: string) {
    const key = `${creatorUserId}_${recUserId}`
    // 设置对等连接映射对象
    const peerConnect = peerConnectList.get(key)
    return peerConnect
  }

  /**
   * @desc 删除对等层方法
   * @param creatorUserId 创建人id
   * @param recUserId 接收方id
   * @returns RTCPeerConnection
   */
  function removePeerConnectItem(creatorUserId: string, recUserId: string) {
    const key = `${creatorUserId}_${recUserId}`
    // 设置对等连接映射对象
    const res = peerConnectList.delete(key)
    return res
  }

  /**
   * @desc 音视频分开处理逻辑
   */

  function handleVideoAndAudio(track: RTCTrackEvent, callback) {
    const id = track.streams[0].id
    const box = document.querySelector('#remoteVideo')
    let idBox = document.querySelector(`#PLV${id}`)
    if (!idBox) {
      const div = document.createElement('div')
      div.setAttribute('id', `PLV${id}`)
      box && box.appendChild(div)
      idBox = div
    }
    if (track.track.kind === 'video') {
      const video = document.createElement('video')
      video.srcObject = track.streams[0]
      video.autoplay = true
      video.style.setProperty('width', '400px')
      video.style.setProperty('aspect-ratio', '16 / 9')
      video.setAttribute('id', track.track.id)
      idBox.appendChild(video)
    }
    if (track.track.kind === 'audio') {
      const audio = document.createElement('audio')
      audio.srcObject = track.streams[0]
      audio.autoplay = true
      audio.setAttribute('id', track.track.id)
      idBox.appendChild(audio)
    }
  }

  function createConn() {
    return io()
  }

  const intoRoom = () => {
    if (isJoinRoom.current) {
      console.log('已经加入了房间')
      return
    }
    // 和信令服务器开始连接
    socket.current = createConn()

    // 注册相关的事件
    handlerEvent()
  }

  const handlerEvent = () => {
    // 加入到当前的房间，传入当前加入的房间号，和对应的回调接收函数
    socket.current.emit('join', value, (res: string) => {
      const result = JSON.parse(res) as {
        id: string
        rooms: Array<string>
      }
      myId.current = result.id
      setUserList(result.rooms)
      isJoinRoom.current = true
      console.log('自己的id', myId.current)
    })
    // 其他人加入之后，房主开始开始初始化连接webrtc对象，
    socket.current.on('otherjoin', (recUserId: string) => {
      someOneLogin(recUserId)
    })
    // 处理消息数据，例如spd数据
    socket.current.on('message', (data) => {
      const sdp = data.sdp
      if (sdp && sdp.hasOwnProperty('type')) {
        switch (sdp.type) {
          case 'offer': // 如果收到的SDP 是offer
            handleOffer(data)
            break
          case 'answer': // 如果收到的SDP 是answer
            handleAnswer(data)
            break
          case 'candidate': // 如果收到的SDP 是candidate
            handleIce(data)
            break
          default:
            console.error('异常数据', data)
        }
      }
    })

    // 处理其他人离开房间的动作
    socket.current.on('bye', (room, id) => {
      const peerConneItem = getPeerConnectItem(myId.current, id)
      if (peerConneItem) {
        peerConneItem.close()
      }
      removePeerConnectItem(myId.current, id)
      console.log('有人离开了，对应的离开人的id是', room, id)
    })
  }

  const gotMediaStream = async (stream: MediaStream) => {
    if (!isJoinRoom.current) {
      console.log('请先加入房间，再确认')
      return
    }
    // 将从设备上获取到的音视频track 添加到localStream中
    if (localStream) {
      stream.getAudioTracks().forEach((track) => {
        localStream.addTrack(track)
        stream.removeTrack(track)
      })
    } else {
      localStream = stream
    }
  }

  // 有人进入的当前房间
  async function someOneLogin(recUserId: string) {
    if (!localStream) return
    const peer = await initPeer(myId.current, recUserId)
    await createOffer(recUserId, peer)
  }

  // 发起方创建offer
  const createOffer = async (recUserId: string, peerConnect: RTCPeerConnection, stream: MediaStream = localStream) => {
    if (!localStream) return
    stream.getTracks().forEach((track) => {
      peerConnect.addTrack(track, stream)
    })
    const offer = await peerConnect.createOffer()
    await peerConnect.setLocalDescription(offer)
    socket.current.emit('message', { creatorUserId: myId.current, sdp: offer, recUserId })
  }

  // 接收方处理offer，并创建answer
  const handleOffer = async (offer: { sdp: RTCSessionDescriptionInit; creatorUserId: string; recUserId: string }) => {
    // 先初始化自己的对等层对象
    const peer = await initPeer(myId.current, offer.creatorUserId)

    // 设置对方的offer
    await peer.setRemoteDescription(offer.sdp)

    // 获取answer
    const answer = await peer.createAnswer()

    // 设置本地answer
    await peer.setLocalDescription(answer)

    // 回答answer
    const message = { recUserId: offer.creatorUserId, sdp: answer, creatorUserId: myId.current } as {
      recUserId: string // 接收者id
      sdp: RTCSessionDescriptionInit // 对等
      creatorUserId: string // 创建者id
    }
    socket.current.emit('message', message)
  }

  // 应答方回复
  const handleAnswer = async (data: { sdp: RTCSessionDescriptionInit; recUserId: string; creatorUserId: string }) => {
    // 这个地方拼接的联系肯定是相反的，因为回答人肯定是对方，那么创建者肯定时对方，在拼接的时候是 myId_createId
    const peer = peerConnectList.get(`${data.recUserId}_${data.creatorUserId}`)
    if (!peer) {
      console.warn('handleAnswer peer 获取失败')
      return
    }
    // 设置对端的answer
    await peer.setRemoteDescription(data.sdp)
  }

  // ICE候选
  const handleIce = async (data: { sdp: any; creatorUserId: string; recUserId: string }) => {
    // 这个地方其实和处理answer一样的
    const peer = peerConnectList.get(`${data.recUserId}_${data.creatorUserId}`)
    if (!peer) {
      console.warn('handleIce peer 获取失败')
      return
    }
    // 初始化候选人对象
    const candidate = new RTCIceCandidate({
      sdpMLineIndex: data.sdp.label,
      candidate: data.sdp.candidate,
    })
    await peer.addIceCandidate(candidate)
  }

  function handleOk() {
    setShow(false)
    conn(value)
    joinRoom()
  }

  // 加入房间
  function joinRoom() {
    try {
      intoRoom()
    } catch (error) {
      console.log('异常', error)
    }
    openVideoAndAudio().then((res) => {
      if (localVideo.current !== null) {
        localVideo.current.srcObject = res as MediaProvider
      }
      gotMediaStream(res)
    })
  }

  function handleCancel() {
    setShow(false)
  }

  function joinHandle() {
    // connect默认链接是和访问域名一样的地址，进行ws通信
    setShow(true)
  }

  function conn(roomid: string) {
    console.log('对应的房间号,需要发送的房间号', roomid)
    // socket.emit('join', roomid)
  }

  function clickHandle() {
    socket.current.emit('leave', value, myId.current)

    socket.current.on('leaved', (room, id) => {
      console.log('离开当前房间号和id', room, id, peerConnectList)
      console.log('获取到的对等层列表')
      for (const item of peerConnectList.values()) {
        console.log('结果为', item)
        item.close()
      }
      peerConnectList.clear()
      myId.current = ''
      isJoinRoom.current = false
    })
  }






  return (
    <>
      <div className="room-container display-flex-center"   >
        <div className="container-style">
          <div className="btn-container-border btn-container-position"></div>
          <div className="btn-container display-flex-center btn-container-position">
            <button className="btn-style" onClick={joinHandle}>
              加入房间
            </button>
            {isJoinRoom.current && <button onClick={clickHandle}>离开房间</button>}
          </div>
        </div>
      </div>

      <Modal title="Basic Modal" open={isShow} onOk={handleOk} onCancel={handleCancel}>
        <Input
          placeholder="请输入房间号"
          type="number"
          onInput={(e) => {
            setValue(e.target.value)
          }}
        ></Input>
      </Modal>

          <div onClick={() => test()}>测试状态按钮</div>
          {
            flag && 123
          }
      <div className="video-container display-flex-center">
        <video ref={localVideo} className="videos-player" id="user-1" autoPlay playsInline></video>
        <video ref={remoteVideo} className="videos-player" id="remote-video" autoPlay playsInline></video>
      </div>
    </>
  )
}

export default memo(App)
