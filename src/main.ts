import init,{ RecordCiphertext } from "@aleohq/wasm";
import { Chess, ChessStatus, RANK_ZH,  } from "./chess";
import { drawChess, resetChess } from "./draw";
import { board, clearSelectChess } from "./event";
import { EGameState, Game } from "./game";
import { account, gameId, ws } from "./login";
import { aleoInitializeBoard, aleoUrl, newAleoClient, nodeConnection } from "./aleo";
import { Account } from "@aleohq/sdk";

init().then(async wasm=>{
  newAleoClient(aleoUrl)
   nodeConnection.getLatestBlock().then(block => {
    console.log("init wasm block",block)
   })

   const response = await nodeConnection.getTransaction('at1cz7alvrc664897ynxq6eyt7px4nkksm2k53n64ccx3q9fc3eyvxq4d86dp')
   if (response instanceof Error) {
     console.error(response);
     return "";
   }

  // const account = new Account({privateKey:privateKey})
  //  for (const tx of response.execution.transitions) {
  //    // 在输出中查找满足条件的记录
  //    const output = tx.outputs.find((output) =>
  //      currentAccount.ownsRecordCiphertext(output.value)
  //    );

  //    if (output) {
  //      // 解密记录文本
  //      recordText = currentAccount.decryptRecord(output.value);
  //      console.log(recordText);
  //      break; // 跳出内层循环
  //    }

})


export const CHESS_WIDTH = 60;
export const CHESS_HEIGHT = 33;
// export const player_color = ["red","blue"]
export const player_color = ["#FFFFFF","#FFFFFF"]
export const bgColors = ["#E74C3C", "#3498DB"]

//timer
export let timer_value = 0;
export let gameStarted = false;
export let chess_changed = true;


// export function myTimer(): void {
//   if (gameStarted) {
//     const timerElement = document.getElementById("timer") as HTMLInputElement;
//     let i = parseInt(timerElement.value);
//     if (i > 0) {
//       timerElement.value = (i - 1).toString();
//     } else {
//       alert("Time's up!");
//       gameStarted = false;
//     }
//   }
// }

// export function timerNextPlayer(): void {
//   const timerElement = document.getElementById("timer") as HTMLInputElement;
//   timerElement.value = timer_value.toString();
// }

export function GameReady() {
  // const timerElement = document.getElementById("timer") as HTMLInputElement;
  // timer_value = parseInt(timerElement.value);
  // timerElement.disabled = true;

  const startButton = document.getElementById("start_button") as HTMLButtonElement;
  startButton.style.visibility = "hidden";

  const stopButton = document.getElementById("stop_button") as HTMLButtonElement;
  stopButton.style.visibility = "visible";

  console.log("GameReady")
  aleoInitializeBoard().then(()=>{
    ws.sendReadyEvent(gameId).then()
    clearSelectChess()
    Game.getInstance(gameId).setGameState(EGameState.WAITING_GAME_START)
  })

}

export function GameStop(): void {
  // const timerElement = document.getElementById("timer") as HTMLInputElement;
  // timerElement.disabled = false;

  const startButton = document.getElementById("start_button") as HTMLButtonElement;
  startButton.style.visibility = "visible";

  const stopButton = document.getElementById("stop_button") as HTMLButtonElement;
  stopButton.style.visibility = "hidden";
  gameStarted = false;
}

function isChessVisible( chess:Chess):boolean {
	if ( chess.displayed == true || chess.address == account.toString()){
		return true;
  }
  return false;
}

function getPlayerIndex(address:string):number {
  const player1 = Game.getInstance(gameId).getPlayer1();
  return (address == player1) ? 0 : 1;
}

function getPlayerColor(playerIndex:number) {
  return player_color[playerIndex];
}

function getBgColor(playerIndex:number) {
  return bgColors[playerIndex]
}


export function updateDrawArray() {
  resetChess();

  for (const location of board.locations) {
    const chess = location.getChess();
    if (chess && chess.chessStatus == ChessStatus.OnBoard) {
      const visible = isChessVisible(chess);
      const playerIndex = getPlayerIndex(chess.address);
      const color = getPlayerColor(playerIndex);
      const rank = RANK_ZH[chess.rank];
      drawChess(rank, location.x, location.y, color, visible,getBgColor(playerIndex));
    }
  }
}



// testAsm()

// async function testAsm(){
//     // 加载 WebAssembly 模块
//   const wasmModule = await WebAssembly.instantiateStreaming(fetch('rust_hello.wasm'));

//   // 获取 WebAssembly 函数
//   const add_Value = wasmModule.instance.exports.add_Value as (a: number, b: number) => number;

//   // 调用 WebAssembly 函数
//   const result = add_Value(2, 3);

//   console.log(result); // 输出 5
// }