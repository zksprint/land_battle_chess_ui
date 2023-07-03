
import { gameId, sleep } from "./login";
import { Game } from "./game";
import { board } from "./event";
import { Rank } from "./chess";
import { getRevertLocation } from "./location";
import { RecordPlaintext } from "../aleo/wasm/pkg/aleo_wasm";
import { AleoNetworkClient } from "../aleo/sdk/src/aleo_network_client";
import { DevelopmentClient } from "../aleo/sdk/src/development_client";

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

export function isError(result: any): result is Error {
  return result instanceof Error;
}

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

export const aleoUrl: string = "http://127.0.0.1:3030"
export const developUrl: string = "http://127.0.0.1:4040"
export let nodeConnection: AleoNetworkClient
export let developerClient: DevelopmentClient
let transactionId: string = ""
const programId = "land_battle_chess.aleo"

export async function getFirstUnspentRecord(privateKey: string): Promise<RecordPlaintext | undefined> {
  let res = await nodeConnection.getLatestHeight()
  if (isError(res)) {
    alert("Error fetching latest block error:.");
    return
  }
  const lastHeight = res as number
  console.log("lastHeight:", lastHeight," privateKey:",privateKey," begin to find unspend record")

  const response1 = await nodeConnection.findUnspentRecords(2500, 4000, privateKey, undefined, undefined)
  if (isError(response1)) {
    alert("Error fetching latest block error:.");
    return
  }
  let texts = response1 as Array<RecordPlaintext>
  for (const text of texts) {
    if (text.microcredits() > BigInt(1000000)) {
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

function getInitLinePiece(): [ string[], string, string ] {
  let lines = [ Long.UZERO, Long.UZERO, Long.UZERO, Long.UZERO, Long.UZERO ];
  let flagXStr = "0";
  let flagYStr = "0";

  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 11; y++) {
      let [ revX, revY ] = Game.getInstance(gameId).isPlayer1() ? [ x, y ] : getRevertLocation(x, y);
      const chess = board.getLocationInstance(revX, revY).getChess();
      if (chess == null) {
        lines[ x ] = lines[ x ].or(Long.fromNumber(0).shiftLeft(5 * x));
        continue;
      }

      if (chess.rank == Rank.Flag && chess.address == Game.getInstance(gameId).getLocalAddresses()) {
        flagXStr = revX.toString() + "u64";
        flagYStr = revY.toString() + "u32";
      }
      lines[ x ] = lines[ x ].or(Long.fromNumber(chess.rank).shiftLeft(5 * x));
    }
  }
  const newLines = lines.map(line => Long.fromNumber(line).toString() + "u64");

  return [ newLines, flagXStr, flagYStr ];
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
      const output = tx.outputs.find((output: { value: any; }) =>
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
  let [ lines, flagXStr, flagYStr ] = getInitLinePiece()
  const arbiter = Game.getInstance(gameId).getArbiter()
  const gameIdStr = gameId+"u64"
  const playerIndexStr = Game.getInstance(gameId).isPlayer1 ? "0u32" : "1u32"

  console.log(`aleoInitializeBoard`)
  const privateKey = Game.getInstance(gameId).getCurrentAccount().privateKey().to_string()
  const record = await getFirstUnspentRecord(privateKey)
  if (record == undefined){
    throw console.error("record is not find")
  }

  transactionId = await developerClient.executeProgram(programId, "player_initialize_board", 10000, [ "243944968059068u64", "243944970543153u64" ,"243944969889843u64", 
  "243944969494674u64", "243944969840532u64", "1u64", "0u32", "0u64", "1u32", "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px" ], privateKey, undefined, record.toString())
  console.log(`aleoInitializeBoard,id:`, transactionId)
}

/**
 * move_piece(state: player_state, public opp_move: move,
        public x: u64, public y: u32, public target_x: u64, public target_y: u32) -> (player_state, piece_info)
 */
export async function aleoMovePiece(x: number, y: number, targetX: number, targetY: number) {
  console.log(`aleoMovePiece:(x:${x}, y:${y} (targetx:${targetX}, targety:${targetY})`)
  const record = await getRecordInfo()
  console.log(`aleoMovePiece pre record info:${record.toString()}`)
  const privateKey = Game.getInstance(gameId).getCurrentAccount().privateKey().to_string()

  transactionId = await developerClient.executeProgram(programId, "move_piece", 10000, [ moveInfo,
    `${x.toString()}u64`, `${y.toString()}u64`,
    `${targetX.toString()}u64`, `${targetY.toString()}u32` ], privateKey, undefined, record.toString())
}

/**
 * whisper_piece(state: player_state, public self_move: move, public target_x: u64, public target_y: u32) -> (player_state, piece_info) {
        assert_eq(state.game_winner, 0u32);
 */
export async function aleoWhisperPiece(targetX: number, targetY: number) {
  console.log(`aleoWhisperPiece: (targetx:${targetX}, targety:${targetY})`)
  const record = await getRecordInfo()
  console.log(`aleoMovePiece pre record info:${record.toString()}`)
  const privateKey = Game.getInstance(gameId).getCurrentAccount().privateKey().to_string()
  transactionId = await developerClient.executeProgram(programId, "whisper_piece", 0, [ moveInfo,
    `${targetX.toString()}u64`, `${targetY.toString()}u64` ], privateKey, undefined, record.toString())
}
