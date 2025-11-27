// FixishClient.ts - WebSocket/REST hybrid client for Fix-ISH backend

type Subscriber = (data: any) => void;
type EventType = "state" | "world" | "data";

export class FixishClient {
  private static instance: FixishClient | null = null;
  
  ws: WebSocket | null = null;
  sessionId: string;
  backendUrl: string;
  onData: (data: any) => void;
  reconnectTimer: any = null;
  usingWebSocket: boolean = false;
  
  private subscribers: Map<EventType, Set<Subscriber>> = new Map();

  constructor(params: {
    backendUrl: string;
    sessionId?: string;
    onData: (data: any) => void;
  }) {
    this.backendUrl = params.backendUrl;
    this.sessionId = params.sessionId || this._generateSession();
    this.onData = params.onData;
  }

  static getInstance(): FixishClient {
    if (!FixishClient.instance) {
      throw new Error("FixishClient not initialized. Use FixishProvider first.");
    }
    return FixishClient.instance;
  }

  static setInstance(instance: FixishClient) {
    FixishClient.instance = instance;
  }

  subscribe(eventType: EventType, callback: Subscriber): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(callback);
    
    return () => {
      this.subscribers.get(eventType)?.delete(callback);
    };
  }

  private broadcast(eventType: EventType, data: any) {
    this.subscribers.get(eventType)?.forEach(cb => cb(data));
  }

  _generateSession() {
    return "fixish-" + Math.random().toString(36).substring(2, 12);
  }

  async startSession() {
    await fetch(`${this.backendUrl}/api/task/start`, {
      method: "POST",
      body: new URLSearchParams({ session_id: this.sessionId })
    });
  }

  // -----------------------------------------
  // WEBSOCKET MODE
  // -----------------------------------------
  connectWebSocket() {
    try {
      this.ws = new WebSocket(`${this.backendUrl.replace("http", "ws")}/ws/repair`);
      this.usingWebSocket = true;

      this.ws.onopen = () => {
        console.log("[Fixish] WebSocket connected");
      };

      this.ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          
          // Broadcast AI state to subscribers
          if (data.state) {
            this.broadcast("state", data);
          }
          
          // Broadcast world-state
          if (data.world) {
            this.broadcast("world", data);
          }
          
          // Original callback
          this.onData(data);
        } catch (err) {
          console.error("[Fixish] WS parse error:", err);
        }
      };

      this.ws.onclose = () => {
        console.warn("[Fixish] WS closed, switching to REST fallback");
        this.usingWebSocket = false;
        this.ws = null;
        this._attemptReconnect();
      };

    } catch (err) {
      console.error("[Fixish] WS failed:", err);
      this.usingWebSocket = false;
    }
  }

  _attemptReconnect() {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setInterval(() => {
      console.log("[Fixish] Attempting WS reconnect...");
      this.connectWebSocket();
      if (this.usingWebSocket) {
        clearInterval(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    }, 2000);
  }

  // -----------------------------------------
  // SEND A FRAME
  // -----------------------------------------
  async sendFrame(base64Frame: string, base64Depth?: string) {
    if (this.usingWebSocket && this.ws && this.ws.readyState === 1) {
      this.ws.send(
        JSON.stringify({
          session_id: this.sessionId,
          frame: base64Frame,
          depth: base64Depth || null
        })
      );
      return;
    }

    // REST FALLBACK
    const form = new FormData();
    form.append("session_id", this.sessionId);
    form.append("frame", this._b64ToBlob(base64Frame), "frame.jpg");

    if (base64Depth) {
      form.append("depth", this._b64ToBlob(base64Depth), "depth.jpg");
    }

    const res = await fetch(`${this.backendUrl}/api/task/stream`, {
      method: "POST",
      body: form
    });

    const data = await res.json();
    this.onData(data);
  }

  // -----------------------------------------
  // SEND ARBITRARY DATA (e.g., hand tracking)
  // -----------------------------------------
  send(data: any) {
    if (this.usingWebSocket && this.ws && this.ws.readyState === 1) {
      this.ws.send(
        JSON.stringify({
          session_id: this.sessionId,
          ...data
        })
      );
    } else {
      console.warn("[Fixish] Cannot send data - WebSocket not connected");
    }
  }

  _b64ToBlob(base64: string) {
    const byteString = atob(base64.split(",")[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([intArray], { type: "image/jpeg" });
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.usingWebSocket = false;
  }
}
