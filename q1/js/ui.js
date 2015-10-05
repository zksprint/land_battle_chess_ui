draw_array = [];
draw_pos = [];
CHESS_WIDTH = 50;
CHESS_HEIGHT = 30;
player_color = { 1:"blue", 2:"red"}
current_player = 1;
//Prepare stage
//Mouse related
mouse_down = false;
selected_chess = "";	//draw_pos
selected_chess_movable = [];
mouse_start_pos = null;
mouse_current_pos = null;
//State machine
chess_changed = true;

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

function get_draw_pos(x, y) {	//-> draw_pos[x]
	return draw_pos[x+y*5];
}

function get_draw_pos_index(obj) { // draw_pos[x] => x,y
	index = draw_pos.indexOf(obj);
	if(index==-1)
		return;
	else
		return {x:index%5, y:Math.floor(index/5)};
}

function get_rect_obj(coordinate){ //-> draw_pos[x]
    canvasX = coordinate.x;
    canvasY = coordinate.y;
	var inside;
	draw_pos.forEach( (i) => {
		if( (i.x <= canvasX && canvasX <= i.x+CHESS_WIDTH) &&
			(i.y <= canvasY && canvasY <= i.y+CHESS_HEIGHT))
			inside = i;
	});
	return inside;
}

function canvas_down(e) {
	mouse_down = true;
	mouse_start_pos = {x: e.offsetX, y: e.offsetY};
	mouse_current_pos = {x: e.offsetX, y: e.offsetY};
	coords = get_rect_obj(mouse_start_pos);
	//console.log(coords);	
	//console.log(get_draw_pos_index(coords));	
	selected_chess = coords;
	selected_chess_movable=[];
	logic_coords = get_draw_pos_index(coords);
	if(selected_chess && board.get_location(logic_coords.x, logic_coords.y).get_chess()) {
		pos = get_draw_pos_index(coords);
		movable_location = get_movable_pos(board.get_location(pos.x, pos.y));
		movable_location.forEach((i) => selected_chess_movable.push(get_draw_pos(i.x, i.y)));
	}
}
function canvas_up(e) {
	mouse_down = false;
	mouse_current_pos = {x: e.offsetX, y: e.offsetY};
	rect_obj = get_rect_obj(mouse_current_pos);
	if(rect_obj && selected_chess) {
		ori_location = get_draw_pos_index(selected_chess);
		target_location = get_draw_pos_index(rect_obj);
		ori_location_logic = board.get_location(ori_location.x, ori_location.y);
		chess = ori_location_logic.get_chess();
		target_location_logic = board.get_location(target_location.x, target_location.y);
		board.Move(chess, target_location_logic);
		//Move command: for selected_chess, move to get_rect_obj(mouse_current_pos)
		update_draw_array();
		selected_chess=null
		selected_chess_movable=[];
	}
	mouse_start_pos = null;
	mouse_current_pos = null;
}

function canvas_mousemove(e) {
	if(!mouse_down)
		return;
	mouse_current_pos = {x: e.offsetX, y: e.offsetY}; 	
}
	
var canvas;
var ctx;
function all_init() {
	canvas = document.getElementById("Board");
	ctx = canvas.getContext("2d");
	resetChess();
	init();
	canvas.addEventListener('mousedown', canvas_down);
	canvas.addEventListener('mouseup', canvas_up);
	canvas.addEventListener('mouseleave', canvas_up);
	canvas.addEventListener('mousemove', canvas_mousemove);
	setInterval( () => { draw(ctx);});
	board.get_location(3,3).set_chess(board.chess[1]);
	update_draw_array();
	draw(ctx);
}

function is_chess_visible(chess) {
	if(chess.player == current_player)
		return true;
	else
		return false;
}

function update_draw_array() {
	resetChess();
	board.locations.forEach( (i) => {
		chess = i.get_chess();
		if(chess && chess!=null) {
			var visible = is_chess_visible(chess);
			drawChess(Rank_zhHK[chess.rank], i.x, i.y, player_color[chess.player], visible);
		}
	});
}

//[[5,5], [88,5], [175,5], [263,5], [345,5],
//

function resetChess() {
	draw_array=[];
}
function drawChess(txt, x, y, color, txt_visible) {
	draw_array.push({txt:txt, x:x, y:y, color:color, txt_visible: txt_visible});
}

dash_count=0;
loop_count=0;
//==================================
// Render
//==================================

function render_chess(ctx, text, bg_color, border_color, x, y) {
	ctx.save();
	//box
	ctx.lineWidth = "3";
	ctx.strokeStyle = border_color;
	ctx.fillStyle = bg_color;
	ctx.rect(x, y, CHESS_WIDTH, CHESS_HEIGHT);
	ctx.stroke();
	ctx.fill();
	ctx.restore();
	ctx.save();
	//text
	ctx.font = '20px arial';
    ctx.fillStyle = '#000';
	ctx.textAlign="left";
	ctx.fillText(text, x+8, y+23);
	ctx.restore();
}

var stage_prepare = true;
function draw(ctx) {
	ctx.clearRect(0,0, canvas.width, canvas.height);
	//Notification area
	ctx.save();
	ctx.lineWidth="3";
	ctx.strokeStyle="red";
	ctx.strokeRect(430, 3, 350, 127);
	ctx.restore();

	if(stage_prepare) {
		ctx.save();
		ctx.font = '20px arial';
		ctx.fillStyle = '#000';
		ctx.textAlign="left";
		ctx.fillText("Preparation stage", 433, 27);
		ctx.font = '15px arial';
		ctx.fillText("Please arranging your pieces on the bottom half of", 433, 57);
		ctx.fillText("the board.", 433, 77);
		ctx.restore();
	}
	//If prepare stage
	if(stage_prepare) {
		ctx.save();
		ctx.lineWidth="5";
		//ctx.setLineDash([6,6]);
		ctx.strokeStyle="green";
		ctx.strokeRect(430, 133, 350, 200);
		ctx.restore();

		render_chess(ctx, "hi", "#b69b4c", player_color[current_player], 438, 140);
		render_chess(ctx, "hi", "#b69b4c", player_color[current_player], 438+CHESS_WIDTH+8, 140);
		render_chess(ctx, "hi", "#b69b4c", player_color[current_player], 438+(CHESS_WIDTH+8)*2, 140);
	}
	//rect
	loop_count++;
	if(loop_count>=300) {
		loop_count = 0;
	}
	draw_array.forEach( (i) => {
		ctx.save();
		ctx.beginPath();
		//draw border
		ctx.lineWidth="5";
		ctx.beginPath();
		//console.log(selected_chess_movable);
		if(get_draw_pos(i.x, i.y) == selected_chess)	//selected chess
		{
			ctx.strokeStyle="orange";
			if(mouse_down == true) {
				ori_x = get_draw_pos(i.x, i.y).x;
				ori_y = get_draw_pos(i.x, i.y).y;
				ori_x = ori_x + (mouse_current_pos.x - mouse_start_pos.x);
				ori_y = ori_y + (mouse_current_pos.y - mouse_start_pos.y);
				ctx.rect(ori_x, ori_y, CHESS_WIDTH, CHESS_HEIGHT);
			} else 
				ctx.rect(get_draw_pos(i.x, i.y).x, get_draw_pos(i.x, i.y).y, CHESS_WIDTH, CHESS_HEIGHT);
			/*ctx.setLineDash([4, 4]);
			ctx.lineDashOffset = dash_count;*/
		} else {
			ctx.setLineDash([]);
			ctx.strokeStyle=i.color;
			ctx.rect(get_draw_pos(i.x, i.y).x, get_draw_pos(i.x, i.y).y, CHESS_WIDTH, CHESS_HEIGHT);
		}
		//rect
		ctx.stroke();

		//shadow
		ctx.shadowColor = '#111';
		ctx.shadowBlur = 3;
		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 1;
		//fill
		if(get_draw_pos(i.x, i.y) == selected_chess)
			ctx.fillStyle = 'lightblue';
		else
			//ctx.fillStyle = '#CCC';
			ctx.fillStyle = '#b69b4c';
		//if empty chess
		//ctx.fillStyle = "rgba(255, 255, 255, 0)";

		ctx.closePath();
		ctx.restore();
	});

	//dotted
	ctx.save();
	ctx.beginPath();
	//ctx.setLineDash([6,6]);
	ctx.setLineDash([]);
	ctx.lineDashOffset = dash_count;
	selected_chess_movable.forEach( (i) => {
		ctx.lineWidth="3";
		ctx.strokeStyle="rgba(0,255,0,"+1*Math.abs(loop_count-150)/150+")";
		ctx.strokeRect(i.x, i.y, CHESS_WIDTH, CHESS_HEIGHT);
	});
	ctx.stroke();
	ctx.closePath();
	ctx.restore();

	//text
	ctx.font = '20px arial';
    ctx.fillStyle = '#000';
	ctx.textAlign="left";
	draw_array.forEach( (i) => {
		if(!i.txt_visible)
			return;
		if(get_draw_pos(i.x, i.y) == selected_chess && mouse_down)
		{
			ori_x = get_draw_pos(i.x, i.y).x;
			ori_y = get_draw_pos(i.x, i.y).y;
			ori_x = ori_x + (mouse_current_pos.x - mouse_start_pos.x);
			ori_y = ori_y + (mouse_current_pos.y - mouse_start_pos.y);
			ctx.rect(ori_x, ori_y, CHESS_WIDTH, CHESS_HEIGHT);
			ctx.fillText(i.txt, ori_x+5, ori_y+23);
		} else 
			ctx.fillText(i.txt, get_draw_pos(i.x, i.y).x+5, get_draw_pos(i.x, i.y).y+23);
	});
}


//=================================
// Link to model
//=================================

