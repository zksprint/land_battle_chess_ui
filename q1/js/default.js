"use strict";

//*****************************
// Chess
//*****************************
var Rank_zhHK = {
	field_marshal: "司令",
	general: "軍長",
	lieutenant_general: "師長",
	bridgadier: "旅長",
	colonel: "團長",
	major: "營長",
	captain: "連長",
	platoon_commander: "排長",
	engineer: "工兵",
	landmine: "地雷",
	grenade: "炸彈",
	flag: "軍旗"
};

var Rank_enUS = {
	field_marshal: "Field Marshal",
	general: "General",
	lieutenant_general: "Lieutenant General",
	brigadier: "Brigadier",
	colonel: "Colonel",
	major: "Major",
	captian: "Captain",
	platoon_commander: "Platoon Commander",
	engineer: "Engineer",
	landmine: "Landmine",
	grenade: "Grenade",
	flag: "Flag"
};

class Chess {
	constructor(rank) {
		this.rank = rank;
	}
}
function fight(chess1, chess2) {
	if(chess1.rank==="grenade")
		return [false, false];
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
		this.edges.push(linked_location);
	}
}

class Board {
	add_edge(location1, location2) {
		location1.add_edge(location2);
		location2.add_edge(location1);
	}

	get_location(x, y) {
		return this.locations[x*5+y];
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


		//Create edges
		//All horizonton edge
		var i, j;
		for(i=0; i<=11; i++) {	//rows
			for(j=0; j<=3; j++) {	//cols
				this.add_edge(this.get_location(i,j),this.get_location(i,j+1));
			}
		}
		//All vertical edge
		for(i=0; i<=4; i++) {	//rows
			for(j=0; j<=4; j++) {	//cols
				this.add_edge(this.get_location(i,j),this.get_location(i+1,j));
			}
		}
		for(i=6; i<=10; i++) {	//rows
			for(j=0; j<=4; j++) {	//cols
				this.add_edge(this.get_location(i,j),this.get_location(i+1,j));
			}
		}
		this.add_edge(this.get_location(0,5),this.get_location(0,6));
		this.add_edge(this.get_location(2,5),this.get_location(2,6));
		this.add_edge(this.get_location(4,5),this.get_location(4,6));
		//All camp edge
		var camp_edge = function(camp_x, camp_y) {
			this.add_edge(this.get_location(camp_x,camp_y),this.get_location(camp_x-1,camp_y-1));
			this.add_edge(this.get_location(camp_x,camp_y),this.get_location(camp_x-1,camp_y+1));
			this.add_edge(this.get_location(camp_x,camp_y),this.get_location(camp_x+1,camp_y-1));
			this.add_edge(this.get_location(camp_x,camp_y),this.get_location(camp_x+1,camp_y+1));
		}
		camp_edge.call(this,1,2);
		camp_edge.call(this,1,4);
		camp_edge.call(this,1,7);
		camp_edge.call(this,1,9);
		camp_edge.call(this,2,3);
		camp_edge.call(this,2,8);
		camp_edge.call(this,3,2);
		camp_edge.call(this,3,4);
		camp_edge.call(this,3,7);
		camp_edge.call(this,3,9);
	}
}
var i = new Board();
i.locations.forEach((i)=>console.log(i));

