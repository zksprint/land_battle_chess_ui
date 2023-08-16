
import { Chess, ChessStatus, RANK_ZH, } from "./chess";
import { drawChess, resetChess } from "./draw";
import { board, clearSelectChess } from "./event";
import { EGameState, Game } from "./game";
import { account, gameId, ws } from "./login";
import { aleoInitializeBoard, aleoUrl, newAleoClient, nodeConnection } from "./aleo";
import init, { RecordPlaintext } from "../aleo/wasm/pkg/aleo_wasm";

init().then(async wasm => {
  newAleoClient(aleoUrl)
    // const record = await getFirstUnspentRecord("APrivateKey1zkp2ckdgYhNWAkQaCUsEHK8GvfYvTUnULdry3FXV7jbCsZn")
    // if (record == undefined){
    //   throw console.error("record is not find")
    // }
    // const response = await nodeConnection.getTransaction('at19y8leemercrhfxjwq58pr9lkhyla3glyh3t2p9lsf3a5eqdxecqqfg86ef');
    // if (response instanceof Error) {
    //   console.error("!!!fetch error:" + response);
    //   return ;
    // }
    // console.log(`++++++aleoWhisperPiece result tx is:${JSON.stringify(response.execution.transitions[])}`)
  
    
})


export const CHESS_WIDTH = 60;
export const CHESS_HEIGHT = 33;
// export const player_color = ["red","blue"]
export const player_color = [ "#FFFFFF", "#FFFFFF" ]
export const bgColors = [ "#E74C3C", "#3498DB" ]

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

  // ws.sendReadyEvent(gameId).then()
  // clearSelectChess()
  // Game.getInstance(gameId).setGameState(EGameState.WAITING_GAME_START)

  aleoInitializeBoard().then(() => {
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

function isChessVisible(chess: Chess): boolean {
  if (chess.displayed == true || chess.address == account.toString()) {
    return true;
  }
  return false;
}

function getPlayerIndex(address: string): number {
  const player1 = Game.getInstance(gameId).getPlayer1();
  return (address == player1) ? 0 : 1;
}

function getPlayerColor(playerIndex: number) {
  return player_color[ playerIndex ];
}

function getBgColor(playerIndex: number) {
  return bgColors[ playerIndex ]
}


export function updateDrawArray() {
  resetChess();

  for (const location of board.locations) {
    const chess = location.getChess();
    if (chess && chess.chessStatus == ChessStatus.OnBoard) {
      const visible = isChessVisible(chess);
      const playerIndex = getPlayerIndex(chess.address);
      const color = getPlayerColor(playerIndex);
      const rank = RANK_ZH[ chess.rank ];
      drawChess(rank, location.x, location.y, color, visible, getBgColor(playerIndex));
    }
  }
}


