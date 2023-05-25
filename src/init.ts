import { Chess, ChessStatus } from "./chess";
import { draw, resetChess } from "./draw";
import { canvasDown, canvasMousemove, canvasUp } from "./event";
import { GameStart, GameStop, board, myTimer, updateDrawArray } from "./main";

export let draw_pos:any = [];

export let current_player = 0;


export function init(): void {
  const x_arr = [7, 370];
  x_arr.forEach(offset => {
    for (let i = 0; i < 6; i++) {
      draw_pos.push({ x: 7, y: offset });
      draw_pos.push({ x: 102, y: offset });
      draw_pos.push({ x: 204, y: offset });
      draw_pos.push({ x: 307, y: offset });
      draw_pos.push({ x: 400, y: offset });
      offset += 48;
    }
  });

  const startButton = document.getElementById("start_button") as HTMLButtonElement;
  startButton.addEventListener("click", GameStart);
  const stopButton = document.getElementById("stop_button") as HTMLButtonElement;
  stopButton.addEventListener("click", GameStop);
  setInterval(myTimer, 1000);
}



export function default_position(set:number) {
	if ( set == 1 ) {
		let p1 = board.GetChessList( 0, false);
		//1
		board.getLocationInstance( 0, 6 ).setChess( p1[0] );
		board.getLocationInstance( 1, 6 ).setChess( p1[1] );
		board.getLocationInstance( 2, 6 ).setChess( p1[2] );
		board.getLocationInstance( 3, 6 ).setChess( p1[3] );
		board.getLocationInstance( 4, 6 ).setChess( p1[4] );
		//2
		board.getLocationInstance( 0, 7 ).setChess( p1[5] );
		board.getLocationInstance( 2, 7 ).setChess( p1[6] );
		board.getLocationInstance( 4, 7 ).setChess( p1[7] );
		//3
		board.getLocationInstance( 0, 8 ).setChess( p1[8] );
		board.getLocationInstance( 1, 8 ).setChess( p1[9] );
		board.getLocationInstance( 3, 8 ).setChess( p1[10] );
		board.getLocationInstance( 4, 8 ).setChess( p1[11] );
		//4
		board.getLocationInstance( 0, 9 ).setChess( p1[12] );
		board.getLocationInstance( 2, 9 ).setChess( p1[13] );
		board.getLocationInstance( 4, 9 ).setChess( p1[14] );
		//5
		board.getLocationInstance( 0, 10 ).setChess( p1[15] );
		board.getLocationInstance( 1, 10 ).setChess( p1[16] );
		board.getLocationInstance( 2, 10 ).setChess( p1[17] );
		board.getLocationInstance( 3, 10 ).setChess( p1[18] );
		board.getLocationInstance( 4, 10 ).setChess( p1[19] );
		//6
		board.getLocationInstance( 0, 11 ).setChess( p1[20] );
		board.getLocationInstance( 1, 11 ).setChess( p1[21] );
		board.getLocationInstance( 2, 11 ).setChess( p1[22] );
		board.getLocationInstance( 3, 11 ).setChess( p1[24] );
		board.getLocationInstance( 4, 11 ).setChess( p1[23] );

		p1 = board.GetChessList( 1 );
		board.getLocationInstance( 0, 5 ).setChess( p1[0] );
		board.getLocationInstance( 1, 5 ).setChess( p1[1] );
		board.getLocationInstance( 2, 5 ).setChess( p1[2] );
		board.getLocationInstance( 3, 5 ).setChess( p1[3] );
		board.getLocationInstance( 4, 5 ).setChess( p1[4] );
		//2
		board.getLocationInstance( 0, 4 ).setChess( p1[5] );
		board.getLocationInstance( 2, 4 ).setChess( p1[6] );
		board.getLocationInstance( 4, 4 ).setChess( p1[7] );
		//3
		board.getLocationInstance( 0, 3 ).setChess( p1[8] );
		board.getLocationInstance( 1, 3 ).setChess( p1[9] );
		board.getLocationInstance( 3, 3 ).setChess( p1[10] );
		board.getLocationInstance( 4, 3 ).setChess( p1[11] );
		//4
		board.getLocationInstance( 0, 2 ).setChess( p1[12] );
		board.getLocationInstance( 2, 2 ).setChess( p1[13] );
		board.getLocationInstance( 4, 2 ).setChess( p1[14] );
		//5
		board.getLocationInstance( 0, 1 ).setChess( p1[15] );
		board.getLocationInstance( 1, 1 ).setChess( p1[16] );
		board.getLocationInstance( 2, 1 ).setChess( p1[17] );
		board.getLocationInstance( 3, 1 ).setChess( p1[18] );
		board.getLocationInstance( 4, 1 ).setChess( p1[19] );
		//6
		board.getLocationInstance( 0, 0 ).setChess( p1[20] );
		board.getLocationInstance( 1, 0 ).setChess( p1[21] );
		board.getLocationInstance( 2, 0 ).setChess( p1[22] );
		board.getLocationInstance( 3, 0 ).setChess( p1[24] );
		board.getLocationInstance( 4, 0 ).setChess( p1[23] );


	}
}

export let canvas:HTMLCanvasElement;
export let ctx :CanvasRenderingContext2D;
export function all_init() {
  canvas = document.getElementById("Board") as HTMLCanvasElement;
	ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
	resetChess();
	init();
	default_position(1);
	canvas.addEventListener( 'mousedown', canvasDown );
	canvas.addEventListener( 'mouseup', canvasUp );
	canvas.addEventListener( 'mouseleave', canvasUp );
	canvas.addEventListener( 'mousemove', canvasMousemove );
	setInterval( () => { draw( ctx ); } );
	updateDrawArray();
	draw( ctx );
}

export function isChessVisible(chess:Chess):boolean {
	if ( chess.displayed == true )
		return true;
	if ( chess.player == current_player )
		return true;
	else
		return false;
}

