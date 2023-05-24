//==============================================================================
// Chess
//==============================================================================
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
  player:number; //属于哪个player
  displayed:boolean; //是否显示
  chessStatus:ChessStatus; 

	constructor(rank:Rank, player:number) {
		this.rank = rank;
		this.player = player;
		this.chessStatus = ChessStatus.OnBoard;
		this.displayed = false;
	}

  //棋子比较
  compareRank(chess2: Chess): [boolean, boolean] {
    if (this.rank === Rank.Grenade || chess2.rank === Rank.Grenade){
      return [false, false];
    }
    else if (this.rank === Rank.Landmine && chess2.rank === Rank.Engineer){
      return [false, true];
    }
    else if ( this.rank === Rank.Engineer && chess2.rank === Rank.Landmine){
      return [true, false];
    }
    else if (this.rank === Rank.Landmine || chess2.rank === Rank.Landmine){
      return [false, false];
    }
    else if (this.rank === chess2.rank){
      return [false, false];
    }
    else if (this.rank < chess2.rank) {
      return [true, false];
    }
    else if (this.rank > chess2.rank) {
      return [false, true];
    }
    else {
      throw new Error("Error in CompareRank()");
    }
  }
}




