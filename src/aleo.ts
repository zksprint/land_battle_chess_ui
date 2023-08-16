
import { gameId, sleep } from "./login";
import { Game } from "./game";
import { board } from "./event";
import { Rank } from "./chess";
import { getRevertLocation } from "./location";
import { RecordCiphertext, RecordPlaintext } from "../aleo/wasm/pkg/aleo_wasm";
import { AleoNetworkClient } from "../aleo/sdk/src/aleo_network_client";
import { DevelopmentClient } from "../aleo/sdk/src/development_client";
import { Transaction, ViewKey } from "@aleohq/sdk";

// import { Transaction } from "@aleohq/sdk";
const Long = require('long');

let moveInfo: string
let moveInfoObj = {gameId:'', x:0, y:0, targetX:0, targetY:0, attackResult:0, flagX:0, flagY:0, oppFlagX:0, oppFlagY:0, gameWinner:0}
export let chessFlag = {flagX:0,flagY:0}

export function isError(result: any): result is Error {
  return result instanceof Error;
}

export function updateMoveInfo(gameId: string, x: number, y: number,
  targetX: number, targetY: number, attackResult: number,
  flagX: number, flagY: number,
  oppFlagX: number, oppFlagY: number, gameWinner: number) {
  // console.log(`x:${x} y:${y} targetX:${targetX} targetY${targetY} attackResult:${attackResult} flagX${flagX} flagY:${flagX} gameWinner:${gameWinner}`)
  moveInfoObj.gameId = gameId
  moveInfoObj.x = x !== undefined ? x : moveInfoObj.x;
  moveInfoObj.y = y !== undefined ? y : moveInfoObj.y;
  moveInfoObj.targetX = (targetX == undefined ) ?  moveInfoObj.targetX : targetX;
  moveInfoObj.targetY = (targetY == undefined ) ? moveInfoObj.targetY: targetY;
  moveInfoObj.attackResult = attackResult !== undefined ? attackResult : moveInfoObj.attackResult;
  moveInfoObj.flagX = (flagX == undefined || flagX == null) ? moveInfoObj.flagX: flagX;
  moveInfoObj.flagY = (flagY == undefined || flagY == null) ? moveInfoObj.flagY: flagY ;
  moveInfoObj.oppFlagX = (oppFlagX == undefined || oppFlagX == null ) ?  moveInfoObj.oppFlagX : oppFlagX;
  moveInfoObj.oppFlagY = (oppFlagY == undefined || oppFlagY == null) ?   moveInfoObj.oppFlagY : oppFlagY;

  moveInfo = `{
    game_id: ${moveInfoObj.gameId}u64,
    player: ${Game.getInstance(gameId).getLocalAddresses()},
    x: ${moveInfoObj.x.toString()+'u64'},
    y: ${moveInfoObj.y.toString()+'u32'},
    target_x: ${moveInfoObj.targetX.toString()+'u64'},
    target_y: ${moveInfoObj.targetY.toString()+'u32'},
    attack_result: ${moveInfoObj.attackResult.toString()+'u32'},
    flag_x: ${moveInfoObj.flagX.toString()+'u64'},
    flag_y: ${moveInfoObj.flagY.toString()+'u32'},
    opp_flag_x: ${moveInfoObj.oppFlagX.toString()+'u64'},
    opp_flag_y: ${moveInfoObj.oppFlagY.toString()+'u32'},
    game_winner: ${moveInfoObj.gameWinner.toString()+'u32'}
  }`
  // console.log(`updateMoveInfo result:${moveInfo}`)
}

export const aleoUrl: string = "http://127.0.0.1:3030"
export const developUrl: string = "http://192.168.2.20:4040"
export let nodeConnection: AleoNetworkClient
export let developerClient: DevelopmentClient
let plainTexts: RecordPlaintext[] = []
let transactionId: any
const programId = "land_battle_chess.aleo"

export async function getFirstUnspentRecord(privateKey: string): Promise<RecordPlaintext | undefined> {
  let res = await nodeConnection.getLatestHeight()
  if (isError(res)) {
    alert("Error fetching latest block error:.");
    return
  }
  const lastHeight = res as number
  console.log("lastHeight:", lastHeight, " privateKey:", privateKey, " begin to find unspend record")

  const response1 = await nodeConnection.findUnspentRecords(0, lastHeight, privateKey, undefined, undefined)
  if (isError(response1)) {
    alert("Error fetching latest block error:.");
    return
  }
  let texts = response1 as Array<RecordPlaintext>
  for (const text of texts) {
    if (text.microcredits() > BigInt(1000)) {
      console.log(`find record ${text.toString()}`)
      return text
    }
  }
  return undefined
}

export function newAleoClient(url: string, devUrl: string = developUrl) {
  console.log("init newAleoClinet....")
  nodeConnection = new AleoNetworkClient(url)
  developerClient = new DevelopmentClient(devUrl)
}

export function getInitLinePiece(): [string[], number, number] {
  let lines = [Long.UZERO, Long.UZERO, Long.UZERO, Long.UZERO, Long.UZERO];
  for (let x = 0; x < 5; x++) {
    for (let y = 6; y < 12; y++) {
      const chess = board.getLocationInstance(x, y).getChess();
      if (chess == null) {
        continue;
      }

      if (chess.rank == Rank.Flag && chess.address == Game.getInstance(gameId).getLocalAddresses()) {
        chessFlag.flagX = x;
        chessFlag.flagY = y;
      }

      lines[x] = lines[x].or(Long.fromNumber(chess.rank).shiftLeft(4 * y));
      // const mask = Long.fromNumber(15);
      // const row = Long.fromNumber(y * 4);
      // let rank = lines[x].and(mask.shl(row)).shr(row); // 使用Long类进行位操作
      // console.log(`getInitLinePiece x:${x} y:${y} rank:${chess.rank} lines:${lines[x]} decode rank:${rank}`)
    }
  }
  const newLines = lines.map(line => Long.fromNumber(line).toString() + "u64");
  return [newLines, chessFlag.flagX , chessFlag.flagY];
}

export function getChessFromCoordinates(newLines:string[], x:number, y:number) {
  const lines = newLines.map(item => {
    const match = item.match(/(\d+)u\d+/);
    if (match) {
      return Long.fromString(match[1]);
    }
    return Long.UZERO;
  });

  const mask = Long.fromNumber(15);
  const row = Long.fromNumber(y * 4);
  const chess = board.getLocationInstance(x, y).getChess();
  let rank = lines[x].and(mask.shl(row)).shr(row); // 使用Long类进行位操作
  console.log(`getChessFromCoordinates  lines:${JSON.stringify(lines)},rank:${rank} chess rank:${chess?.rank} x:${x} y:${y}`);
  if (rank.isZero()) {
    return null;
  }

  if (chess.rank == rank.toNumber() && chess.address == Game.getInstance(gameId).getLocalAddresses()) {
    console.log(`getChessFromCoordinates x:${x} y:${y} rank:${chess.rank}`);
    return chess;
  }

  return null;
}

async function getRecordInfo(txId: string, viewKey: ViewKey): Promise<RecordPlaintext[]> {
  let recordInfo = []

  // console.log(`begin to getRecordInfo txId:${txId}`)
  try {
    const response = await nodeConnection.getTransaction(txId.slice(1, -1));
    if (response instanceof Error) {
      console.error("!!!fetch error:" + response);
      return [];
    }

    const txInfo = response as any
    const outValue = txInfo.execution.transitions[0].outputs[0].value
    const record = RecordCiphertext.fromString(outValue);
    const playState = record.decrypt(viewKey)

    const outValue2 = txInfo.fee.transition.outputs[0].value
    const unspentRecord = RecordCiphertext.fromString(outValue2);
    const unspent = unspentRecord.decrypt(viewKey)

    recordInfo.push(playState)
    recordInfo.push(unspent)
    // console.log(`---------getRecordInfo playState:${playState.toString()}  unspentRecord:${unspent.toString()}----------------`)
  } catch (error) {
    console.error("!!!! wrong getRecordInfo:",error);
  }

  return recordInfo;
}

/**
 * player_initialize_board(line0: u64, line1: u64, line2: u64, line3: u64, line4: u64,
        flag_x: u64, flag_y: u32, public game_id: u64, public player_index: u32, public arbiter: address) -> (player_state, bool) 
 */
export async function aleoInitializeBoard() {
  let [lines, flagXStr, flagYStr] = getInitLinePiece()
  const arbiter = Game.getInstance(gameId).getArbiter()
  const gameIdStr = gameId + "u64"
  const playerIndexStr = Game.getInstance(gameId).isPlayer1 ? "0u32" : "1u32"

  console.log(`aleoInitializeBoard,lines:${JSON.stringify(lines)} flagXStr:${flagXStr} flagYStr:${flagYStr}}`)
  const privateKey = Game.getInstance(gameId).getCurrentAccount().privateKey().to_string()
  updateMoveInfo(gameId, 0, 0, 0, 0, 0, flagXStr, flagYStr, 0, 0, 0)

  transactionId = await developerClient.executeProgram(programId, "player_initialize_board", 1, [lines[0], lines[1], lines[2], lines[3],
  lines[4], flagXStr.toString() + "u64", flagYStr.toString() + "u32", gameIdStr, playerIndexStr, arbiter], privateKey, undefined)
  console.log(`aleoInitializeBoard,id:${transactionId}`)
}

/**
 * move_piece(state: player_state, public opp_move: move,
        public x: u64, public y: u32, public target_x: u64, public target_y: u32) -> (player_state, piece_info)
 */
export async function aleoMovePiece(x: number, y: number, targetX: number, targetY: number) {
  console.log(`aleoMovePiece:(x:${x}, y:${y} (targetx:${targetX}, targety:${targetY})`)

  //aleoWhisperPiece 执行之后可能有playstate和record记录
  if(plainTexts.length == 0 ){
    plainTexts = await getRecordInfo(transactionId, Game.getInstance(gameId).getCurrentAccount().viewKey())
  }

  const privateKey = Game.getInstance(gameId).getCurrentAccount().privateKey().to_string()
  transactionId = await developerClient.executeProgram(programId, "move_piece", 1, [plainTexts[0].toString(), moveInfo,
                  x.toString() + "u64", y.toString() + "u32",
                  targetX.toString() + "u64", targetY.toString() + "u32"], privateKey, undefined, plainTexts[1].toString())
  plainTexts = []
  console.log(`aleoMovePiece transactionId is:${transactionId}`)

  // await sleep(10000)
  // const [playState1, recordFee1] = await getRecordInfo(transactionId, Game.getInstance(gameId).getCurrentAccount().viewKey())
  // console.log(`aleoMovePiece result tx is :${playState1.toString()} tx is:${JSON.stringify(recordFee1.toString)}`)

}

function extractValuesFromString(str:string) {
  const values:any = {};

  // 匹配 owner
  const ownerRegex = /owner: ([^,\s]+)/;
  const ownerMatch = str.match(ownerRegex);
  if (ownerMatch) {
    values.owner = ownerMatch[1];
  }

  // 匹配 gates
  const gatesRegex = /gates: ([^,\s]+)/;
  const gatesMatch = str.match(gatesRegex);
  if (gatesMatch) {
    values.gates = gatesMatch[1];
  }

  // 匹配 game_id
  const gameIdRegex = /game_id: ([^,\s]+)/;
  const gameIdMatch = str.match(gameIdRegex);
  if (gameIdMatch) {
    values.game_id = gameIdMatch[1];
  }

  // 匹配 board
  const boardRegex = /board: {([^}]+)}/;
  const boardMatch = str.match(boardRegex);
  if (boardMatch) {
    const boardStr = boardMatch[1];
    const lineRegex = /([^:\s]+): ([^,\s]+)/g;
    let lineMatch;
    while ((lineMatch = lineRegex.exec(boardStr))) {
      values[lineMatch[1]] = lineMatch[2];
    }
  }

  // 匹配 flag_x
  const flagXRegex = /flag_x: ([^,\s]+)/;
  const flagXMatch = str.match(flagXRegex);
  if (flagXMatch) {
    values.flag_x = flagXMatch[1];
  }

  // 匹配 flag_y
  const flagYRegex = /flag_y: ([^,\s]+)/;
  const flagYMatch = str.match(flagYRegex);
  if (flagYMatch) {
    values.flag_y = flagYMatch[1];
  }

  // 匹配 game_winner
  const gameWinnerRegex = /game_winner: ([^,\s]+)/;
  const gameWinnerMatch = str.match(gameWinnerRegex);
  if (gameWinnerMatch) {
    values.game_winner = gameWinnerMatch[1];
  }

  // 匹配 arbiter
  const arbiterRegex = /arbiter: ([^,\s]+)/;
  const arbiterMatch = str.match(arbiterRegex);
  if (arbiterMatch) {
    values.arbiter = arbiterMatch[1];
  }

  return values
}

/**
 * whisper_piece(state: player_state, public self_move: move, public target_x: u64, public target_y: u32) -> (player_state, piece_info) {
        assert_eq(state.game_winner, 0u32);
 */
export async function aleoWhisperPiece(targetX: number, targetY: number) {
  console.log(`aleoWhisperPiece: (targetx:${targetX}, targety:${targetY})`)

  if(plainTexts.length == 0 ){
    plainTexts = await getRecordInfo(transactionId, Game.getInstance(gameId).getCurrentAccount().viewKey())
  }

  const privateKey = Game.getInstance(gameId).getCurrentAccount().privateKey().to_string()
  transactionId = await developerClient.executeProgram(programId, "whisper_piece", 1, [plainTexts[0].toString(), moveInfo,
    targetX.toString()+ "u64", targetY.toString() + "u32"], privateKey, undefined, plainTexts[1].toString())

  plainTexts = []
  console.log(`after executeProgram whisper_piece id:${transactionId}`)
  await sleep(20000)

  plainTexts = await getRecordInfo(transactionId, Game.getInstance(gameId).getCurrentAccount().viewKey())
  console.log(`aleoWhisperPiece result tx is :${plainTexts[0].toString()} `)


  const aleoData = extractValuesFromString(plainTexts[0].toString())
  console.log(`aleoWhisperPiece extractValuesFromString:${JSON.stringify(aleoData)}`)
  // const aleoData = JSON.parse(plainTexts[0].toString())
  const lines = [aleoData.line0,aleoData.line1,aleoData.line2,aleoData.line3,aleoData.line4]
  const rank = getChessFromCoordinates(lines,targetX,targetY)

  return rank
  // const txInfo = tx as Transaction
  // for (const data of txInfo.execution.transitions) {
  //   console.log(`+++++++++++++aleoWhisperPiece txInfo:${JSON.stringify(data)}++++++++++++++++++`)
  // }

}
