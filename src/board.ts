import { Chess, ChessStatus, Rank } from "./chess";
import { Location, LocationType } from "./location";

export class Board {
  private chessList: Chess[] = [];
  locations: Location[] = []
  private rowCnt: number = 12
  private columnCnt: number = 5
  private player: number;

  initChessList() {
    var chess_array = [0, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 11];
    chess_array.forEach((rank: number) => {
      this.chessList.push(new Chess(rank, 0));
      this.chessList.push(new Chess(rank, 1));
    });
  }

  initLocationEdges() {
    for (let x = 0; x < this.columnCnt; x++) {
      //添加左右相邻位置的location
      if (x <= 3) {
        for (let y = 0; y < this.rowCnt; y++) {
          this.addEdge(this.getLocationInstance(x, y), this.getLocationInstance(x + 1, y));
        }
      }

      //添加play1上下相邻的location、play2上下相邻的location 
      for (let y = 0; y <= 4; y++) {	//cols
        this.addEdge(this.getLocationInstance(x, y), this.getLocationInstance(x, y + 1));
      }
      for (let y = 6; y <= 10; y++) {	//cols
        this.addEdge(this.getLocationInstance(x, y), this.getLocationInstance(x, y + 1));
      }

    }

    //前线周边位置添加
    this.addEdge(this.getLocationInstance(0, 5), this.getLocationInstance(0, 6));
    this.addEdge(this.getLocationInstance(2, 5), this.getLocationInstance(2, 6));
    this.addEdge(this.getLocationInstance(4, 5), this.getLocationInstance(4, 6));

    //foreach camp
    this.locations.forEach((location: Location) => {
      if (location.locationType == LocationType.Camp) {
        this.addEdge(location, this.getLocationInstance(location.x - 1, location.y - 1));
        this.addEdge(location, this.getLocationInstance(location.x - 1, location.y + 1));
        this.addEdge(location, this.getLocationInstance(location.x + 1, location.y - 1));
        this.addEdge(location, this.getLocationInstance(location.x + 1, location.y + 1));
      }
    });
  }

  //关联两个相邻位置
  addEdge(location1: Location, location2: Location) {
    location1.addEdge(location2);
    location2.addEdge(location1);
  }

  // After Field Marshal died, the flag will be reveal 
  RevealFlag(player: number) {
    this.GetChessList(player).forEach((chess) => {
      if (chess.rank == Rank.Flag) {
        chess.displayed = true;
      }
    });
  }

  destroy_chess(chess: Chess) {
    if (chess.rank == Rank.Flag) {
      GameOver(chess.player);	
    }
    //RevealFlag when Field Marshal is destroyed
    if (chess.rank == 0) {
      this.RevealFlag(chess.player);
    }
    chess.chessStatus = ChessStatus.Captured;
  }


  // Get the location of a chess
  GetChessLocation(chess: Chess): Location | undefined {
    for (const location of this.locations) {
      if (location.getChess() == chess) {
        return location
      }
    }
    return undefined;
  }

  // Return a list of chess for that player.
  // All the chess belongs to the player will be returned,
  // no matter died or alive.
  GetChessList(player: number): Chess[] {
    let chessList:Chess[] = [];
    this.chessList.forEach(chess => {
      if (chess.player == player) {
        chessList.push(chess)
      }
    })
    return chessList;
  }

  // Find the location instance with same (x,y)
  getLocationInstance(x: number, y: number): Location {
    for (const location of this.locations) {
      if (location.x == x && location.y == y) {
        return location
      }
    }
    return new Location(x, y, LocationType.Headquarters, this.isOnRail(x, y))
  }

  private getPlayableLocation(x: number, chess: Chess, locations: Location[]) {
    for (let y = 6; y < this.rowCnt; y++) {
      let tmp = this.getLocationInstance(x, y);
      if (tmp.locationType == LocationType.Camp) {
        continue;
      }

      switch (chess.rank) {
        case 11:
          if (tmp.locationType == LocationType.Headquarters) {
            locations.push(this.getLocationInstance(x, y));
          }
          break;
        case 10:
          if (y >= 8) {
            locations.push(this.getLocationInstance(x, y));
          }
          break;
        case 9:
          if (y >= 10) {
            locations.push(this.getLocationInstance(x, y));
          }
          break
        default:
          locations.push(this.getLocationInstance(x, y));
          break;
      }
    }
  }

  GetPlaceableLocation(oriLocation: Location): Location[] {
    let tmpLoc:Location[] = [];
    let chess = oriLocation.getChess();
    for (let x = 0; x < this.columnCnt; x++) {
      this.getPlayableLocation(x, chess!, tmpLoc)
    }
    return tmpLoc;
  }

  swap(oriLocation: Location, targetLocation: Location): void {
    var oriChess = oriLocation.getChess();
    var targetChess = targetLocation.getChess();

    if (this.GetPlaceableLocation(oriLocation).indexOf(targetLocation) != -1 &&
      this.GetPlaceableLocation(targetLocation).indexOf(oriLocation) != -1) {
      oriLocation.setChess(targetChess!);
      targetLocation.setChess(oriChess!);
      console.log(targetChess, oriChess);
    }
  }

  // List the movable location for a chess on a particular location
  GetMovableLocation(oriLocation: Location) {
    let queue:any = [];
    let visited:any = [];
    let movable = [];
    if (oriLocation.getChess()?.rank == 9 || oriLocation.locationType == LocationType.Headquarters) {
      return;
    }

    visited.push(oriLocation);
    oriLocation.edges.forEach((location) => queue.push(location));
    while (queue.length > 0) {
      let targetLocation = queue.shift();
      let [movable1, movable2] = is_movable(oriLocation, targetLocation);
      visited.push(targetLocation);
      if (movable1) {
        movable.push(targetLocation);
      }

      if (!movable2) {
        continue
      }

      targetLocation.edges.forEach((location: Location) => {
        if (location.isOnRail == true) {
          let visited_bool = false;
          for (const visitedLocation of visited) {
            if (visitedLocation == location) {
              visited_bool = true;
              break
            }
          }
          // if visited -> skip
          if (!visited_bool && queue.indexOf(location) == -1)
            queue.push(location);
        }
      });
    }
    return movable;
  }

  Move(chess: Chess, targetLocation: Location): number {
    var oriLocation = this.GetChessLocation(chess);
    if (oriLocation && this.GetMovableLocation(oriLocation)!.indexOf(targetLocation) == -1) {
      //verify the movable positions for the chess on oriLocation
      //if not movable, return
      return -1;
    }
    //if chess is already on the board
    if (oriLocation) {
      oriLocation.removeChess();
    }
    //targetLocation is null
    let targetChess = targetLocation.getChess();
    if (targetChess == undefined) {
      targetLocation.setChess(chess);
      return 0
    }

    //if target location have enemy chess
    let [alive0, alive1] = chess.compareRank(targetChess);
    if (!alive0) {
      this.destroy_chess(chess);
    }
    if (!alive1) {
      this.destroy_chess(targetChess);
    }
    //chess1 alive and chess2 dead
    if (alive0 && !alive1) {
      targetLocation.setChess(chess);
    }
    //chess1 dead and chess2 alive
    if (!alive0 && alive1) {
      targetLocation.setChess(targetChess);
    }
    //both dead
    if (!alive0 && !alive1) {
      oriLocation!.removeChess();
      targetLocation.removeChess();
    }

    return 0
  }

  private isOnRail(_i: number, _j: number): boolean {
    return false
  }


  //设置location type
  private setLocationType(y: number) {
    for (let x = 0; x < this.columnCnt; x++) {
      let locationType = LocationType.SoldierStation;

      //第0行1列或者1行4列是大本营的位置 第12行1列或者12行4列也是大本营的位置
      if ((x == 1 && (y == 0 || y == 11)) || (x == 3 && (y == 0 || y == 11))) {
        locationType = LocationType.Headquarters;
      }

      //行营
      if (((x == 1 || x == 3) && (y == 2 || y == 4 || y == 7 || y == 9))
        || (x == 2 && (y == 3 || y == 8))) {
        locationType = LocationType.Camp;
      }

      this.locations.push(new Location(x, y, locationType, this.isOnRail(x, y)));
    }
  }

  constructor(player: number) {
    this.player = player;
    for (let y = 0; y < this.rowCnt; y++) {
      this.setLocationType(y)
    }
    // init chess rank
    this.initChessList()
    //init edge location
    this.initLocationEdges()

  }

}


function is_movable(oriLocation: Location, targetLocation: Location) {
  let enemyChess = -1;	//no ches
  if (targetLocation.getChess() && targetLocation.getChess()!.player != oriLocation.getChess()!.player) {
    enemyChess = 1;	//enemy chess
  }
  //我方棋子
  if (targetLocation.getChess() && targetLocation.getChess()!.player == oriLocation.getChess()!.player) {
    enemyChess = 0;	//our chess
  }

  //for direct linkage 不是在铁路上且位置相邻
  if (!oriLocation.isOnRail && oriLocation.edges.indexOf(targetLocation) != -1) {
    if (enemyChess == 0) {
      return [false, false];
    }
    //目标位置对方棋子，且目标位置类型是行营
    if (enemyChess == 1 && targetLocation.locationType == LocationType.Camp) {
      return [false, false];
    }
    return [true, false];
  }

  //for rail case 工兵
  let engineer = false;
  if (oriLocation.getChess() && oriLocation.getChess()!.rank == 8) {
    engineer = true;
  }
  //位置相邻
  if (oriLocation.edges.indexOf(targetLocation) > -1) {
    if (enemyChess == 0) {
      return [false, false];
    }

    if (enemyChess == 1 && targetLocation.locationType == LocationType.Camp) {
      return [false, false];
    }

    if (enemyChess == 1 && targetLocation.locationType != LocationType.Camp) {
      return [true, false];
    }

    if (targetLocation.isOnRail == false) {
      return [true, false];
    }

    return [true, true];
  }

  if (enemyChess == 0){
    return [false, false];
  }

  if (enemyChess == 1 && targetLocation.locationType == LocationType.Camp) {
    return [false, false];
  }

  if (targetLocation.isOnRail == false){
    return [false, false];
  }

  if (engineer) {
    if (enemyChess == 1 && targetLocation.locationType != LocationType.Camp){
      return [true, false];
    }

    return [true, true];
  } else {
    if (enemyChess == 1 && targetLocation.locationType != LocationType.Camp &&
      (oriLocation.x == targetLocation.x || oriLocation.y == targetLocation.y)){
        return [true, false];
      }

    if (targetLocation.isOnRail == true && (oriLocation.x == targetLocation.x || oriLocation.y == targetLocation.y)){
      return [true, true];
    }
    else{
      return [false, false];
    }
  }

}

function GameOver(player:number){
	alert("Player"+player+"Won!");
}