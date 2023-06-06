//==============================================================================
// Chess
//==============================================================================
import { Game } from "./game";
import { gameId } from "./login";

export const RANK_ZH = [
  "空",
  "军旗",
  "炸弹",
  "地雷",
  "工兵",
  "排长",
  "连长",
  "营长",
  "团长",
  "旅长",
  "师长",
  "军长",
  "司令"
]

export enum Rank {
  "Empty" = 0,
  "Flag" = 1,
  "Bomb" = 2,
  "Landmine" = 3,
  "Engineer" = 4,
  "Lieutenant" = 5,
  "Captain" = 6,
  "Major" = 7,
  "Colonel" = 8,
  "Brigadier" = 9 ,
  "MajorGeneral" = 10,
  "General" = 11,
  "FieldMarshal" = 12,
  "Unchanged" = 13,
  "Opponent" = 14,
}

//棋子状态
export enum ChessStatus {
  OnBoard = 1,  //存活
  Captured = 2,  //dead
}

// Chess object representing a chess instance
export class Chess {
  rank: Rank;  //等级
  address:string;
  displayed:boolean; //是否显示
  chessStatus:ChessStatus; 

	constructor(rank:Rank, address:string) {
		this.rank = rank;
		this.chessStatus = ChessStatus.OnBoard;
		this.displayed = false;
    this.address= address
	}

  isLocalChess(){
    return this.address == Game.getInstance(gameId).getLocalAddresses()
  }
}




