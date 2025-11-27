export default class CameraManager {
  private static instance: CameraManager;
  private stream: MediaStream | null = null;

  static getInstance() {
    if (!CameraManager.instance) {
      CameraManager.instance = new CameraManager();
    }
    return CameraManager.instance;
  }

  async listCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(d => d.kind === "videoinput");
  }

  async startCamera(deviceId?: string): Promise<MediaStream> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: "environment" } },
        audio: false,
      });
      return this.stream;
    } catch (err) {
      console.error("Camera start failed:", err);
      throw err;
    }
  }

  async switchCamera(deviceId: string): Promise<MediaStream> {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
    }
    return await this.startCamera(deviceId);
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
  }
}
