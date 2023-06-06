
import { mouse_current_pos, mouse_down, mouse_start_pos, selected_chess, selected_chess_movable } from "./event";
import { canvas, draw_pos } from "./init";
import { CHESS_HEIGHT, CHESS_WIDTH } from "./main";

export let draw_array: { txt: string; x: number; y: number; color: string; txt_visible: boolean; bgColor:string }[]= [];


export function updateShowMessage(text:string) {
	let waitingMessage = document.getElementById("showMessage");
	waitingMessage.textContent = text
}

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

export function drawChess( txt: string, x: number, y: number, color: string, txt_visible: boolean,bgColor:string ) {
	draw_array.push( { txt: txt, x: x, y: y, color: color, txt_visible: txt_visible, bgColor:bgColor } );
}

let dash_count = 0;
let loop_count = 0;

export function initDraw(){
	dash_count = 0
	loop_count = 0
}

/**
 * 绘制函数
 * @param ctx 画布上下文
 */
export function draw(ctx: CanvasRenderingContext2D) {
  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制矩形框
  drawRectangles(ctx);

  // 绘制虚线框
  drawDottedRectangles(ctx);

  // 绘制文本
  drawText(ctx);
}

/**
 * 绘制虚线框
 * @param ctx 画布上下文
 */
function drawDottedRectangles(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([]);
  ctx.lineDashOffset = dash_count;

  selected_chess_movable.forEach((item: { x: number; y: number }) => {
    ctx.lineWidth = 3;
    const alpha = 1 * Math.abs(loop_count - 150) / 150;
    ctx.strokeStyle = `rgba(0, 200, 0, ${alpha})`;
    ctx.strokeRect(item.x, item.y, CHESS_WIDTH, CHESS_HEIGHT);
  });

  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}


/**
 * 绘制矩形框
 * @param ctx 画布上下文
 */
function drawRectangles(ctx: CanvasRenderingContext2D) {
  draw_array.forEach((item) => {
    ctx.save();
    ctx.beginPath();

    const drawPos = getDrawPos(item.x, item.y);
    const isSelectedChess = drawPos === selected_chess;

    ctx.lineWidth = 2;

    if (isSelectedChess) {
      ctx.strokeStyle = "orange";
      if (mouse_down) {
        const offsetX = drawPos.x + (mouse_current_pos.x - mouse_start_pos.x);
        const offsetY = drawPos.y + (mouse_current_pos.y - mouse_start_pos.y);
        ctx.rect(offsetX, offsetY, CHESS_WIDTH, CHESS_HEIGHT);
      } else {
        ctx.rect(drawPos.x, drawPos.y, CHESS_WIDTH, CHESS_HEIGHT);
      }
    } else {
      ctx.setLineDash([]);
      ctx.strokeStyle = item.color;
      ctx.rect(drawPos.x, drawPos.y, CHESS_WIDTH, CHESS_HEIGHT);
    }

    ctx.fillStyle = isSelectedChess ? "lightblue" : item.bgColor;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  });
}

/**
 * 绘制文本
 * @param ctx 画布上下文
 */
function drawText(ctx: CanvasRenderingContext2D) {
  ctx.font = '20px arial';
  ctx.textAlign = "left";

  draw_array.forEach((item) => {
    const debugCheckbox = document.getElementById("debug") as HTMLInputElement;
    if (!debugCheckbox.checked && !item.txt_visible) {
      return;
    }

    ctx.save();
    ctx.beginPath();

    const drawPos = getDrawPos(item.x, item.y);
    const isSelectedChess = drawPos === selected_chess;

    if (isSelectedChess && mouse_down) {
      const offsetX = drawPos.x + (mouse_current_pos.x - mouse_start_pos.x);
      const offsetY = drawPos.y + (mouse_current_pos.y - mouse_start_pos.y);
      const gradient = ctx.createLinearGradient(offsetX, offsetY, offsetX + CHESS_WIDTH, offsetY + CHESS_HEIGHT);
      gradient.addColorStop(0, "white");          // 起始颜色
      gradient.addColorStop(1, item.color);       // 结束颜色，可根据棋子颜色调整
      ctx.fillStyle = gradient;
      ctx.rect(offsetX, offsetY, CHESS_WIDTH, CHESS_HEIGHT);
      ctx.fill();
      ctx.fillText(item.txt, offsetX + 9, offsetY + 25);
    } else {
      const gradient = ctx.createLinearGradient(drawPos.x, drawPos.y, drawPos.x + CHESS_WIDTH, drawPos.y + CHESS_HEIGHT);
      gradient.addColorStop(0, "white");          // 起始颜色
      gradient.addColorStop(1, item.color);       // 结束颜色，可根据棋子颜色调整
      ctx.fillStyle = gradient;
      ctx.fillText(item.txt, drawPos.x + 9, drawPos.y + 25);
    }

    ctx.closePath();
    ctx.restore();
  });
}