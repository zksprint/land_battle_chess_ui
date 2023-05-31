//==============================================================================
// Chess
//==============================================================================
import {Address } from "@aleohq/wasm";

export const Rank_zhHK = [
	"司令",//0
	"軍長",//1
	"師長",//2
	"旅長",//3
	"團長",//4
	"營長",//5
	"連長",//6
	"排長",//7
	"工兵",//8
	"地雷",//9
	"炸彈",//10
	"軍旗" //11
];


export enum Rank {
  "Field Marshal",
  "General",
  "Lieutenant General",
  "Brigadier",
  "Colonel",
  "Major",
  "Captain",
  "Platoon Commander",
  "Engineer",
  "Landmine",
  "Grenade",
  "Flag",
}

//棋子状态
export enum ChessStatus {
  OnBoard,  //存活
  Captured,  //dead
}

// Chess object representing a chess instance
export class Chess {
  rank: number;  //等级
  address:string;
  displayed:boolean; //是否显示
  chessStatus:ChessStatus; 

	constructor(rank:Rank, address?:string) {
		this.rank = rank;
		this.chessStatus = ChessStatus.OnBoard;
		this.displayed = false;
    this.address= address
	}
}




