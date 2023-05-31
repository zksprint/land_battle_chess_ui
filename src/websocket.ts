// 定义 WebSocket 连接
const socket = new WebSocket('ws://localhost:3000');

// 监听 WebSocket 连接建立事件
socket.onopen = () => {
  console.log('WebSocket connection established');
};

// 监听 WebSocket 接收消息事件
socket.onmessage = event => {
  const message = event.data;
  console.log('Received message from server:', message);

  // 在这里处理从后端接收到的消息
  // 可以根据消息内容执行相应的操作
};

// 监听 WebSocket 连接关闭事件
socket.onclose = () => {
  console.log('WebSocket connection closed');
};

// 发送消息到后端
function sendMessage(message: string): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message);
    console.log('Sent message to server:', message);
  } else {
    console.log('WebSocket connection is not open');
  }
}