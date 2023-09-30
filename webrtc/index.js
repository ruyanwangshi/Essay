// 遍历音视频设备
// enumerateDevices 接口格式

navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
  // 接口执行成功后，会返回deviceInfo数组。
  // interface MediaDeviceInfo {
  //     readonly attribute DOMString deviceId; // 每个设备的唯一编号
  //     readonly attribute MediaDeviceKind kind; 分为三种类型： 音频输入设备、音频输出设备以及视频输入设备。
  //     readonly attribute DOMString label; 设备的名字
  //     readonly attribute DOMString groupId; 表示组Id
  //  };
  //  enum MediaDeviceKind {
  //     "audioinput",
  //     "audiooutput",
  //     "videoinput"
  //  };

  console.log('对应的列表是123', deviceInfos)
  deviceInfos.forEach((deviceInfo) => {
    console.log('每个媒体设备', deviceInfo)
  })
})

// 采集音视频数据
// getUserMedia
// MediaStreamConstrains 这个配置项
const constraints = {
  //   video: {
  //     width: 640, // 宽度
  //     height: 480, // 高度
  //     frameRate: 15, // 对应的帧率为 15帧/秒
  //     facingMode: 'enviroment', // 使用后置摄像头
  //   },
  video: true,
  auido: true,
}

const user1 = document.getElementById('user-1')
navigator.mediaDevices.getUserMedia(constraints).then((res) => {
  user1.srcObject = res
  console.log('采集到的数据', res)
})

// let localStram
// let remoteSteam

// const servers = {
//     iceServers: [
//         {

//         }
//     ]
// };

// const init = async () => {
//   localStram = await navigator.mediaDevices.getUserMedia({
//     video: true, // 只访问视频
//     audio: false, // 不访问音频
//   })
//   const user1 = document.getElementById('user-1')
//   user1.srcObject = localStram

//   // 如果视频1准备好了就开始调用视频2
//   createOffer()
// }

// const createOffer = async () => {
//   // 本地计算机和远程对等点之间的 WebRTC 连接。它提供了连接到远程对等点、维护和监视连接以及在不再需要时关闭连接的方法。
//   perrConnection = new RTCPeerConnection()

//   localStram.getTracks().forEach((track) => {
//     console.log('track', track)
//   })

//   // 获取远程的流放入第二个视频里面
//   remoteSteam = new MediaStream()
//   document.getElementById('user-2').srcObject = remoteSteam

//   //
//   let offer = await perrConnection.createOffer()
//   await perrConnection.setLocalDescription(offer)

//   console.log('对应的提供的内容', offer)
// }

// init()
