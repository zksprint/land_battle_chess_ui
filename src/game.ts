import { Account } from "@aleohq/sdk";
import { ws } from "./login";
import { clearSelectChess, initEventsValue } from "./event";

export  enum EGameState {
  WAITING_READY = "waiting_ready",
  READY = "ready",
  WAITING_GAME_START = "waiting_game_start",
  WAITING_MOVABLE_RESULT = "waiting_movable_result",
  MOVABLE = "movable",
  WAITING_MOVEABLE = "waiting_moveable"
}
export class Game {
  private static instances: { [gameId: string]: Game } = {};

  private gameId: string
  private player1: string
  private player2: string
  private account: Account
  private state:EGameState
  private arbiter:string

  constructor(gameId: string, player1: string, player2: string, account: Account,arbiter:string) {
    this.gameId = gameId;
    this.player1 = player1;
    this.player2 = player2;
    this.account = account;
    this.arbiter = arbiter
    this.state = EGameState.WAITING_READY
  }

  static createInstance(gameId: string, player1: string, player2: string, account: Account,arbiter:string): Game {
    const instance = new Game(gameId, player1, player2, account,arbiter);
    Game.instances[gameId] = instance;
    return instance;
  }

  static getInstance(gameId: string): Game | undefined {
    return Game.instances[gameId];
  }

  getPlayer1(): string {
    return this.player1;
  }

  getPlayer2(): string {
    return this.player2;
  }

  getCurrentAccount(): Account {
    return this.account
  }

  getGameState(): EGameState {
    return this.state
  }

  setGameState(state: EGameState): void {
    this.state = state
  }

  getOppAddresses(): string{
    return this.account.toString() == this.player1? this.player2:this.player1
  }

  getLocalAddresses(): string {
    return this.account.toString()
  }

  isPlayer1(): boolean {
   return this.player1 == this.account.toString()
  }

  getArbiter():string {
    return this.arbiter
  }

  finish(){
    this.gameId = "0"
    ws.close()
    clearSelectChess()
    initEventsValue()
  }

}

