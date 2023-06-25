import { AleoNetworkClient, DevelopmentClient, Output } from "@aleohq/sdk";
import { gameId, sleep } from "./login";
import { Game } from "./game";
import { board } from "./event";
import { Rank } from "./chess";
import { getRevertLocation } from "./location";
import { RecordPlaintext } from "@aleohq/wasm";
// import { Transaction } from "@aleohq/sdk";
const Long = require('long');

// export interface MovePieceInfo {
//   game_id: string, //u64
//   player: string,  //address
//   x: string, //u64,
//   y: string, //u32,
//   target_x: string, // u64,
//   target_y: string, // u32,

//   attack_result: string, // u32 // 0: simple move, 1: win, 2: draw, 3: lose

//   flag_x: string, //u64,
//   flag_y: string, //u32,
//   opp_flag_x: string, //u64,
//   opp_flag_y: string, //u32,

//   game_winner: string, //u32,
// }


/*
  record player_state {
    owner: address,
    gates: u64,
    game_id: u64
    board: board_state,
    flag_x: u64,
    flag_y: u32,
    game_winner: u32, // 0, 1 or 2
    arbiter: address,
    player_index: u32, // 1 or 2
    }
*/

/*
  record piece_info {
    owner: address,
    gates: u64,
    game_id: u64
    player: address,
    piece: u64,
    x: u64,
    y: u32,
    flag_x: u64,
    flag_y: u32,
  }
 */
let moveInfo: any
export function updateMoveInfo(gameId: string, x: number, y: number,
                        targetX: number, targetY: number, attackResult: number,
                        flagX: number, flagY: number,
                        oppFlagX: number, oppFlagY: number, gameWinner: number) {
  moveInfo = `{
                gameId:"${gameId}u64",
                player: ${Game.getInstance(gameId).getLocalAddresses()},
                x:"${x}u32",
                y:"${y}u32",
                target_x: "${targetX}u32",
                target_y: "${targetY}u32",
                attack_result: "${attackResult}u32" // 0: simple move, 1: win, 2: draw, 3: lose
                flag_x: "${flagX}u64",
                flag_y: "${flagY}u32",
                opp_flag_x: "${oppFlagX}u64",
                opp_flag_y: "${oppFlagY}u32",
                game_winner: "${gameWinner}u32"
              }`
  console.log(`updateMoveInfo result:${moveInfo}`)
}

export const aleoUrl: string = "http://149.28.212.193:3030"
export const developUrl: string = "http://149.28.212.193:4040"
export let nodeConnection: AleoNetworkClient
export let developerClient: DevelopmentClient
let transactionId: string = ""
const programId = "land_battle_chess.aleo"

export function newAleoClient(url: string,devUrl:string=developUrl) {
  console.log("init newAleoClinet....")
  nodeConnection = new AleoNetworkClient(url)
  developerClient = new DevelopmentClient(devUrl)
}

function getInitLinePiece(): [string[], string, string] {
  let lines = [Long.UZERO, Long.UZERO, Long.UZERO, Long.UZERO, Long.UZERO];
  let flagXStr = "0";
  let flagYStr = "0";

  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 11; y++) {
      let [revX, revY] = Game.getInstance(gameId).isPlayer1() ? [x, y] : getRevertLocation(x, y);
      const chess = board.getLocationInstance(revX, revY).getChess();
      if (chess == null) {
        lines[x] = lines[x].or(Long.fromNumber(0).shiftLeft(5 * x));
        continue;
      }

      if (chess.rank == Rank.Flag && chess.address == Game.getInstance(gameId).getLocalAddresses()) {
        flagXStr = revX.toString() + "u64";
        flagYStr = revY.toString() + "u64";
      }
      lines[x] = lines[x].or(Long.fromNumber(chess.rank).shiftLeft(5 * x));
    }
  }
  const newLines = lines.map(line => Long.fromNumber(line).toString() + "u64");

  return [newLines, flagXStr, flagYStr];
}

async function getRecordInfo(): Promise<string> {
  while (transactionId === "") {
    await sleep(2000);
  }

  let recordText = "";

  try {
    const response = await nodeConnection.getTransaction(transactionId);
    if (response instanceof Error) {
      console.error(response);
      return "";
    }

    const currentAccount = Game.getInstance(gameId).getCurrentAccount();
    for (const tx of response.execution.transitions) {
      // 在输出中查找满足条件的记录
      const output = tx.outputs.find((output) =>
        currentAccount.ownsRecordCiphertext(output.value)
      );

      if (output) {
        // 解密记录文本
        recordText = currentAccount.decryptRecord(output.value);
        console.log(recordText);
        break; // 跳出内层循环
      }
    }
  } catch (error) {
    console.error(error);
  }

  return recordText;
}

/**
 * player_initialize_board(line0: u64, line1: u64, line2: u64, line3: u64, line4: u64,
        flag_x: u64, flag_y: u32, public game_id: u64, public player_index: u32, public arbiter: address) -> (player_state, bool) 
 */
export async function aleoInitializeBoard() {
  // let [lines, flagXStr, flagYStr] = getInitLinePiece()
  // const arbiter = Game.getInstance(gameId).getArbiter()
  // const playerIndexStr = Game.getInstance(gameId).isPlayer1 ? "0u32" : "u32"
  // console.log("begin to get unspendRecordInfo....")
  // const recordFee = await getUnspendRecordInfo()
  // if(recordFee.length == 0){
  //   throw console.error("failed to find unspent records")
  // }

  console.log(`aleoInitializeBoard`)
  const record = getUnspendRecordInfo()
  transactionId = await developerClient.executeProgram("hello.aleo","sum", 100,["1u32","0u32"],"APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH","{owner:aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px.private,  microcredits: 374989986086745u64.private,  _nonce: 2769753336736429046444578370097192476451397803312190936168551998746304500831group.public}")
  // transactionId = await developerClient.executeProgram(programId, "player_initialize_board", 0, [lines[0], lines[1], lines[2], lines[3],
  //                                                      lines[4], flagXStr, flagYStr, playerIndexStr, arbiter],undefined,undefined,recordFee[0].toString())
  console.log(`aleoInitializeBoard,id:`,transactionId)


}

/**
 * move_piece(state: player_state, public opp_move: move,
        public x: u64, public y: u32, public target_x: u64, public target_y: u32) -> (player_state, piece_info)
 */
export async function aleoMovePiece(x: number, y: number, targetX: number, targetY: number) {
  console.log(`aleoMovePiece:(x:${x}, y:${y} (targetx:${targetX}, targety:${targetY})`)
  const playerState = await getRecordInfo()
  console.log(`aleoMovePiece pre record info:${playerState}`)
  transactionId = await developerClient.executeProgram(programId, "move_piece", 0, [playerState, moveInfo,
                                                        `${x.toString()}u64`,`${y.toString()}u64`,
                                                        `${targetX.toString()}u64`, `${targetY.toString()}u32`])
}

/**
 * whisper_piece(state: player_state, public self_move: move, public target_x: u64, public target_y: u32) -> (player_state, piece_info) {
        assert_eq(state.game_winner, 0u32);
 */
export async function aleoWhisperPiece(targetX: number, targetY: number) {
  console.log(`aleoWhisperPiece: (targetx:${targetX}, targety:${targetY})`)
  const playerState = await getRecordInfo()
  console.log(`aleoWhisperPiece pre record info:${playerState}`)
  transactionId = await developerClient.executeProgram(programId, "whisper_piece", 0, [playerState, moveInfo,
                                                        `${targetX.toString()}u64`, `${targetY.toString()}u64`])
}

export async function getUnspendRecordInfo() {
  const maxMicrocredits = 100000;
  const block = await nodeConnection.getLatestHeight()
  // const key = Game.getInstance(gameId).getCurrentAccount().privateKey().to_string()
  const key = "APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH"
  let records = await nodeConnection.findUnspentRecords(0, block as number, key, undefined, maxMicrocredits);
  console.log("finish ....")
  return records as RecordPlaintext[]
}