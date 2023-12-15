let localStream:MediaStream
const peerConData = new Map
import { config } from '../config'

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
}


export function createPeerConnection(userId: string, recUserId: string) {
    const peerConnect = new RTCPeerConnection(config)
    return peerConnect
  }
