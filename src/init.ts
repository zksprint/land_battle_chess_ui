import { Chess, ChessStatus } from "./chess";
import { draw, initDraw, resetChess } from "./draw";
import { board, canvasDown, canvasMousemove, canvasUp, initEventsValue } from "./event";
import { Game } from "./game";
import { LoginHandler, gameId } from "./login";
import { GameReady, GameStop,updateDrawArray } from "./main";

export let draw_pos: any = [];

export let current_player = "0";

export function init(): void {
	const x_arr = [7, 370];
	draw_pos = []
	current_player = "";
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
}

export function setDefaultPosition(address:string,oppAddress:string) {
	let p1 = board.GetChessList(address, false);
	//1
	board.getLocationInstance(0, 6).setChess(p1[0]);
	board.getLocationInstance(1, 6).setChess(p1[1]);
	board.getLocationInstance(2, 6).setChess(p1[2]);
	board.getLocationInstance(3, 6).setChess(p1[3]);
	board.getLocationInstance(4, 6).setChess(p1[4]);
	//2
	board.getLocationInstance(0, 7).setChess(p1[5]);
	board.getLocationInstance(2, 7).setChess(p1[6]);
	board.getLocationInstance(4, 7).setChess(p1[7]);
	//3
	board.getLocationInstance(0, 8).setChess(p1[8]);
	board.getLocationInstance(1, 8).setChess(p1[9]);
	board.getLocationInstance(3, 8).setChess(p1[10]);
	board.getLocationInstance(4, 8).setChess(p1[11]);
	//4
	board.getLocationInstance(0, 9).setChess(p1[12]);
	board.getLocationInstance(2, 9).setChess(p1[13]);
	board.getLocationInstance(4, 9).setChess(p1[14]);
	//5
	board.getLocationInstance(0, 10).setChess(p1[15]);
	board.getLocationInstance(1, 10).setChess(p1[16]);
	board.getLocationInstance(2, 10).setChess(p1[17]);
	board.getLocationInstance(3, 10).setChess(p1[18]);
	board.getLocationInstance(4, 10).setChess(p1[19]);
	//6
	board.getLocationInstance(0, 11).setChess(p1[20]);
	board.getLocationInstance(1, 11).setChess(p1[21]);
	board.getLocationInstance(2, 11).setChess(p1[22]);
	board.getLocationInstance(3, 11).setChess(p1[24]);
	board.getLocationInstance(4, 11).setChess(p1[23]);


	for(let y = 0; y <6; y++){
		for(let x = 0; x <5; x++){
			if(((x == 1 || x==3) && (y==4 || y==2)) || (x ==2 && y == 3)){
				continue
			}

			board.getLocationInstance(x,y).setChess(new Chess(0 as number, oppAddress))
		}
	}

}


export let canvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;

export function eventInit() {
	canvas = document.getElementById("Board") as HTMLCanvasElement;
	ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
	canvas.addEventListener('mousedown', canvasDown);
	canvas.addEventListener('mouseup', canvasUp);
	canvas.addEventListener('mouseleave', canvasUp);
	canvas.addEventListener('mousemove', canvasMousemove);

	const startButton = document.getElementById("start_button") as HTMLButtonElement;
	startButton.addEventListener("click", GameReady);
	const stopButton = document.getElementById("stop_button") as HTMLButtonElement;
	stopButton.addEventListener("click", GameStop);
	// setInterval(myTimer, 1000);

	const login = document.getElementById("login_button") as HTMLButtonElement;
	login.addEventListener("click", LoginHandler);
}

export function drawBoardInit(address: string, oppAddress: string) {
	resetChess();
	init();
	initDraw()
	setDefaultPosition(address, oppAddress);
	initEventsValue()
	setInterval(() => { draw(ctx); });
	updateDrawArray();
	draw(ctx);
}


export function isChessVisible(chess: Chess): boolean {
	if (chess.displayed == true)
		return true;
	if (chess.address == current_player)
		return true;
	else
		return false;
}

eventInit()
