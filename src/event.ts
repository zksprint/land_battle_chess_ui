import { getDrawPos, getDrawPosIndex, getRectObj } from './draw';
import { current_player } from './init';
import { AI_Move, board, game_started, timerNextPlayer, updateDrawArray } from './main';

export let mouse_down = false;
export let mouse_start_pos:any;
export let mouse_current_pos:any;
export let selected_chess:any;  // draw_pos
export let selected_chess_movable:any = [];
export let current_game_player = 0;

//鼠标点击事件
export function canvasDown(e: MouseEvent): void {
  mouse_down = true;
  mouse_start_pos = { x: e.offsetX, y: e.offsetY };
  mouse_current_pos = { x: e.offsetX, y: e.offsetY };
  const coords = getRectObj(mouse_start_pos);
  const logic_coords = getDrawPosIndex(coords!);
  if (!logic_coords) {
    return;
  }

  //玩家不对
  const chess = board.getLocationInstance(logic_coords.x, logic_coords.y).getChess();
  if (chess!.player != current_player || current_game_player != current_player) {
    return;
  }

  selected_chess = coords;
  selected_chess_movable = [];
  if (selected_chess && board.getLocationInstance(logic_coords.x, logic_coords.y).getChess()) {
    const pos = getDrawPosIndex(coords!)!;
    if (game_started == true) {
      let movable_location = board.GetMovableLocation(board.getLocationInstance(pos.x, pos.y));
      movable_location!.forEach(
        (i) => selected_chess_movable.push(getDrawPos(i.x, i.y)));
      return
    }

    let movable_location = board.GetPlaceableLocation(board.getLocationInstance(pos.x, pos.y));
    console.log('canvas_down game is not start', movable_location)
    for (const location of movable_location) {
      if (board.GetPlaceableLocation(location).indexOf(board.getLocationInstance(pos.x, pos.y)) > -1) {
        selected_chess_movable.push(getDrawPos(location.x, location.y));
      }
    }
  }
}

export function setCurrentGamePlayer(value: number): void {
  current_game_player = value
}


//鼠标up事件
export function canvasUp(e: MouseEvent) {
  mouse_start_pos = null;
  mouse_current_pos = null;
  mouse_down = false;
  mouse_current_pos = { x: e.offsetX, y: e.offsetY };
  const rect_obj = getRectObj(mouse_current_pos);

  if (rect_obj && selected_chess) {
    //获取原来的坐标和目的坐标
    const oriPos = getDrawPosIndex(selected_chess)!;
    const targetPos = getDrawPosIndex(rect_obj)!;
    const oriLocation = board.getLocationInstance(oriPos.x, oriPos.y);
    const chess = oriLocation.getChess()!;
    if (chess.player != current_player) {
      return;
    }

    const targetLocation = board.getLocationInstance(targetPos.x, targetPos.y);
    if (game_started == false) {
      board.swap(oriLocation, targetLocation);
      return
    }

    if (board.Move(chess, targetLocation) != -1) {
      timerNextPlayer();
      setCurrentGamePlayer(1 - current_player)
      setTimeout(AI_Move, Math.floor((Math.random() * 2000) + 1000));
    }
    selected_chess = null
    selected_chess_movable = [];
  }
  updateDrawArray();
}

export function canvasMousemove(e: MouseEvent) {
  if (mouse_down) {
    mouse_current_pos = { x: e.offsetX, y: e.offsetY };
  }
}