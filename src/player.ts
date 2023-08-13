import { Chess, Rank } from "./chess"
import { updateShowMessage } from "./draw"
import { board, clearSelectChess } from "./event"
import {  Game } from "./game"
import { getRevertLocation } from "./location"
import { gameId } from "./login"


function revealOppFlag(oppFlagX: number, oppFlagY: number) {
  let [revertFlagX, revertFlagY] = getRevertLocation(oppFlagX, oppFlagY)
  let flagLocation = board.getLocationInstance(revertFlagX, revertFlagY)
  let flagChess: Chess = new Chess(Rank.Flag, Game.getInstance(gameId).getOppAddresses())
  flagChess.displayed = true
  flagLocation.setChess(flagChess)
}

//走棋方 处理simpl move
export function movingPlayerHandleSimpleMove(oriX: number, oriY: number, targetX: number, targetY: number) {
  let oriLocation = board.getLocationInstance(oriX, oriY)
  let chess = oriLocation.getChess()
  oriLocation.removeChess()

  const targetLocation = board.getLocationInstance(targetX, targetY)
  targetLocation.setChess(chess)
}
//待走棋方 x、y已经坐标已经转换
export function waitingPlayerHandleSimpleMove(oriX: number, oriY: number, targetX: number, targetY: number) {
  let oriLocation = board.getLocationInstance(oriX, oriY)
  let chess = oriLocation.getChess()
  oriLocation.removeChess()

  const targetLocation = board.getLocationInstance(targetX, targetY)
  targetLocation.setChess(chess)
}

function updateChessWinMove(origX: number, origY: number, targetX: number, targetY: number) {
  const targetLocation = board.getLocationInstance(targetX, targetY)
  let oriLocation = board.getLocationInstance(origX, origY)
  let chess = oriLocation.getChess()
  let targetChess = targetLocation.getChess()

  oriLocation.removeChess()
  board.destroy_chess(targetChess)
  targetLocation.setChess(chess)
}

//走棋方处理
export function movingPlayerHandleWinMove(origX: number, origY: number,
  targetX: number, targetY: number,
  oppFlagX: number, oppFlagY: number) {
  updateChessWinMove(origX, origY, targetX, targetY)
  if (board.isFlagLocation(oppFlagX, oppFlagY)) {
    revealOppFlag(oppFlagX, oppFlagY)
  }
}

//待走期方处理
export function waitingPlayerHandleWinMove(origX: number, origY: number,
  targetX: number, targetY: number,
  oppFlagX: number, oppFlagY: number) {
  
  updateChessWinMove(origX, origY, targetX, targetY)

  //对方赢了,本方暴露军旗
  if (board.isFlagLocation(oppFlagX, oppFlagY)) {
    board.RevealFlag(Game.getInstance(gameId).getLocalAddresses())
  }
}

export function updateChessDrawMove(origX: number, origY: number, targetX: number, targetY: number) {
  console.log(`updateChessDrawMove orig(${origX},${origY}) target:(${targetX},${targetY})`)
  let oriLocation = board.getLocationInstance(origX, origY)
  let chess = oriLocation.getChess()
  oriLocation.removeChess()

  const targetLocation = board.getLocationInstance(targetX, targetY)
  let targetChess = targetLocation.getChess()
  targetLocation.removeChess()

  board.destroy_chess(chess)
  board.destroy_chess(targetChess)
}

//走棋方处理draw事件
export function movingPlayerHandleDrawMove(origX: number, origY: number, targetX: number,
  targetY: number, oppFlagX: number, oppFlagY: number) {
  console.log(`movingPlayerHandleDrawMove`)
  updateChessDrawMove(origX, origY, targetX, targetY)

  //对方40挂了，才会有flag
  if (board.isFlagLocation(oppFlagX, oppFlagY)) {
    revealOppFlag(oppFlagX, oppFlagY)
  }
}

//待走棋方处理draw事件
export function waitingPlayerHandleDrawMove(origX: number, origY: number, targetX: number,
  targetY: number, flagX: number, flagY: number) {
  console.log(`waitingPlayerHandleDrawMove`)
  updateChessDrawMove(origX, origY, targetX, targetY)

  //显示走棋方军旗
  if (board.isFlagLocation(flagX, flagY)) {
    revealOppFlag(flagX, flagY)
  }
}

export function movingPlayerHandleLoseMove(origX: number, origY: number, flagX: number, flagY: number) {
  console.log(`movingPlayerHandleLoseMove`)
  let oriLocation = board.getLocationInstance(origX, origY)
  let chess = oriLocation.getChess()
  oriLocation.removeChess()
  board.destroy_chess(chess)

  //我方需要display军旗
  if (board.isFlagLocation(flagX, flagY)) {
    board.RevealFlag(Game.getInstance(gameId).getLocalAddresses())
  }
}

export function waitingPlayerHandleLoseMove(origX: number, origY: number, oppFlagX: number, oppFlagY: number) {
  console.log(`waitingPlayerHandleLoseMove`)
  let oriLocation = board.getLocationInstance(origX, origY)
  let chess = oriLocation.getChess()
  oriLocation.removeChess()
  board.destroy_chess(chess)

  //需要display对方军旗
  if (board.isFlagLocation(oppFlagX, oppFlagY)) {
    revealOppFlag(oppFlagX, oppFlagY)
  }

}