import init,{ RecordCiphertext } from "@aleohq/wasm";
import { Board } from "./board";
import { Chess, ChessStatus, Rank_zhHK,  } from "./chess";
import { drawChess, resetChess } from "./draw";
import { setCurrentGamePlayer } from "./event";
import { drawBoardInit, current_player} from "./init";
import { Account } from '@aleohq/sdk'
import { board } from "./login";

init().then(wasm=>{
  console.log("wasm is ....")
  let acctount = new Account({privateKey:"APrivateKey1zkp6FJo46GTFmCTX3yqVS7raJQSLztGd6sC585tLqDqzqBN"})
  console.log('acctount:', acctount.toString())

  const record = RecordCiphertext.fromString(
    'record1qyqsprsrxps7kltcp9wdjlhm0dxxejt8a5lelfdk76h4sg3l300wlrcwqyxx66trwfhkxun9v35hguerqqpqzqyl396kvfrcvhdq566gg6gxcjcs8xs8d2uuher4mugnf3lqhzqkp5jp8g9ldz2hu45um65h82w3uazj5s3wajy9nxqeva353da4c58qsz9f3as',
  )
  console.log('RecordCiphertext:', JSON.stringify(record))
})


export const CHESS_WIDTH = 60;
export const CHESS_HEIGHT = 33;
export const player_color = ["blue","read"]

//timer
export let timer_value = 0;
export let game_started = false;
export let chess_changed = true;


export function myTimer(): void {
  if (game_started) {
    const timerElement = document.getElementById("timer") as HTMLInputElement;
    let i = parseInt(timerElement.value);
    if (i > 0) {
      timerElement.value = (i - 1).toString();
    } else {
      alert("Time's up!");
      game_started = false;
    }
  }
}

export function timerNextPlayer(): void {
  const timerElement = document.getElementById("timer") as HTMLInputElement;
  timerElement.value = timer_value.toString();
}

export function GameStart(): void {

  const timerElement = document.getElementById("timer") as HTMLInputElement;
  timer_value = parseInt(timerElement.value);
  timerElement.disabled = true;

  const startButton = document.getElementById("start_button") as HTMLButtonElement;
  startButton.style.visibility = "hidden";

  const stopButton = document.getElementById("stop_button") as HTMLButtonElement;
  stopButton.style.visibility = "visible";
  game_started = true;
}

export function GameStop(): void {
  const timerElement = document.getElementById("timer") as HTMLInputElement;
  timerElement.disabled = false;

  const startButton = document.getElementById("start_button") as HTMLButtonElement;
  startButton.style.visibility = "visible";

  const stopButton = document.getElementById("stop_button") as HTMLButtonElement;
  stopButton.style.visibility = "hidden";
  game_started = false;
}



export function AI_Move() {
  // let rand_pos 
	// do {
	// 	console.log( "Current player", current_player );
	// 	var myArray = board.GetChessList( 1 - current_player ,true);
	// 	var rand = Math.floor( Math.random() * myArray.length );
	// 	var rand_chess = myArray[rand];
	// 	console.log( "randChess:", rand_chess.rank );

	// 	var myArray2 = board.GetMovableLocation( board.GetChessLocation( rand_chess )!);
  //   console.log("AI_Move moveable array lenght:", myArray2.length);
  //   if(myArray2.length == 0){
  //     continue;
  //   }

	// 	var rand = Math.floor( Math.random() * myArray2.length );
	// 	rand_pos = myArray2[rand];
	// } while ( board.Move( rand_chess, rand_pos ) == -1 );
  // setCurrentGamePlayer(current_player)
	// timerNextPlayer();
	// updateDrawArray();
}


function isChessVisible( chess:Chess):boolean {
	if ( chess.displayed == true ){
		return true;
  }

	if ( chess.address == current_player ){
		return true;
  }

  return false;
}

export function updateDrawArray() {
	resetChess();
	board.locations.forEach( ( i ) => {
		let chess = i.getChess();
		if ( chess && chess != null && chess.chessStatus == ChessStatus.OnBoard ) {
			let visible = isChessVisible( chess );
			drawChess(Rank_zhHK[chess.rank], i.x, i.y, player_color[0], visible );
		}
	} );
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