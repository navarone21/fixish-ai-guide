export class AnchorManager {
  private anchors: any = {};

  update(serverAnchors: any) {
    this.anchors = serverAnchors;
  }

  getAnchors() {
    return this.anchors;
  }
}
