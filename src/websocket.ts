import { Rank } from "./chess";
import { handleGameStart, handleMoveResult, handlePiecePosEvent, handleRole } from "./event";
import { ws } from "./login";

type MessageCallback = (message: string) => void;

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private messageCallback: MessageCallback | null = null;

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.url);
      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        resolve();
      };
      this.socket.onclose = this.onClose.bind(this);
      this.socket.onmessage = this.onMessage.bind(this);
      this.socket.onerror = this.onError.bind(this);
      this.setMessageCallback(handleWsServerMsg)
    });
  }

  private onClose(event: CloseEvent): void {
    console.log('WebSocket connection closed');
  }

  private onMessage(event: MessageEvent): void {
    const message = event.data;
    console.log('Received message:', message);
    if (this.messageCallback) {
      this.messageCallback(message);
    }
  }

  private onError(event: Event): void {
    console.error('WebSocket error:', event);
  }

  sendAsync(message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(message);
        resolve();
      } else {
        this.setMessageCallback(() => {
          this.socket?.send(message);
          resolve();
        });
      }
    });
  }

  close(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  setMessageCallback(callback: MessageCallback): void {
    this.messageCallback = callback;
  }

  async sendReadyEvent(gameId: string){
    console.log("send message to server",gameId)
    await ws.sendAsync(JSON.stringify({type:"ready",game_id:gameId}))
  }

  async sendMoveEvent(piece:number,x:number,y:number,targetX: number, targetY: number,flagX?:number,flagY?: number){
    console.log(`send move event to server piece rank:${piece} (x:${x},y:${y}) (targetX:${targetX} targetY:${targetY})`)
    if(piece == Rank.FieldMarshal){
      await ws.sendAsync(JSON.stringify({type:"move",piece:piece,x:x,y:y,
            target_x:targetX,target_y:targetY,flag_x:flagX,flag_y:flagY}))
    }else{
      await ws.sendAsync(JSON.stringify({type:"move",piece:piece,x:x,y:y,target_x:targetX,target_y:targetY}))
    }
  }

  async sendWhisperEvent(piece:number,x:number,y:number,flagX?:number,flagY?: number){
    console.log(`sendWhisperEvent rank:${piece} (x:${x},y:${y} flag(${flagX},${flagY}))`)
    if(piece == Rank.FieldMarshal){
      await ws.sendAsync(JSON.stringify({type:"whisper",piece:piece,x:x,y:y,flag_x:flagX,flag_y:flagY}))
    }else{
      await ws.sendAsync(JSON.stringify({type:"whisper",piece:piece,x:x,y:y}))
    }
  }
}

enum EMessageType {
  ROLE = "role",
  READY = "ready",
  GAME_START = "gameStart",
  MOVE = "move",
  PIECE_POS = "piecePos",
  MOVE_RESULT = "moveResult"
}

export function handleWsServerMsg(message: string) {
  const jsData = JSON.parse(message);
  const handlers:any = {
    [EMessageType.ROLE]: handleRole,
    [EMessageType.GAME_START]: handleGameStart,
    [EMessageType.PIECE_POS]: handlePiecePosEvent,
    [EMessageType.MOVE_RESULT]:handleMoveResult,
  };

  const handler = handlers[jsData.type];
  if (handler) {
    handler(jsData);
  } else {
    console.log("Unknown message type:", jsData.type);
  }
}

