//==============================================================================
// Chess
//==============================================================================
import {Address } from "@aleohq/wasm";

export const Rank_zhHK = [
	"司令",//0
	"军长",//1
	"师长",//2
	"旅长",//3
	"团长",//4
	"营长",//5
	"连长",//6
	"排长",//7
	"工兵",//8
	"地雷",//9
	"炸弹",//10
	"军旗" //11
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

	constructor(rank:Rank, address:string) {
		this.rank = rank;
		this.chessStatus = ChessStatus.OnBoard;
		this.displayed = false;
    this.address= address
	}
}




