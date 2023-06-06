import { Account } from "@aleohq/sdk";
import { Chess, ChessStatus, Rank } from "./chess";
import { Location, LocationType } from "./location";
import { gameId } from "./login";
import { Game } from "./game";

export class Board {
  private chessList: Chess[] = [];
  locations: Location[] = []
  private rowCnt: number = 12
  private columnCnt: number = 5

  initChessList(address: string, oppAddress: string) {
    //司令、军长、师长、师长、旅长、旅长、团长、团长、营长、营长、连长、连长、连长、排长、排长、排长、工、工、工、雷、雷、雷、炸、炸、军旗
    const chess_array = [Rank.FieldMarshal, Rank.General, Rank.MajorGeneral, Rank.MajorGeneral,
       Rank.Brigadier, Rank.Brigadier, Rank.Colonel, Rank.Colonel, Rank.Major, Rank.Major,
       Rank.Captain, Rank.Captain, Rank.Captain, Rank.Lieutenant, Rank.Lieutenant, Rank.Lieutenant,
       Rank.Engineer, Rank.Engineer, Rank.Engineer, Rank.Landmine, Rank.Landmine, Rank.Landmine,
       Rank.Bomb, Rank.Bomb, Rank.Flag];
    chess_array.forEach((rank: number) => {
      this.chessList.push(new Chess(rank, address));
      this.chessList.push(new Chess(Rank.Empty as number, oppAddress));
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
  RevealFlag(address: string) {
    this.GetChessList(address, false).forEach((chess) => {
      if (chess.rank == Rank.Flag) {
        chess.displayed = true;
      }
    });
  }

  getFlagLocation(address: string) {
    for (const location of this.locations) {
      if (location.getChess() && location.getChess().rank == Rank.Flag && location.getChess().address == address) {
        return location
      }
    }
  }

  destroy_chess(chess: Chess) {
    if (chess.rank == Rank.Flag) {
      GameOver(chess.address);
    }
    //RevealFlag when Field Marshal is destroyed
    if (chess.rank == Rank.FieldMarshal) {
      this.RevealFlag(chess.address);
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
    console.log("error GetChessLocation not find chess:", chess.rank)
    return undefined;
  }

  // Return a list of chess for that player.
  // All the chess belongs to the player will be returned,
  // no matter died or alive.
  GetChessList(address: string, OnBoard: boolean = false): Chess[] {
    let chessList: Chess[] = [];
    for (const chess of this.chessList) {
      if (chess.address != address) {
        continue;
      }
      if (OnBoard) {
        if (chess.chessStatus == ChessStatus.OnBoard) {
          chessList.push(chess);
        }
      } else {
        chessList.push(chess)
      }

    }

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
      //行营不能放置 
      if (tmp.locationType == LocationType.Camp) {
        continue;
      }

      switch (chess.rank) {
        case Rank.Flag: //大本营
          if (tmp.locationType == LocationType.Headquarters) {
            locations.push(this.getLocationInstance(x, y));
          }
          break;
        case Rank.Bomb://炸弹只能放在次2行
          if (y >= 7) {
            locations.push(this.getLocationInstance(x, y));
          }
          break;
        case Rank.Landmine: //
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
    let tmpLoc: Location[] = [];
    let chess = oriLocation.getChess();
    if (!chess) {
      return tmpLoc
    }

    for (let x = 0; x < this.columnCnt; x++) {
      this.getPlayableLocation(x, chess, tmpLoc)
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
    }
  }

  // List the movable location for a chess on a particular location
  GetMovableLocation(oriLocation: Location) {
    let queue: any = [];
    let visited: any = [];
    let movable: Location[] = [];
    if (oriLocation.getChess()?.rank == Rank.Landmine || oriLocation.locationType == LocationType.Headquarters) {
      return [];
    }

    visited.push(oriLocation);
    oriLocation.edges.forEach((location) => queue.push(location));
    while (queue.length > 0) {
      let targetLocation: Location = queue.shift();
      visited.push(targetLocation);
      let [movable1, movable2] = is_movable(oriLocation, targetLocation);
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

  isFlagLocation(x: number, y: number): boolean {
    if ((y == 0 || y == 11) && (x == 1 || x == 3)) {
      return true
    }
    return false
  }

  private isOnRail(x: number, y: number): boolean {
    //第一行和最后一行
    if (y == 0 || y == 11) {
      return false
    }

    if (y == 1 || y == 5 || y == 6 || y == 10) {
      return true
    }

    if (y == 2 || y == 3 || y == 4 || y == 7 || y == 8) {
      if (x == 0 || x == 4) {
        return true
      }
      return false
    }

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

  constructor(account: Account, oppAddress: string) {
    for (let y = 0; y < this.rowCnt; y++) {
      this.setLocationType(y)
    }
    // init chess rank
    this.initChessList(account.toString(), oppAddress)
    //init edge location
    this.initLocationEdges()

  }

}


function is_movable(oriLocation: Location, targetLocation: Location) {
  let enemyChess = -1;	//no ches
  if (targetLocation.getChess() && targetLocation.getChess()!.address != oriLocation.getChess()!.address) {
    enemyChess = 1;	//enemy chess
  }
  //我方棋子
  if (targetLocation.getChess() && targetLocation.getChess()!.address == oriLocation.getChess()!.address) {
    enemyChess = 0;	//our chess
  }

  //for direct linkage 不是在铁路上但是位置相邻
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
  if (oriLocation.getChess() && oriLocation.getChess()!.rank == Rank.Engineer) {
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

  if (enemyChess == 0) {
    return [false, false];
  }

  if (enemyChess == 1 && targetLocation.locationType == LocationType.Camp) {
    return [false, false];
  }

  if (targetLocation.isOnRail == false) {
    return [false, false];
  }

  if (engineer) {
    if (enemyChess == 1 && targetLocation.locationType != LocationType.Camp) {
      return [true, false];
    }

    return [true, true];
  } else {
    if (enemyChess == 1 && targetLocation.locationType != LocationType.Camp &&
      (oriLocation.x == targetLocation.x || oriLocation.y == targetLocation.y)) {
      return [true, false];
    }

    if (targetLocation.isOnRail == true && (oriLocation.x == targetLocation.x || oriLocation.y == targetLocation.y)) {
      return [true, true];
    }
    else {
      return [false, false];
    }
  }

}

function GameOver(address: string) {
  alert("Player" + address + "Won!");
}