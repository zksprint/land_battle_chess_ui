
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

export function isError(result: any): result is Error {
  return result instanceof Error;
}

export function updateMoveInfo(gameId: string, x: number, y: number,
  targetX: number, targetY: number, attackResult: number,
  flagX: number, flagY: number,
  oppFlagX: number, oppFlagY: number, gameWinner: number) {
  console.log(`x:${x} y:${y} targetX:${targetX} targetY${targetY} attackResult:${attackResult} flagX${flagX} flagY:${flagX} gameWinner:${gameWinner}`)
  moveInfo = `{
    game_id: ${gameId}u64,
    player: ${Game.getInstance(gameId).getLocalAddresses()},
    x: ${x.toString()+'u64'},
    y: ${y.toString()+'u32'},
    target_x: ${targetX.toString()+'u64'},
    target_y: ${targetY.toString()+'u32'},
    attack_result: ${attackResult.toString()+'u32'},
    flag_x: ${flagX.toString()+'u64'},
    flag_y: ${flagY.toString()+'u32'},
    opp_flag_x: ${oppFlagX.toString()+'u64'},
    opp_flag_y: ${oppFlagY.toString()+'u32'},
    game_winner: ${gameWinner.toString()+'u32'}
  }`
  console.log(`updateMoveInfo result:${moveInfo}`)
}

export const aleoUrl: string = "http://127.0.0.1:3030"
export const developUrl: string = "http://192.168.2.20:4040"
export let nodeConnection: AleoNetworkClient
export let developerClient: DevelopmentClient
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

function getInitLinePiece(): [string[], number, number] {
  let lines = [Long.UZERO, Long.UZERO, Long.UZERO, Long.UZERO, Long.UZERO];
  let flagXStr = 0;
  let flagYStr = 0;

  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 11; y++) {
      let [revX, revY] = Game.getInstance(gameId).isPlayer1() ? [x, y] : getRevertLocation(x, y);
      const chess = board.getLocationInstance(revX, revY).getChess();
      if (chess == null) {
        lines[x] = lines[x].or(Long.fromNumber(0).shiftLeft(5 * x));
        continue;
      }

      if (chess.rank == Rank.Flag && chess.address == Game.getInstance(gameId).getLocalAddresses()) {
        flagXStr = revX;
        flagYStr = revY;
      }
      lines[x] = lines[x].or(Long.fromNumber(chess.rank).shiftLeft(5 * x));
    }
  }
  const newLines = lines.map(line => Long.fromNumber(line).toString() + "u64");

  return [newLines, flagXStr, flagYStr];
}

async function getRecordInfo(txId: string, viewKey: ViewKey): Promise<RecordPlaintext[]> {
  let recordInfo = []

  if (transactionId == "") {
    console.log("Failed to get transaction Id")
    return
  }

  console.log(`begin to getRecordInfo txId:${txId}`)
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
    console.log(`---------getRecordInfo playState:${playState.toString()}  unspentRecord:${unspent.toString()}----------------`)
  } catch (error) {
    console.error(error);
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

  console.log(`aleoInitializeBoard`)
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

  const privateKey = Game.getInstance(gameId).getCurrentAccount().privateKey().to_string()
  const [playState, recordFee] = await getRecordInfo(transactionId, Game.getInstance(gameId).getCurrentAccount().viewKey())

  let transactionId1 = await developerClient.executeProgram(programId, "move_piece", 1, [playState.toString(), moveInfo,
  x.toString() + "u64", y.toString() + "u32",
  targetX.toString() + "u64", targetY.toString() + "u32"], privateKey, undefined, recordFee.toString())
  console.log(`aleoMovePiece transactionId is:${transactionId1}`)
  await sleep(20000)
  const [playState1, recordFee1] = await getRecordInfo(transactionId1, Game.getInstance(gameId).getCurrentAccount().viewKey())
  console.log(`++++++aleoWhisperPiece result tx is :${playState1.toString()} tx is:${JSON.stringify(recordFee1.toString)}`)

}

/**
 * whisper_piece(state: player_state, public self_move: move, public target_x: u64, public target_y: u32) -> (player_state, piece_info) {
        assert_eq(state.game_winner, 0u32);
 */
export async function aleoWhisperPiece(targetX: number, targetY: number) {
  console.log(`aleoWhisperPiece: (targetx:${targetX}, targety:${targetY})`)
  const [playState, recordFee] = await getRecordInfo(transactionId, Game.getInstance(gameId).getCurrentAccount().viewKey())

  const privateKey = Game.getInstance(gameId).getCurrentAccount().privateKey().to_string()

  let transactionId1 = await developerClient.executeProgram(programId, "whisper_piece", 1, [playState.toString(), moveInfo,
    targetX.toString()+ "u64", targetY.toString() + "u32"], privateKey, undefined, recordFee.toString())
  
  await sleep(20000)
  console.log(`=======aleoWhisperPiece transactionId is:${transactionId1} and begin to get transatcion ========`)
  const [playState1, recordFee1] = await getRecordInfo(transactionId1, Game.getInstance(gameId).getCurrentAccount().viewKey())
  console.log(`++++++aleoWhisperPiece result tx is :${playState1.toString()} tx is:${JSON.stringify(recordFee1.toString)}`)

  // const txInfo = tx as Transaction
  // for (const data of txInfo.execution.transitions) {
  //   console.log(`+++++++++++++aleoWhisperPiece txInfo:${JSON.stringify(data)}++++++++++++++++++`)
  // }

}
