interface Orientation {
  pitch: number;
  roll: number;
  yaw: number;
}

export class DeviceMotionListener {
  private onUpdate: (orientation: Orientation) => void;

  constructor(onUpdate: (orientation: Orientation) => void) {
    this.onUpdate = onUpdate;
  }

  start() {
    if (typeof DeviceMotionEvent === "undefined") return;

    if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
      (DeviceMotionEvent as any).requestPermission()
        .then((res: string) => {
          if (res === "granted") this.attach();
        })
        .catch(console.error);
    } else {
      this.attach();
    }
  }

  attach() {
    window.addEventListener("deviceorientation", (event) => {
      const orientation: Orientation = {
        pitch: event.beta || 0,
        roll: event.gamma || 0,
        yaw: event.alpha || 0,
      };
      this.onUpdate(orientation);
    });
  }
}
