import { Account } from "@aleohq/sdk";
import { getGameId, pollGetGameId } from "./api";
import { WebSocketClient, handleWsServerMsg } from "./websocket";

export let ws: WebSocketClient
export let account :Account
export let gameId :string = "0"

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getGameIdFromServer(): Promise<string> {
  // 获取房间码和私钥的输入框元素
  const roomCodeInput = document.getElementById("room_code") as HTMLInputElement;
  const privateKeyInput = document.getElementById("private_key") as HTMLInputElement;
  const loading = document.getElementById("loading");
  loading.style.display = "block";

  // 获取房间码和私钥的文本值
  const roomCode = roomCodeInput.value;
  const privateKey = privateKeyInput.value;

  account = new Account({privateKey:privateKey})
  console.log('account address:', account.toString())

  gameId = await getGameId(account.toString(), roomCode)
  if (gameId != "0") {
    loading.style.display = "none";
    return gameId
  }

  for (let i = 0, tryCnt = 20; i < tryCnt; i++) {
    gameId = await pollGetGameId(account.toString())
    if (gameId != "0") {
      break
    }
    await sleep(2000)
  }
  console.log('getGameIdFromServer:',gameId)
  // 隐藏加载动画
  loading.style.display = "none";
  return gameId
}

async function connectWs(gameId: string,address:string) {
  // 使用示例
  ws = new WebSocketClient(`ws://127.0.0.1:3000/game?game_id=${gameId}&player=${address}`);
  ws.setMessageCallback(handleWsServerMsg)
  await ws.connect();
  console.log("connect ws:",JSON.stringify(ws))

  // // 设置消息回调函数
  // ws.setMessageCallback((message) => {
  //   console.log('Received message from server:', message);
  //   // 在这里处理来自后台的消息
  // });



  // // 发送消息
  // ws.send('Hello, WebSocket!');

  // // 关闭连接
  // ws.close();
}

export function changeDisplay() {
  // 隐藏登录框
  const loginContainer = document.getElementById('login-container') as HTMLElement;
  loginContainer.style.display = 'none';
  // 显示棋盘
  const chessboardContainer = document.getElementById('board_container') as HTMLElement;
  chessboardContainer.style.display = 'block';
}

export async function LoginHandler() {
  console.log("enter LoginHandler")
  const gameId = await getGameIdFromServer()
  if (gameId == "0") {
    alert("未到匹配的玩家，等稍后重试!")
    return
  }
  console.log("enter connectWs")
  await connectWs(gameId,account.toString())
}
