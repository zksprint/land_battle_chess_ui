draw_array = [];
draw_pos = [];
selected_chess = "";
CHESS_WIDTH = 50;
CHESS_HEIGHT = 30;

//set the positions to an array.
function init() {
	var x_arr = [5, 315];
	x_arr.forEach( (k) => {
		for(var i=0; i<6; i++) {
			draw_pos.push({x: 5, y: k});
			draw_pos.push({x: 88, y: k});
			draw_pos.push({x: 176, y: k});
			draw_pos.push({x: 263, y: k});
			draw_pos.push({x: 345, y: k});
			k += 41;
		}
	});
}

function get_draw_pos(x, y) {
	return draw_pos[x+y*5];
}

function get_draw_pos_index(obj) {
	index = draw_pos.indexOf(obj);
	if(index==-1)
		return;
	else
		return {x:index%5, y:Math.floor(index/5)};
}

function relMouseCoords(event){
    canvasX = event.offsetX;
    canvasY = event.offsetY;
	var inside;
	draw_pos.forEach( (i) => {
		if( (i.x <= canvasX && canvasX <= i.x+CHESS_WIDTH) &&
			(i.y <= canvasY && canvasY <= i.y+CHESS_HEIGHT))
			inside = i;
	});
	return inside;
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

function canvas_down(e) {
	coords = e.target.relMouseCoords(e);
	console.log(coords);	
	console.log(get_draw_pos_index(coords));	
	selected_chess = coords;	
}
	
var canvas;
var ctx;
$(document).ready(() => {
	canvas = document.getElementById("Board");
	ctx = canvas.getContext("2d");
	resetChess();
	init();
	canvas.addEventListener('mousedown', canvas_down);
	setInterval( () => { draw(ctx);});
	/*
	for(var i=0; i<6; i++) {
		drawChess("", 0, i, "red");
		drawChess("", 1, i, "red");
		drawChess("", 2, i, "red");
		drawChess("", 3, i, "red");
		drawChess("", 4, i, "red");
	}*/
	for(var i=6; i<12; i++) {
		drawChess("師長", 0, i, "blue");
		drawChess("師長", 1, i, "blue");
		drawChess("師長", 2, i, "blue");
		drawChess("師長", 3, i, "blue");
		drawChess("師長", 4, i, "blue");
	}
	draw(ctx);
});

//[[5,5], [88,5], [175,5], [263,5], [345,5],
//

function resetChess() {
	draw_array=[];
}
function drawChess(txt, x, y, color) {
	draw_array.push({txt:txt, x:x, y:y, color:color});
}

dash_count=0;
loop_count=0;
function draw(ctx) {
	//rect
	ctx.clearRect(0,0, canvas.width, canvas.height);
	loop_count++;
	if(loop_count>=30) {
		loop_count = 0;
		dash_count = (dash_count+1)%7;
	}
	draw_array.forEach( (i) => {
		//border
		ctx.lineWidth="3";
		ctx.beginPath();
		if(get_draw_pos(i.x, i.y) == selected_chess)
		{
			ctx.strokeStyle="orange";
			/*ctx.setLineDash([4, 4]);
			ctx.lineDashOffset = dash_count;*/
		}
		else
		{
			ctx.setLineDash([]);
			ctx.strokeStyle=i.color;
		}
		//rect
		ctx.rect(get_draw_pos(i.x, i.y).x, get_draw_pos(i.x, i.y).y, CHESS_WIDTH, CHESS_HEIGHT);
		ctx.stroke();
		ctx.fill();

		//shadow
		ctx.save();
		ctx.shadowColor = '#111';
		ctx.shadowBlur = 6;
		ctx.shadowOffsetX = 2;
		ctx.shadowOffsetY = 2;
		//fill
		if(get_draw_pos(i.x, i.y) == selected_chess)
			ctx.fillStyle = 'lightblue';
		else
			ctx.fillStyle = '#CCC';
		//if empty chess
		//ctx.fillStyle = "rgba(255, 255, 255, 0)";
		ctx.fill();

		ctx.restore();
	});
	//text
	ctx.font = '20px arial';
    ctx.fillStyle = '#000';
	ctx.textAlign="left";
	draw_array.forEach( (i) => {
		ctx.fillText(i.txt, get_draw_pos(i.x, i.y).x+5, get_draw_pos(i.x, i.y).y+23);
	});
}
