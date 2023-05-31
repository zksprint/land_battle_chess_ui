
import { mouse_current_pos, mouse_down, mouse_start_pos, selected_chess, selected_chess_movable } from "./event";
import { canvas, draw_pos } from "./init";
import { CHESS_HEIGHT, CHESS_WIDTH } from "./main";

export let draw_array: { txt: string; x: number; y: number; color: string; txt_visible: boolean; }[]= [];

//根据xy坐标获取元素
export function getDrawPos(x: number, y: number) {	//-> draw_pos[x]
  return draw_pos[x + y * 5];
}

//获取x、y坐标
export function getDrawPosIndex(obj: { x: number; y: number }): { x: number; y: number } | undefined {
  const index = draw_pos.indexOf(obj);
  if (index === -1) {
    return undefined;
  }
  return { x: index % 5, y: Math.floor(index / 5) };
}

//给定的坐标 coordinate 来查找 draw_pos 数组中符合条件的矩形对象
export function getRectObj(coordinate: { x: number; y: number }): { x: number; y: number } | undefined {
  let canvasX = coordinate.x;
  let canvasY = coordinate.y;
  let inside: { x: number; y: number } | undefined;

  // 遍历draw_pos数组，查找符合条件的元素
  draw_pos.forEach((i: { x: number; y: number; }) => {
    if (i.x <= canvasX && canvasX <= i.x + CHESS_WIDTH && i.y <= canvasY && canvasY <= i.y + CHESS_HEIGHT ) {
      inside = i;
    }
  });

  return inside;
}

export function resetChess() {
	draw_array = [];
}

export function drawChess( txt: string, x: number, y: number, color: string, txt_visible: boolean ) {
	draw_array.push( { txt: txt, x: x, y: y, color: color, txt_visible: txt_visible } );
}

let dash_count = 0;
let loop_count = 0;

export function initDraw(){
	dash_count = 0
	loop_count = 0
}

export function draw( ctx:CanvasRenderingContext2D ) {
	ctx.clearRect( 0, 0, canvas.width, canvas.height );

	//rect
	loop_count++;
	if ( loop_count >= 300 ) {
		loop_count = 0;
	}

	draw_array.forEach( ( i ) => {
		ctx.save();
		ctx.beginPath();
		//draw border
		ctx.lineWidth = 5;
		ctx.beginPath();
		if ( getDrawPos( i.x, i.y ) == selected_chess ){
			ctx.strokeStyle = "orange";
			if ( mouse_down == true ) {
				let ori_x = getDrawPos( i.x, i.y ).x;
				let ori_y = getDrawPos( i.x, i.y ).y;
				ori_x = ori_x + ( mouse_current_pos.x - mouse_start_pos.x );
				ori_y = ori_y + ( mouse_current_pos.y - mouse_start_pos.y );
				ctx.rect( ori_x, ori_y, CHESS_WIDTH, CHESS_HEIGHT );
			} else{
        ctx.rect( getDrawPos( i.x, i.y ).x, getDrawPos( i.x, i.y ).y, CHESS_WIDTH, CHESS_HEIGHT );
      }

		} else {
			ctx.setLineDash( [] );
			ctx.strokeStyle = i.color;
			ctx.rect( getDrawPos( i.x, i.y ).x, getDrawPos( i.x, i.y ).y, CHESS_WIDTH, CHESS_HEIGHT );
		}
		//rect
		ctx.fill();
		ctx.stroke();

		if ( getDrawPos( i.x, i.y ) == selected_chess )
			ctx.fillStyle = 'lightblue';
		else
			ctx.fillStyle = '#fff';
		ctx.fill();

		ctx.closePath();
		ctx.restore();
	} );

	//dotted
	ctx.save();
	ctx.beginPath();
	//ctx.setLineDash([6,6]);
	ctx.setLineDash( [] );
	ctx.lineDashOffset = dash_count;
	selected_chess_movable.forEach( ( i: { x: number; y: number; } ) => {
		ctx.lineWidth = 5;
		ctx.strokeStyle = "rgba(0,200,0," + 1 * Math.abs( loop_count - 150 ) / 150 + ")";
		ctx.strokeRect( i.x, i.y, CHESS_WIDTH, CHESS_HEIGHT );
	} );
	ctx.stroke();
	ctx.closePath();
	ctx.restore();

	//text
	ctx.font = '20px arial';
	ctx.fillStyle = 'blue';
	ctx.textAlign = "left";
	draw_array.forEach( ( i ) => {
    const debugCheckbox = document.getElementById("debug") as HTMLInputElement;
    if (!debugCheckbox.checked && !i.txt_visible) {
      return;
    }

		if ( getDrawPos( i.x, i.y ) == selected_chess && mouse_down ) {
			let ori_x = getDrawPos( i.x, i.y ).x;
			let ori_y = getDrawPos( i.x, i.y ).y;
			ori_x = ori_x + ( mouse_current_pos.x - mouse_start_pos.x );
			ori_y = ori_y + ( mouse_current_pos.y - mouse_start_pos.y );
			ctx.rect( ori_x, ori_y, CHESS_WIDTH, CHESS_HEIGHT );
			ctx.fillText( i.txt, ori_x + 9, ori_y + 25 );
		} else{
			ctx.fillText( i.txt, getDrawPos( i.x, i.y ).x + 9, getDrawPos( i.x, i.y ).y + 25 );
    }
	} );
}
