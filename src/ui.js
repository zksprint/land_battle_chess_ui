draw_array = [];
draw_pos = [];
CHESS_WIDTH = 60;
CHESS_HEIGHT = 33;
player_color = { 0: "blue", 1: "red" }
current_player = 0;
//Prepare stage
//Mouse related
mouse_down = false;
selected_chess = "";	//draw_pos
selected_chess_movable = [];
mouse_start_pos = null;
mouse_current_pos = null;
//timer
timer_value = 0;
game_started = false;
current_game_player = 0;
//State machine
chess_changed = true;

function mytimer() {
  if ( game_started == true ) {
    var i = document.getElementById( "timer" ).value;
    if ( i > 0 )
      document.getElementById( "timer" ).value = i - 1;
    else {
      alert( "Time's up!" );
      game_started = false;
    }
  }
}
function timer_next_player() {
  document.getElementById( "timer" ).value = timer_value;
}
function GameStart() {
  timer_value = document.getElementById( "timer" ).value;
  document.getElementById( "timer" ).disabled = true;
  document.getElementById( "start_button" ).style.visibility = "hidden";
  document.getElementById( "stop_button" ).style.visibility = "visible";
  game_started = true;
}


function GameStop() {
  document.getElementById( "timer" ).disabled = false;
  document.getElementById( "start_button" ).style.visibility = "visible";
  document.getElementById( "stop_button" ).style.visibility = "hidden";
  game_started = false;
}

//set the positions to an array.
function init() {
  var x_arr = [7, 370];
  x_arr.forEach( ( k ) => {
    for ( var i = 0; i < 6; i++ ) {
      draw_pos.push( { x: 7, y: k } );
      draw_pos.push( { x: 102, y: k } );
      draw_pos.push( { x: 204, y: k } );
      draw_pos.push( { x: 307, y: k } );
      draw_pos.push( { x: 400, y: k } );
      k += 48;
    }
  } );
  document.getElementById( "start_button" ).addEventListener( "click", GameStart );
  document.getElementById( "stop_button" ).addEventListener( "click", GameStop );
  setInterval( mytimer, 1000 );
}

function get_draw_pos( x, y ) {	//-> draw_pos[x]
  return draw_pos[x + y * 5];
}

function get_draw_pos_index( obj ) { // draw_pos[x] => x,y
  index = draw_pos.indexOf( obj );
  if ( index == -1 )
    return;
  else
    return { x: index % 5, y: Math.floor( index / 5 ) };
}

function get_rect_obj( coordinate ) { //-> draw_pos[x]
  canvasX = coordinate.x;
  canvasY = coordinate.y;
  var inside;
  draw_pos.forEach( ( i ) => {
    if ( ( i.x <= canvasX && canvasX <= i.x + CHESS_WIDTH ) &&
      ( i.y <= canvasY && canvasY <= i.y + CHESS_HEIGHT ) )
      inside = i;
  } );
  return inside;
}

function canvas_down( e ) {
  mouse_down = true;
  mouse_start_pos = { x: e.offsetX, y: e.offsetY };
  mouse_current_pos = { x: e.offsetX, y: e.offsetY };
  coords = get_rect_obj( mouse_start_pos );
  logic_coords = get_draw_pos_index( coords );
  if ( !logic_coords )
    return;
  chess = board.getLocationInstance( logic_coords.x, logic_coords.y ).getChess();
  if ( chess.player != current_player || current_game_player != current_player )
    return;
  selected_chess = coords;
  selected_chess_movable = [];
  if ( selected_chess && board.getLocationInstance( logic_coords.x, logic_coords.y ).getChess() ) {
    pos = get_draw_pos_index( coords );
    if ( game_started == true ) {
      movable_location = board.GetMovableLocation( board.getLocationInstance( pos.x, pos.y ) );
      movable_location.forEach( ( i ) => selected_chess_movable.push( get_draw_pos( i.x, i.y ) ) );
    } else {
      movable_location = board.GetPlaceableLocation( board.getLocationInstance( pos.x, pos.y ) );
      movable_location.forEach( ( i ) => {
        if ( board.GetPlaceableLocation( i ).indexOf( board.getLocationInstance( pos.x, pos.y ) ) > -1 ) {
          selected_chess_movable.push( get_draw_pos( i.x, i.y ) );
        }
      } );
    }
  }
}
function AI_Move() {
  do {
    console.log( "current_player", current_player );
    var myArray = board.GetChessList( 1 - current_player, true );
    var rand = Math.floor( Math.random() * myArray.length );
    var rand_chess = myArray[rand];
    console.log( "getRandChess:", rand_chess.rand );
    var myArray2 = board.GetMovableLocation( board.GetChessLocation( rand_chess ) );
    console.log("AI_Move moveable array lenght:", myArray2.length);

    var rand = Math.floor( Math.random() * myArray2.length );
    var rand_pos = myArray2[rand];
    console.log( rand_chess, rand_pos );
  } while ( board.Move( rand_chess, rand_pos ) == -1 );

  current_game_player = current_player;
  timer_next_player();
  update_draw_array();
}


function canvas_up( e ) {
  mouse_start_pos = null;
  mouse_current_pos = null;
  mouse_down = false;
  mouse_current_pos = { x: e.offsetX, y: e.offsetY };
  rect_obj = get_rect_obj( mouse_current_pos );
  if ( rect_obj && selected_chess ) {
    ori_location = get_draw_pos_index( selected_chess );
    target_location = get_draw_pos_index( rect_obj );
    targetLocationInstance = get_draw_pos_index( rect_obj );
    ori_location_logic = board.getLocationInstance( ori_location.x, ori_location.y );
    chess = ori_location_logic.getChess();
    if ( chess.player != current_player )
      return;
    targetLocationInstance_logic = board.getLocationInstance( target_location.x, target_location.y );
    if ( game_started == false ) {
      board.swap( ori_location_logic, targetLocationInstance_logic );
    } else {
      if ( board.Move( chess, targetLocationInstance_logic ) != -1 ) {
        timer_next_player();
        current_game_player = 1 - current_player;
        setTimeout( AI_Move, Math.floor( ( Math.random() * 2000 ) + 1000 ) );
      }
    }

    selected_chess = null
    selected_chess_movable = [];
  }
  update_draw_array();
}
function canvas_mousemove( e ) {
  if ( !mouse_down )
    return;
  mouse_current_pos = { x: e.offsetX, y: e.offsetY };
}
var canvas;
var ctx;
function default_position( set ) {
  if ( set == 1 ) {
    p1 = board.GetChessList( 0,false );
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

function all_init() {
  canvas = document.getElementById( "Board" );
  ctx = canvas.getContext( "2d" );
  resetChess();
  init();
  default_position( 1 );
  canvas.addEventListener( 'mousedown', canvas_down );
  canvas.addEventListener( 'mouseup', canvas_up );
  canvas.addEventListener( 'mouseleave', canvas_up );
  canvas.addEventListener( 'mousemove', canvas_mousemove );
  setInterval( () => { draw( ctx ); } );
  update_draw_array();
  draw( ctx );
}

function is_chess_visible( chess ) {
  if ( chess.display == true )
    return true;
  if ( chess.player == current_player )
    return true;
  else
    return false;
}

function update_draw_array() {
  resetChess();
  board.locations.forEach( ( i ) => {
    chess = i.getChess();
    if ( chess && chess != null && chess.chessStatus == ChessStatus.OnBoard ) {
      var visible = is_chess_visible( chess );
      drawChess( Rank_zhHK[chess.rank], i.x, i.y, player_color[chess.player], visible );
    }
  } );
}

//[[5,5], [88,5], [175,5], [263,5], [345,5],
//

function resetChess() {
  draw_array = [];
}
function drawChess( txt, x, y, color, txt_visible ) {
  draw_array.push( { txt: txt, x: x, y: y, color: color, txt_visible: txt_visible } );
}


//==============================================================================
// Render function
//==============================================================================
dash_count = 0;
loop_count = 0;
function draw( ctx ) {
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
    ctx.lineWidth = "5";
    ctx.beginPath();
    //console.log(selected_chess_movable);
    if ( get_draw_pos( i.x, i.y ) == selected_chess )	//selected chess
    {
      ctx.strokeStyle = "orange";
      if ( mouse_down == true ) {
        ori_x = get_draw_pos( i.x, i.y ).x;
        ori_y = get_draw_pos( i.x, i.y ).y;
        ori_x = ori_x + ( mouse_current_pos.x - mouse_start_pos.x );
        ori_y = ori_y + ( mouse_current_pos.y - mouse_start_pos.y );
        ctx.rect( ori_x, ori_y, CHESS_WIDTH, CHESS_HEIGHT );
      } else
        ctx.rect( get_draw_pos( i.x, i.y ).x, get_draw_pos( i.x, i.y ).y, CHESS_WIDTH, CHESS_HEIGHT );
      /*ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = dash_count;*/
    } else {
      ctx.setLineDash( [] );
      ctx.strokeStyle = i.color;
      ctx.rect( get_draw_pos( i.x, i.y ).x, get_draw_pos( i.x, i.y ).y, CHESS_WIDTH, CHESS_HEIGHT );
    }
    //rect
    ctx.fill();
    ctx.stroke();

    //shadow
    //ctx.shadowColor = '#111';
    //ctx.shadowBlur = 3;
    //ctx.shadowOffsetX = 1;
    //ctx.shadowOffsetY = 1;
    //fill
    if ( get_draw_pos( i.x, i.y ) == selected_chess )
      ctx.fillStyle = 'lightblue';
    else
      //ctx.fillStyle = '#CCC';
      //ctx.fillStyle = '#b69b4c';
      ctx.fillStyle = '#fff';
    //if empty chess
    //ctx.fillStyle = "rgba(255, 255, 255, 0)";
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
  selected_chess_movable.forEach( ( i ) => {
    ctx.lineWidth = "5";
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
    if ( !document.getElementById( "debug" ).checked && !i.txt_visible )
      return;
    if ( get_draw_pos( i.x, i.y ) == selected_chess && mouse_down ) {
      ori_x = get_draw_pos( i.x, i.y ).x;
      ori_y = get_draw_pos( i.x, i.y ).y;
      ori_x = ori_x + ( mouse_current_pos.x - mouse_start_pos.x );
      ori_y = ori_y + ( mouse_current_pos.y - mouse_start_pos.y );
      ctx.rect( ori_x, ori_y, CHESS_WIDTH, CHESS_HEIGHT );
      ctx.fillText( i.txt, ori_x + 9, ori_y + 25 );
    } else
      ctx.fillText( i.txt, get_draw_pos( i.x, i.y ).x + 9, get_draw_pos( i.x, i.y ).y + 25 );
  } );
}


//=================================
// Link to model
//=================================
