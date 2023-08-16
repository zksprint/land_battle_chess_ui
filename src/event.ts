import { getDrawPos, getDrawPosIndex, getRectObj, updateShowMessage } from './draw';
import { drawBoardInit } from './init';
import { account, changeDisplay, gameId, ws } from './login';
import { updateDrawArray } from './main';
import { Board } from './board';
import { EGameState, Game } from './game';
import { Chess, Rank } from './chess';
import { getRevertLocation } from './location';
import { Location } from "./location"
import {
  movingPlayerHandleDrawMove, movingPlayerHandleLoseMove,
  movingPlayerHandleSimpleMove, movingPlayerHandleWinMove,
  waitingPlayerHandleDrawMove, waitingPlayerHandleLoseMove,
  waitingPlayerHandleSimpleMove, waitingPlayerHandleWinMove
} from './player';
import { aleoMovePiece, aleoWhisperPiece, chessFlag, updateMoveInfo } from './aleo';

// const assert = require('assert');
export let mouse_down = false;
export let mouse_start_pos: any;
export let mouse_current_pos: any;
export let selected_chess: any;  // draw_pos
export let selected_chess_movable: any = [];

export function clearSelectChess() {
  selected_chess = null
  selected_chess_movable = [];
}

export function initEventsValue() {
  mouse_down = false;
  mouse_start_pos = undefined;
  mouse_current_pos = undefined;
  selected_chess = undefined;
  selected_chess_movable = [];
}

function judgeStateUnSelect() {
  const state = Game.getInstance(gameId).getGameState()
  if (state == EGameState.WAITING_GAME_START || state == EGameState.WAITING_MOVABLE_RESULT || state == EGameState.WAITING_MOVEABLE) {
    return true
  }
}

function clickChessHandler(chess: Chess, coords: any, logicCoords: any) {
  playClickSound().then(() => {
    if (!chess.isLocalChess()) {
      console.log("player is not right chessPlay:", chess.address);
      return;
    }
    selected_chess = coords;
    selected_chess_movable = [];
    const gameState = Game.getInstance(gameId).getGameState();
    const curLocation = board.getLocationInstance(logicCoords.x, logicCoords.y)!;

    if (gameState === EGameState.WAITING_READY) {
      handleWaitingReadyState(curLocation);
    }

    if (gameState === EGameState.MOVABLE) {
      handleMovableState(curLocation);
    }
  })
    .catch((error) => {
      console.error("Failed to play click sound:", error);
    });
}

async function playClickSound(): Promise<void> {
  const audio = new Audio("../images/mouseClick.mp3");
  await audio.play();
}

function handleWaitingReadyState(curLocation: Location): void {
  const movable_location = board.GetPlaceableLocation(curLocation);
  for (const location of movable_location) {
    if (board.GetPlaceableLocation(location).indexOf(curLocation) > -1) {
      selected_chess_movable.push(getDrawPos(location.x, location.y));
    }
  }
}

function handleMovableState(curLocation: Location): void {
  const movable_location = board.GetMovableLocation(curLocation);
  movable_location!.forEach((i) => {
    selected_chess_movable.push(getDrawPos(i.x, i.y));
  });
}

//鼠标点击事件
export function canvasDown(e: MouseEvent): void {
  mouse_down = true;
  mouse_start_pos = { x: e.offsetX, y: e.offsetY };
  mouse_current_pos = { x: e.offsetX, y: e.offsetY };
  if (judgeStateUnSelect()) {
    return
  }
  const coords = getRectObj(mouse_start_pos);
  if (!coords) {
    console.log("coords is undefined", coords);
    return
  }
  const logicCoords = getDrawPosIndex(coords);
  if (!logicCoords) {
    return;
  }
  const chess = board.getLocationInstance(logicCoords.x, logicCoords.y).getChess();
  if (!chess) {
    return
  }
  if(chess.address != Game.getInstance(gameId).getLocalAddresses()){
    return
  }

  clickChessHandler(chess, coords, logicCoords)
}


export async  function canvasUp(e: MouseEvent) {
  mouse_start_pos = null;
  mouse_current_pos = { x: e.offsetX, y: e.offsetY };
  mouse_down = false;
  const rect_obj = getRectObj(mouse_current_pos);

  const gameState = Game.getInstance(gameId).getGameState();
  if (gameState === EGameState.WAITING_MOVABLE_RESULT) {
    return;
  }

  if (rect_obj && selected_chess) {
    const oriPos = getDrawPosIndex(selected_chess);
    const targetPos = getDrawPosIndex(rect_obj);
    if (!oriPos || !targetPos) {
      return;
    }

    if(oriPos.x == targetPos.x && oriPos.y == targetPos.y){
      return
    }

    const oriLocation = board.getLocationInstance(oriPos.x, oriPos.y);
    const chess = oriLocation.getChess();
    if (!chess || !chess.isLocalChess()) {
      return;
    }

    const targetLocation = board.getLocationInstance(targetPos.x, targetPos.y);
    if (gameState === EGameState.WAITING_READY) {
      canvasHandleWaitingReadyState(oriLocation, targetLocation);
    } else {
      await canvasHandleMoveEventState(chess, oriPos, targetLocation);
    }
  }

  updateDrawArray();
}

function canvasHandleWaitingReadyState(oriLocation: Location, targetLocation: Location): void {
  board.swap(oriLocation, targetLocation);
  selected_chess = null;
  selected_chess_movable = [];

}

async function canvasHandleMoveEventState(chess: Chess, oriPos: any, targetLocation: Location) {
  //等待上链
  await aleoMovePiece(oriPos.x, oriPos.y, targetLocation.x,targetLocation.y)
  if (chess.rank == Rank.FieldMarshal) {
    ws.sendMoveEvent(chess.rank, oriPos.x, oriPos.y, targetLocation.x, targetLocation.y, chessFlag.flagX, chessFlag.flagY);
  } else {
    ws.sendMoveEvent(chess.rank, oriPos.x, oriPos.y, targetLocation.x, targetLocation.y);
  }
  Game.getInstance(gameId).setGameState(EGameState.WAITING_MOVABLE_RESULT);
}

export function canvasMousemove(e: MouseEvent) {
  if (mouse_down) {
    mouse_current_pos = { x: e.offsetX, y: e.offsetY };
  }
}

export let board: Board;

//处理ws通知对手匹配完成事件
export function handleRole(data: any) {
  let game = Game.getInstance(data.game_id)
  if (game != undefined) {
    console.log("handleRole game exist id:", data.game_id)
    return
  }

  const oppAddress = data.player1 == account.toString() ? data.player2 : data.player1
  Game.createInstance(data.game_id, data.player1, data.player2, account,data.arbiter)
  board = new Board(account, oppAddress)
  drawBoardInit(account.toString(), oppAddress)
  changeDisplay()
  Game.getInstance(gameId).setGameState(EGameState.WAITING_READY)
}

//双方都ready，game start
export function handleGameStart(data: any) {
  let game = Game.getInstance(data.game_id)
  if (game == undefined) {
    console.log("handleGameStart game not exist id:", data.game_id)
    return
  }

  const stopButton = document.getElementById("timerShow") as HTMLButtonElement;
  stopButton.style.visibility = "visible";

  if (data.turn == Game.getInstance(gameId).getLocalAddresses()) {
    console.log("handleGameStart waiting move chess")
    Game.getInstance(gameId).setGameState(EGameState.MOVABLE)
    updateShowMessage("move the piece")
  }else{
    console.log("game start and player2 waiting moveable")
    Game.getInstance(gameId).setGameState(EGameState.WAITING_MOVEABLE)
    updateShowMessage("opponent move the piece")
  }
}

export async function handlePiecePosEvent(data: any) {
  //获取转为我方棋子信息
  let [reX, reY] = getRevertLocation(data.target_x, data.target_y)
  let targetChess = board.getLocationInstance(reX, reY).getChess()
  // if (targetChess == null) {
  //   console.log(`handlePiecePosEvent chess is null and send resX :${data.target_x} resY:${data.target_y} reX:${reX} rexY:${reY}`)
  //   await ws.sendWhisperEvent(0, data.target_x, data.target_y)
  //   return
  // }

  // if(targetChess.address != Game.getInstance(gameId).getLocalAddresses()) {
  //   console.log(`handlePiecePosEvent error target is not owner chess:(x:${data.target_x}, y:${data.target_y}) revert:(x:${reX}, y:${reY})`)
  // }

  // assert(targetChess.address == game.getCurrentAccount().toString())
  const chess = await aleoWhisperPiece(reX,reY)
  console.log(`handlePiecePosEvent get Chess rank:${chess?.rank} targetChess rank:${targetChess?.rank} rex:${reX} reY:${reY}`)
  if(chess == null){
    await ws.sendWhisperEvent(0, data.target_x, data.target_y)
    return
  }

  if (chess.rank == Rank.FieldMarshal) {
    await ws.sendWhisperEvent(chess.rank, data.target_x, data.target_y, chessFlag.flagX, chessFlag.flagY)
  } else {
    //发送棋子信息
    await ws.sendWhisperEvent(chess.rank, data.target_x, data.target_y)
  }

}

enum AttackResult {
  SimpleMove = 0,
  Win = 1,
  Draw = 2,
  Lose = 3,
}

//不是行走棋子方，需要转坐标
function getPositions(data: any) {
  if (Game.getInstance(gameId).getGameState() != EGameState.WAITING_MOVABLE_RESULT) {
    let [revert_X, revert_Y] = getRevertLocation(data.x, data.y)
    let [revert_X1, revert_Y1] = getRevertLocation(data.target_x, data.target_y)

    return [revert_X, revert_Y, revert_X1, revert_Y1]
  }

  return [data.x, data.y, data.target_x, data.target_y]
}

function updateMoveResult(x:number, y:number,targetX:number,targetY:number,attackResult:number,game_winner:number=0,
    flag_x:number,flag_y:number,
    opp_flag_x:number,opp_flag_y:number) {

  let oppFlagX = 5
  let oppFlagY = 0

  if(board.isFlagLocation(opp_flag_x,opp_flag_y)){
    [oppFlagX,oppFlagY] =getRevertLocation(opp_flag_x,opp_flag_y)
  }

  console.log(`updateMoveResult flagx:${flag_x} flagy:${flag_y} oppFlagX:${oppFlagX} oppFlagY:${oppFlagY}`)
  updateMoveInfo(gameId,x,y,targetX,targetY,attackResult,flag_x,flag_y,oppFlagX,oppFlagY,game_winner)
  
}

//处理move result结果
export async function handleMoveResult(data: any) {
  const [origX, origY, targetX, targetY] = getPositions(data)
  const state = Game.getInstance(gameId).getGameState()

  console.log(`handleMoveResult origx:${origX} origY:${origY} targetX:${targetX} targetY:${targetY} AttackResult:${data.attack_result}  winner:${data.game_winner}`)
  updateMoveResult(origX,origY,targetX,targetY,data.attack_result,data.game_winner,data.flag_x,data.flag_y,data.opp_flag_x,data.opp_flag_y)

  switch (data.attack_result) {
    case AttackResult.SimpleMove:
      handleSimpleMoveResult(origX, origY, targetX, targetY)
      break
    case AttackResult.Win:
      handleWinMoveResult(origX, origY, targetX, targetY, data.opp_flag_x, data.opp_flag_y)
      break
    case AttackResult.Draw:
      handleDrawMoveEvent(origX, origY, targetX, targetY, data.flag_x, data.flag_y, data.opp_flag_x, data.opp_flag_y)
      break
    case AttackResult.Lose:
      handleLoseMoveEvent(origX, origY, data.flag_x, data.flag_y,data.opp_flag_x, data.opp_flag_y)
      break;
    default:
      console.log("error event", data.AttackResult)
  }
  stepNextMove(state)

  if(data.game_winner == 1 && Game.getInstance(gameId).isPlayer1()){
    alert("game is over and player1 are winner")
    await aleoMovePiece(0, 0, 0,0)
    Game.getInstance(gameId).finish()
    return 
  }

  if(data.game_winner == 2 && Game.getInstance(gameId).isPlayer1()){
    alert("game is over and player2 are winner")
    await aleoMovePiece(0, 0, 0,0)
    Game.getInstance(gameId).finish()
    return
  }

}

//正常的移动
function handleSimpleMoveResult(origX: number, origY: number, targetX: number, targetY: number) {
  if (Game.getInstance(gameId).getGameState() == EGameState.WAITING_MOVABLE_RESULT) {
    movingPlayerHandleSimpleMove(origX, origY, targetX, targetY)
  } else {
    waitingPlayerHandleSimpleMove(origX, origY, targetX, targetY)
  }
}

//winner
function handleWinMoveResult(origX: number, origY: number, targetX: number, targetY: number, oppFlagX: number, oppFlagY: number) {
  if (Game.getInstance(gameId).getGameState() == EGameState.WAITING_MOVABLE_RESULT) {
    movingPlayerHandleWinMove(origX, origY, targetX, targetY, oppFlagX, oppFlagY)
  } else {
    waitingPlayerHandleWinMove(origX, origY, targetX, targetY, oppFlagX, oppFlagY)
  }
}

//平局
function handleDrawMoveEvent(origX: number, origY: number, targetX: number,
  targetY: number, flagX: number, flagY: number, oppFlagX: number, oppFlagY: number) {
  if (Game.getInstance(gameId).getGameState() == EGameState.WAITING_MOVABLE_RESULT) {
    movingPlayerHandleDrawMove(origX, origY, targetX, targetY, oppFlagX, oppFlagY)
  } else {
    waitingPlayerHandleDrawMove(origX, origY, targetX, targetY, flagX, flagY)
  }
}


function handleLoseMoveEvent(origX: number, origY: number, flagX: number, flagY: number, oppFlagX: number, oppFlagY: number) {
  if (Game.getInstance(gameId).getGameState() == EGameState.WAITING_MOVABLE_RESULT) {
    movingPlayerHandleLoseMove(origX, origY, flagX, flagY)
  } else {
    waitingPlayerHandleLoseMove(origX, origY, oppFlagX, oppFlagY)
  }
}

export function stepNextMove(state:EGameState) {
  if (state == EGameState.WAITING_MOVEABLE){
    Game.getInstance(gameId).setGameState(EGameState.MOVABLE)
    console.log("waitting move changto to moveable")
    updateShowMessage("please move piece")
  }else{
    clearSelectChess()
    console.log("chang to waiting moveable")
    Game.getInstance(gameId).setGameState(EGameState.WAITING_MOVEABLE)
    updateShowMessage("opponent move piece")
  }
  updateDrawArray();
}