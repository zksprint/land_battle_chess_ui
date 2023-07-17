import { Chess } from "./chess";

export enum LocationType_ZN {
  SoldierStation = "兵营",
  Camp = "行营",
  Headquarters = "大本营"
};

export enum LocationType {
  SoldierStation = "Soldier Station",
  Camp = "Camp",
  Headquarters = "Headquarters",
}

// Represent a movable location on the board
export class Location {
  edges: Location[] = [];
  chess: Chess | null;
  x: number;
  y: number;
  isOnRail: boolean = false;
  locationType: LocationType = LocationType.SoldierStation

  constructor(x: number, y: number, locationType: LocationType, isOnRail: boolean) {
    this.x = x;
    this.y = y;
    this.isOnRail = isOnRail;
    this.locationType = locationType
  }

  // edge is the connection between the locations
  addEdge(linkedLocation: Location) {
    if (this.edges.indexOf(linkedLocation) == -1) {
      this.edges.push(linkedLocation);
    }
  }

  setChess(chess: Chess) {
    this.chess = chess;
  }

  removeChess() {
    this.chess = null;
  }

  getChess(): Chess | null {
    return this.chess;
  }

}

//将对端发来的location转为本期盘的location
export function getRevertLocation(x: number, y: number): [x: number, y: number] {
  return [x, 11 - y]
}

