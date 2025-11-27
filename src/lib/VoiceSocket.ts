export class VoiceSocket {
  private ws: WebSocket | null = null;

  constructor(private url: string) {}

  connect(onMessage: (data: any) => void) {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("Voice WebSocket connected");
    };

    this.ws.onmessage = (event) => {
      try {
        const json = JSON.parse(event.data);
        onMessage(json);
      } catch (err) {
        console.error("Bad audio WS message", err);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.ws.onclose = () => {
      console.log("Voice WebSocket disconnected");
    };
  }

  sendAudio(base64Audio: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not ready to send audio");
      return;
    }
    this.ws.send(JSON.stringify({ audio: base64Audio }));
  }

  close() {
    this.ws?.close();
    this.ws = null;
  }
}
