"use strict";

//==============================================================================
// API
//==============================================================================
// 1. Create board
//
// Constructor will create the chess and locations.
// Main player will be on the bottom while opponent on the top.
// board = new Board(mainPlayer);
//
// 2. Prepare stage
// Get chess that are not placed on board
// board.GetChessList(player);
//
// Default chess placement
// board.DefaultPlace(set);
//
// Check if a chess is able to place on a location
// board.PlaceChess(chess, location);
// board.Move(chess);
//
// 4. Competiton
// board.GetMovableLocations

class Player {
	constructor(username) {
		this.username = username
	}
}

//==============================================================================
// Chess
//==============================================================================
var Rank_zhHK = [
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

var Rank_enUS = [
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
	"Flag"
];

// Enum type for Chess status
var ChessStatus = {"OnBoard":1, "Dead":2}
Object.freeze(ChessStatus);		//Enum syntax for Javascript

// Chess object representing a chess instance
class Chess {
	constructor(rank, player) {
		this.rank = rank;
		this.player = player;
		this.chessStatus = ChessStatus.OnBoard;
		this.display = false;
	}
}

// Compare two chess, returns [bool, bool]
// false => die, true => alive
function CompareRank(chess1, chess2) {
	console.log("CMPRANK",chess1, chess2);
	if(chess1.rank==10 || chess2.rank==10)	//Grenade => both removed
		return [false, false];
	else if(chess1.rank==9 && chess2.rank==8)	//Engineer clear landmine
		return [false, true];
	else if(chess1.rank==8 && chess2.rank==9)	//Engineer clear landmine
		return [true, false];
	else if(chess1.rank==9 || chess2.rank==9)	//landmine kill other and itself
		return [false, false];
	else if(chess1.rank==chess2.rank)	//Same rank
		return [false, false];
	else if(chess1.rank<chess2.rank)	//1>2
		return [true, false];
	else if(chess1.rank>chess2.rank)	//1<2
		return [false, true];
	else
		console.log("Error in CompareRank()");
}


//==============================================================================
// Board
//==============================================================================
var LocationType_zhHK = {
	soldier_station: "兵營",
	camp: "行營",
	headquarters: "大本營"
};

var LocationType_enUS = {
	soldier_station: "Soldier Station",
	camp: "Camp",
	headquarters: "Headquarters"
};

// Represent a movable location on the board
class Location {
	constructor(x, y, locationType, isOnRail) {
		this.edges = [];
		this.x = x;
		this.y = y;
		this.locationType = locationType;
		this.isOnRail = isOnRail;
	}
	// edge is the connection between the locations
	addEdge(linked_location) {
		if(this.edges.indexOf(linked_location)<0)
			this.edges.push(linked_location);
	}
	setChess(chess) {
		this.chess = chess;
	}
	getChess() {
		return this.chess;
	}
}

function GameOver(player){
	alert("Player"+player+"Won!");
}
// Overall controller class, should be singleton
class Board {
	// add edge from 1 to 2 and from 2 to 1
	addEdge(location1, location2) {
		location1.addEdge(location2);
		location2.addEdge(location1);
	}

	// After Field Marshal died, the flag will be reveal 
	RevealFlag(player) {
		this.GetChessList(player).forEach( (i) => {
			if(i.rank == 11)
				i.display = true;
		});
	}

	// Set a chess status to dead
	destroy_chess(chess) {
		//Flag being captured => GameOver
		if(chess.rank==11)
			GameOver(chess);	
		//RevealFlag when Field Marshal is destroyed
		if(chess.rank==0)
			this.RevealFlag(chess.player);
		chess.chessStatus = ChessStatus.Dead;
	}

	// Get the location of a chess
	// return Option<location>
	GetChessLocation(chess) {
		var ret;
		if(chess) {
			this.locations.forEach( (i) => {
				if (i.getChess() == chess)
					ret = i;
			});
		}
		return ret;
	}

	// Return a list of chess for that player.
	// All the chess belongs to the player will be returned,
	// no matter died or alive.
	GetChessList(player, OnBoard) {
		var ret = [];
		this.chess.forEach((i) => {
			if(OnBoard) {
				if (i.chessStatus==ChessStatus.OnBoard && player == i.player)
					ret.push(i);
			} else {
				if(player == i.player)
					ret.push(i);
			}
		});
		return ret;
	}

	// Find the location instance with same (x,y)
	getLocationInstance(x,y) {
		var ret;
		this.locations.forEach( (i) => {
			if(i.x == x && i.y == y)
				ret=i;
		});
		return ret;
	}

	GetPlaceableLocation(ori_location) {
		var tmpLoc = [];
		var chess = ori_location.getChess();
		for(var i=0; i<5; i++) {
			for(var j=6; j<12; j++) {
				var tmp = this.getLocationInstance(i,j);
				if(tmp.locationType=="camp")
					continue;
				if(chess.rank==11) {
					if(tmp.locationType=="headquarters")
						tmpLoc.push(this.getLocationInstance(i,j));
				} else if(chess.rank==9) {
					if(j>=10)
						tmpLoc.push(this.getLocationInstance(i,j));
				} else if(chess.rank==10) {
					if(j>=8)
						tmpLoc.push(this.getLocationInstance(i,j));
				} else {
					tmpLoc.push(this.getLocationInstance(i,j));
				}
			}
		}
		return tmpLoc;
	}
		
	// List the movable location for a chess on a particular location
	GetMovableLocation(ori_location) {
		if(ori_location.getChess) {
			var tmp = ori_location.getChess;
			if(tmp.rank == 9 || 
				ori_location.locationType=="headquarters")
				return [];
		}
		var queue = [];
		var visited = [];
		var movable = [];
		visited.push(ori_location);
		ori_location.edges.forEach((i)=>queue.push(i));
		while(queue.length>0) {
			var u = queue.shift();
			var ret = is_movable(ori_location, u);
			visited.push(u);
			if(ret[0]==true)
				movable.push(u);
			if(ret[1]==true)
				u.edges.forEach( (i) => {
					if(i.isOnRail==true)
					{
						var visited_bool = false;
						visited.forEach( (j) => {
							if(j.x == i.x && j.y == i.y)
								visited_bool=true;
						});
						// if visited -> skip
						if(visited_bool==false && queue.indexOf(i)<0)
							queue.push(i);
					}
				});
		}
		return movable;
	}


	swap(ori_location, target_location) {
		var ori_chess = ori_location.getChess();
		var target_chess = target_location.getChess();
		console.log(this.GetPlaceableLocation(ori_location));
		if (this.GetPlaceableLocation(ori_location).indexOf(target_location)>-1 &&
			this.GetPlaceableLocation(target_location).indexOf(ori_location)>-1) {
			console.log(target_chess, ori_chess);
			ori_location.setChess(target_chess);
			console.log(target_chess, ori_chess);
			target_location.setChess(ori_chess);
		}
	}

	Move(chess, newLocation) {
		var ori_location = this.GetChessLocation(chess);
		if (ori_location && this.GetMovableLocation(ori_location).indexOf(newLocation)<0)
			//verify the movable positions for the chess on ori_location
			//if not movable, return
			return -1;	
		if (ori_location)
			ori_location.setChess(null);	//if chess is already on the board
		//if target location have enemy chess
		if(newLocation.getChess()) {
			var chess1 = chess;
			var chess2 = newLocation.getChess();
			var ret = CompareRank(chess1, chess2);
			if(ret[0]==false)
				this.destroy_chess(chess1);
			if(ret[1]==false)
				this.destroy_chess(chess2);
			if(ret[0]==true && ret[1]==false)
				newLocation.setChess(chess1);
			if(ret[0]==false && ret[1]==true)
				newLocation.setChess(chess2);
			if(ret[0]==false && ret[1]==false)
			{
				ori_location.setChess(null);
				newLocation.setChess(null);
			}
		} else {
			newLocation.setChess(chess);
		}
	}


	constructor(mainPlayer){
		//Create locations
		this.locations = [];
		//row 1
		this.locations.push(new Location(0, 0, "soldier_station", false));
		this.locations.push(new Location(1, 0, "headquarters", false));
		this.locations.push(new Location(2, 0, "soldier_station", false));
		this.locations.push(new Location(3, 0, "headquarters", false));
		this.locations.push(new Location(4, 0, "soldier_station", false));
		//row 2
		this.locations.push(new Location(0, 1, "soldier_station", true));
		this.locations.push(new Location(1, 1, "soldier_station", true));
		this.locations.push(new Location(2, 1, "soldier_station", true));
		this.locations.push(new Location(3, 1, "soldier_station", true));
		this.locations.push(new Location(4, 1, "soldier_station", true));
		//row 3
		this.locations.push(new Location(0, 2, "soldier_station", true));
		this.locations.push(new Location(1, 2, "camp", false));
		this.locations.push(new Location(2, 2, "soldier_station", false));
		this.locations.push(new Location(3, 2, "camp", false));
		this.locations.push(new Location(4, 2, "soldier_station", true));
		//row 4
		this.locations.push(new Location(0, 3, "soldier_station", true));
		this.locations.push(new Location(1, 3, "soldier_station", false));
		this.locations.push(new Location(2, 3, "camp", false));
		this.locations.push(new Location(3, 3, "soldier_station", false));
		this.locations.push(new Location(4, 3, "soldier_station", true));
		//row 5
		this.locations.push(new Location(0, 4, "soldier_station", true));
		this.locations.push(new Location(1, 4, "camp", false));
		this.locations.push(new Location(2, 4, "soldier_station", false));
		this.locations.push(new Location(3, 4, "camp", false));
		this.locations.push(new Location(4, 4, "soldier_station", true));
		//row 6
		this.locations.push(new Location(0, 5, "soldier_station", true));
		this.locations.push(new Location(1, 5, "soldier_station", true));
		this.locations.push(new Location(2, 5, "soldier_station", true));
		this.locations.push(new Location(3, 5, "soldier_station", true));
		this.locations.push(new Location(4, 5, "soldier_station", true));
		//---------------------------------------------------------------
		//row 7
		this.locations.push(new Location(0, 6, "soldier_station", true));
		this.locations.push(new Location(1, 6, "soldier_station", true));
		this.locations.push(new Location(2, 6, "soldier_station", true));
		this.locations.push(new Location(3, 6, "soldier_station", true));
		this.locations.push(new Location(4, 6, "soldier_station", true));
		//row 8
		this.locations.push(new Location(0, 7, "soldier_station", true));
		this.locations.push(new Location(1, 7, "camp", false));
		this.locations.push(new Location(2, 7, "soldier_station", false));
		this.locations.push(new Location(3, 7, "camp", false));
		this.locations.push(new Location(4, 7, "soldier_station", true));
		//row 9
		this.locations.push(new Location(0, 8, "soldier_station", true));
		this.locations.push(new Location(1, 8, "soldier_station", false));
		this.locations.push(new Location(2, 8, "camp", false));
		this.locations.push(new Location(3, 8, "soldier_station", false));
		this.locations.push(new Location(4, 8, "soldier_station", true));
		//row 10
		this.locations.push(new Location(0, 9, "soldier_station", true));
		this.locations.push(new Location(1, 9, "camp", false));
		this.locations.push(new Location(2, 9, "soldier_station", false));
		this.locations.push(new Location(3, 9, "camp", false));
		this.locations.push(new Location(4, 9, "soldier_station", true));
		//row 11
		this.locations.push(new Location(0, 10, "soldier_station", true));
		this.locations.push(new Location(1, 10, "soldier_station", true));
		this.locations.push(new Location(2, 10, "soldier_station", true));
		this.locations.push(new Location(3, 10, "soldier_station", true));
		this.locations.push(new Location(4, 10, "soldier_station", true));
		//row 12
		this.locations.push(new Location(0, 11, "soldier_station", false));
		this.locations.push(new Location(1, 11, "headquarters", false));
		this.locations.push(new Location(2, 11, "soldier_station", false));
		this.locations.push(new Location(3, 11, "headquarters", false));
		this.locations.push(new Location(4, 11, "soldier_station", false));

		//Chess
		this.chess = []
		var chess_array = [0,1,2,2,3,3,4,4,5,5,6,6,6,7,7,7,8,8,8,9,9,9,10,10,11];
		chess_array.forEach( (i) => {
			this.chess.push(new Chess(i, 0));
			this.chess.push(new Chess(i, 1));
		});

		//Create edges
		//All horizonton edge
		var x, y;
		for(x=0; x<=3; x++) {	//rows
			for(y=0; y<=11; y++) {	//cols
				this.addEdge(this.getLocationInstance(x,y),this.getLocationInstance(x+1,y));
			}
		}
		//All vertical edge
		for(x=0; x<=4; x++) {	//rows
			for(y=0; y<=4; y++) {	//cols
				this.addEdge(this.getLocationInstance(x,y),this.getLocationInstance(x,y+1));
			}
		}
		for(x=0; x<=4; x++) {	//rows
			for(y=6; y<=10; y++) {	//cols
				this.addEdge(this.getLocationInstance(x,y),this.getLocationInstance(x,y+1));
			}
		}
		this.addEdge(this.getLocationInstance(0,5),this.getLocationInstance(0,6));
		this.addEdge(this.getLocationInstance(2,5),this.getLocationInstance(2,6));
		this.addEdge(this.getLocationInstance(4,5),this.getLocationInstance(4,6));
		//All camp edge
		var camp_edge = function(camp) {
			this.addEdge(camp,this.getLocationInstance(camp.x-1,camp.y-1));
			this.addEdge(camp,this.getLocationInstance(camp.x-1,camp.y+1));
			this.addEdge(camp,this.getLocationInstance(camp.x+1,camp.y-1));
			this.addEdge(camp,this.getLocationInstance(camp.x+1,camp.y+1));
		}
		this.locations.forEach( (i) => {	//foreach camp
			if (i.locationType === "camp")
				camp_edge.call(this, i);
		});
	}
}

//[movable, continue search]

function __is_movable_check_chess(ori_location, targetLocationInstance, is_continue) {
	if(targetLocationInstance.getChess()) {
		if(targetLocationInstance.getChess().player === ori_location.getChess().player)
			return [false, false];	//target pos contains our chess
		if(targetLocationInstance.getChess().player !== ori_location.getChess().player)
		{
			if(targetLocationInstance.locationType === "camp")
				return [false,false];	//target enemy is in camp
			else {
				return [true, false];
			}
		}
	}
	return [true,is_continue];
}


function is_movable(ori_location, targetLocationInstance) {
	var enemyChess = -1;	//no ches
	if(targetLocationInstance.getChess()
			&& targetLocationInstance.getChess().player!==ori_location.getChess().player)
		enemyChess = 1;	//enemy chess
	if(targetLocationInstance.getChess()
			&& targetLocationInstance.getChess().player===ori_location.getChess().player)
		enemyChess = 0;	//our chess
	//for direct linkage
	if(ori_location.isOnRail == false) {
		if(ori_location.edges.indexOf(targetLocationInstance)>-1) {
			if(enemyChess==0)
				return [false,false];
			if(enemyChess==1 && targetLocationInstance.locationType === "camp")
				return [false,false];
			return [true, false];
		}
	}
	//for rail case
	var engineer = false;
	if(ori_location.getChess() && ori_location.getChess().rank == 8)
		engineer = true;
	if(ori_location.edges.indexOf(targetLocationInstance)>-1) {
		if(enemyChess==0)
			return [false,false];
		if(enemyChess==1 && targetLocationInstance.locationType === "camp")
			return [false,false];
		if(enemyChess==1 && targetLocationInstance.locationType !== "camp")
			return [true,false];
		if(targetLocationInstance.isOnRail==false) {
			return [true, false];
		} else {
			return [true, true];
		}
	} else {
		if(enemyChess==0)
			return [false,false];
		if(enemyChess==1 && targetLocationInstance.locationType === "camp")
			return [false,false];
		if(targetLocationInstance.isOnRail==false)
			return [false,false];
		if(engineer) {
			if(enemyChess==1 && targetLocationInstance.locationType !== "camp")
				return [true,false];
			return [true, true];
		} else {
			if(enemyChess==1 && targetLocationInstance.locationType !== "camp" &&
				(ori_location.x == targetLocationInstance.x || ori_location.y == targetLocationInstance.y))
				return [true,false];
			if(targetLocationInstance.isOnRail==true && 
				(ori_location.x == targetLocationInstance.x || ori_location.y == targetLocationInstance.y))
				return [true,true];
			else
				return [false,false];
		}
	}
	return [false,false];
}



//[movable, continue search]




var board = new Board();
