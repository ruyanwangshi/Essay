export const config = {
    iceServers: [
      {
        // TURN 服务器地址
        urls: 'turn:124.70.60.216:5666',
        // TURN 服务器用户名称
        username: 'coturn',
        // TURN 服务器密码
        credential: '123456',
      },
    ],
    // 默认使用relay 方式传输数据
    iceTransportPolicy: 'relay',
    iceCandidtePoolSize: '0',
  } as RTCConfiguration