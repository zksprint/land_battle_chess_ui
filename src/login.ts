import { getGameId } from "./api";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export async function LoginHandler() {
  // 获取房间码和私钥的输入框元素
  const roomCodeInput = document.getElementById("room_code") as HTMLInputElement;
  const privateKeyInput = document.getElementById("private_key") as HTMLInputElement;
  const loading = document.getElementById("loading");
  loading.style.display = "block";

  // 获取房间码和私钥的文本值
  const roomCode = roomCodeInput.value;
  const privateKey = privateKeyInput.value;

  let tryCnt = 5
  let gameId = 0
  for(let i = 0; i < tryCnt; i++){
    gameId = await getGameId(privateKey,roomCode)
    if (gameId != 0){
      break
    }
    await sleep(2000)
  }

  // 隐藏加载动画
  loading.style.display = "none";
  // if(gameId == 0){
  //   alert("未到匹配的玩家，等稍后重试!")
  //   return 
  // }

   // 隐藏登录框
   const loginContainer = document.getElementById('login-container') as HTMLElement;
   loginContainer.style.display = 'none';
   // 显示棋盘
   const chessboardContainer = document.getElementById('board_container') as HTMLElement;
   chessboardContainer.style.display = 'block';

}