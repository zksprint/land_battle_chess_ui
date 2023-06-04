import { Account } from "@aleohq/sdk";

export class Game {
  private static instances: { [gameId: string]: Game } = {};

  private gameId: string
  private player1: string
  private player2: string
  private account: Account

  constructor(gameId: string, player1: string, player2: string, account: Account) {
    this.gameId = gameId;
    this.player1 = player1;
    this.player2 = player2;
    this.account = account;
  }

  static createInstance(gameId: string, player1: string, player2: string, account: Account): Game {
    const instance = new Game(gameId, player1, player2, account);
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

  isPlayer1(): boolean {
    console.log("Game",this.player1,"account:",this.account.toString())
   return this.player1 == this.account.toString()
  }
}

// const game = Game.createInstance("123", "Player 1", "Player 2", "Player 1");
// const player1 = game.getPlayer1(); // 获取 player1 的值
// const player2 = game.getPlayer2(); // 获取 player2 的值

// console.log(player1); // "Player 1"
// console.log(player2); // "Player 2"
