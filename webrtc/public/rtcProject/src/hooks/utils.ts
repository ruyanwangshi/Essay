/**
 * @desc 打开音视频设备
 *
 * 返回值：无
 */

export function openVideoAndAudio(options?: any) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error('请确保当前浏览器支持音视频api！')
    return Promise.reject('请确保当前浏览器支持音视频api！')
  } else {
    console.log('打开音视频')
    let constraints = options
    if (!constraints) {
      constraints = {
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      }
    }
    console.log('对应的初始化配置', constraints)
    return navigator.mediaDevices.getUserMedia(constraints)
  }
}


/**
 * @desc 音视频分开处理逻辑
 */

export function handleVideoAndAudio() {
    
}