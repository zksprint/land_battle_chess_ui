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
}
