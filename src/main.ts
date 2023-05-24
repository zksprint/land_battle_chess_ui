import { Board } from "./board";
import { Chess, ChessStatus, Rank_zhHK,  } from "./chess";
import { drawChess, resetChess } from "./draw";
import { setCurrentGamePlayer } from "./event";
import { all_init, current_player} from "./init";

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
	do {
		console.log( "C=", current_player );
		var myArray = board.GetChessList( 1 - current_player );
		var rand = Math.floor( Math.random() * myArray.length );
		var rand_chess = myArray[rand];
		console.log( "ERR", rand_chess );
		var myArray2 = board.GetMovableLocation( board.GetChessLocation( rand_chess )! );
		var rand = Math.floor( Math.random() * myArray2!.length );
		var rand_pos = myArray2![rand];
		console.log( rand_chess, rand_pos );
	} while ( board.Move( rand_chess, rand_pos ) == -1 );
	console.log( "++++" );
  setCurrentGamePlayer(current_player)
	timerNextPlayer();
	updateDrawArray();
}


function isChessVisible( chess:Chess):boolean {
	if ( chess.displayed == true ){
		return true;
  }

	if ( chess.player == current_player ){
		return true;
  }

  return false;
}

export function updateDrawArray() {
	resetChess();
	board.locations.forEach( ( i ) => {
		let chess = i.getChess();
		if ( chess && chess != null && chess.chessStatus == ChessStatus.OnBoard ) {
			var visible = isChessVisible( chess );
			drawChess(Rank_zhHK[chess.rank], i.x, i.y, player_color[chess.player], visible );
		}
	} );
}


export let board = new Board(0);
all_init()