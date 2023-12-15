import { FormEvent, useState, useRef } from 'react'
import { Button, Modal, Input } from 'antd'
import { createConn, sendStateAndRoomId, openVideoAndAudio, getMediaStream, userCode } from './hooks'
import './App.css'
type State = 'create' | 'join'
function App() {
  const [isShow, setShow] = useState(false)
  const [value, setValue] = useState('')
  const [state, setState] = useState<State>('create')
  const localVideo = useRef<HTMLVideoElement | null>(null)
  const remoteVideo = useRef<HTMLVideoElement | null>(null)
  const peerConn = useRef<Object>(null)
  const [showVideo, setshowVideo] = useState(false)
  function handleOk() {
    setShow(false)
    conn(value)
    console.log('对应的状态是', state)
    if (state === 'create') {
      createRoom()
    } else {
      joinRoom()
    }
  }

  // 创建房间
  function createRoom() {
    openVideoAndAudio().then((stream) => {
      if (localVideo.current !== null) {
        localVideo.current.srcObject = stream as MediaProvider
      }
      // 是否展示视频
      setshowVideo(true)
      // 添加stream流
      getMediaStream(stream)
      // 创建链接
      createConn(undefined, undefined, value)
      // 向信令服务器发送创建的房间或者是加入的房间
      const room = {
        type: 'create',
        room: value,
        userCode
      }
      sendStateAndRoomId('create', JSON.stringify(room))
    })
  }

  // 加入房间
  function joinRoom() {
    // 创建链接
    createConn(undefined, (stream) => {
      if (remoteVideo.current !== null) {
        remoteVideo.current.srcObject = stream as MediaProvider
      }
    },value)
    const room = {
        type: 'join',
        room: value,
        userCode
    }
    // 向信令服务器发送创建的房间或者是加入的房间
    sendStateAndRoomId('join', JSON.stringify(room))
  }

  function handleCancel() {
    setShow(false)
  }

  function joinHandle() {
    // connect默认链接是和访问域名一样的地址，进行ws通信
    setState('join')
    console.log('对应的状态是', state)
    setShow(true)
  }

  function createHandle() {
    setState('create')
    setShow(true)
  }

  function conn(roomid: string) {
    console.log('对应的房间号,需要发送的房间号', roomid)
    // socket.emit('join', roomid)
  }

  return (
    <>
      <div className="room-container display-flex-center">
        <div className="container-style">
          <div className="btn-container-border btn-container-position"></div>
          <div className="btn-container display-flex-center btn-container-position">
            <button className="btn-style" onClick={joinHandle}>
              加入房间
            </button>
            <button className="btn-style" onClick={createHandle}>
              创建房间
            </button>
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

      <div className="video-container display-flex-center">
        <video ref={localVideo} className="videos-player" id="user-1" autoPlay playsInline></video>
        <video ref={remoteVideo} className="videos-player" id="remote-video" autoPlay playsInline></video>
      </div>
    </>
  )
}

export default App
