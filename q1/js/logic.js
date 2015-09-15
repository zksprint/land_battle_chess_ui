"use strict";

//*****************************
// Chess
//*****************************
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

class Chess {
	constructor(rank, owner) {
		this.rank = rank;
		this.owner = owner;
	}
}

//return false => die, true => alive
function compare_rank(chess1, chess2) {
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
	else if(chess1.rank>chess2.rank)	//1>2
		return [true, false];
	else if(chess1.rank<chess2.rank)	//1<2
		return [false, true];
	else
		console.log("Error in compare_rank()");
}

function destroy_chess(chess) {
	if(chess.rank==11)
		GameOver(chess);	//Flag being captured => GameOver
	if(chess.rank==0)
		RevealFlag(chess);	//RevealFlag when Field Marshal is destroyed
}

function Move(chess, newLocation) {
	//if target location have enemy chess
	if(newLocation.get_chess()) {
		chess1 = chess;
		chess2 = newLocation.get_chess();
		var ret = compare_rank(chess1, chess2);
		if(ret[0]==false)
			destroy_chess(chess1);
		if(ret[1]==false)
			destroy_chess(chess2);
		if(ret[0]==true && ret[1]==false)
			newLocation.set_chess(chess1);
		if(ret[0]==false && ret[1]==true)
			newLocation.set_chess(chess2);
	} else {
		newLocation.set_chess(chess);
	}
}
	


//*****************************
// Board
//*****************************
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

class Location {
	constructor(x, y, locationType, isOnRail) {
		this.edges = [];
		this.x = x;
		this.y = y;
		this.locationType = locationType;
		this.isOnRail = isOnRail;
	}
	add_edge(linked_location) {
	//	if(this.edges.indexOf(linked_location)<0)
			this.edges.push(linked_location);
	}
	set_chess(chess) {
		this.chess = chess;
	}
	get_chess() {
		return this.chess;
	}
}

class Player {
	constructor(username) {
		this.username = username
	}
}

class Board {
	add_edge(location1, location2) {
		location1.add_edge(location2);
		location2.add_edge(location1);
	}

	get_location(x, y) {
		return this.locations[x+y*5];
	}

	constructor(){
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
			this.chess.push(new Chess(i.rank, 0));
			this.chess.push(new Chess(i.rank, 1));
		});

		//Create edges
		//All horizonton edge
		var x, y;
		for(x=0; x<=3; x++) {	//rows
			for(y=0; y<=11; y++) {	//cols
				this.add_edge(this.get_location(x,y),this.get_location(x+1,y));
			}
		}
		//All vertical edge
		for(x=0; x<=4; x++) {	//rows
			for(y=0; y<=4; y++) {	//cols
				this.add_edge(this.get_location(x,y),this.get_location(x,y+1));
			}
		}
		for(x=0; x<=4; x++) {	//rows
			for(y=6; y<=10; y++) {	//cols
				this.add_edge(this.get_location(x,y),this.get_location(x,y+1));
			}
		}
		this.add_edge(this.get_location(0,5),this.get_location(0,6));
		this.add_edge(this.get_location(2,5),this.get_location(2,6));
		this.add_edge(this.get_location(4,5),this.get_location(4,6));
		//All camp edge
		var camp_edge = function(camp) {
			this.add_edge(camp,this.get_location(camp.x-1,camp.y-1));
			this.add_edge(camp,this.get_location(camp.x-1,camp.y+1));
			this.add_edge(camp,this.get_location(camp.x+1,camp.y-1));
			this.add_edge(camp,this.get_location(camp.x+1,camp.y+1));
		}
		this.locations.forEach( (i) => {	//foreach camp
			if (i.locationType === "camp")
				camp_edge.call(this, i);
		});
	}
}

//[movable, continue search]
function is_movable(ori_location, target_location) {
	if(target_location.get_chess()) {
		if(target_location.get_chess().owner === ori_location.get_chess().owner)
			return [false, false];	//target pos contains our chess
		if(target_location.get_chess().owner !== ori_location.get_chess().owner)
		{
			if(target_location.locationType === "camp")
				return [false,false];	//target enemy is in camp
			else
				return [true, false];
		}
	} else {
		if(target_location.isOnRail == false)
			return [true, false];
		else {		//on rail
			if(ori_location.get_chess().rank!==8)
			{
				//only allow straight line movement on rail
				if(ori_location.x == target_location.x || ori_location.y == target_location.y)
					return [true, true];
				else
					return [false, false];
			} else {
				return [true, true];
			}
		}
	}
}


function get_movable_pos(ori_location) {
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
					if(visited_bool==false)	//visited -> skip
						queue.push(i);
				}
			});
	}
	return movable;
}


var board = new Board();
board.get_location(3,3).set_chess(new Chess(10));
get_movable_pos(board.get_location(3,3)).forEach( (i) => console.log(i.x,i.y));

//========================================
// API
//========================================

// Init a board
// Board() -> Board;

// Create a chess
// new Chess(rank: int, player: Player) -> Chess;

// Assign chess to a location
// board.get_location(x: int, y: int).set_chess(chess: Chess);

// Get movable location for a chess on the location
// get_movable_pos(location: Location) -> Option<Location[]>;

// Get placeable location for a chess
// Default Player_1 is user at bottom, Player_2 is AI on top
// get_placeable_location(player: Player, chess: Chess) -> Option<Location[]>

// Game over
// player: The winner
// GameOver(player: Player);

// Reveal the Flags when Field Marshal is destroyed
// RevealFlag(player: Player);

// Move a chess to a new location
// If the location have other chess, the winner will assign to the location
// Move(chess: Chess, location: Location);

// Destroy Chess
// destroy_chess(chess);


//========================================
// AI feature
//========================================

// Init the AI player's chess
// init_ai_chess();

