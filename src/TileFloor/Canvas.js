import * as THREE from "three";
import gsap from "gsap";

import Experience from "./Experience";

export default class Canvas {
  constructor() {
    this.experience = new Experience();
    this.mouse = this.experience.mouse;

    this.init();
  }

  init() {
    this.addCanvas();
  }

  addCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 128;
    this.canvas.height = 128;
    gsap.set(this.canvas, {
      position: "fixed",
      width: 256,
      height: 256,
      top: 0,
      left: 0,
      zIndex: 10,
    });

    // document.body.append(this.canvas);

    this.context = this.canvas.getContext("2d");
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.glowImage = new Image();
    this.glowImage.src = "./glow.png";

    this.texture = new THREE.CanvasTexture(this.canvas);
  }

  update() {
    if (!this.canvas || !this.context || !this.mouse || !this.glowImage) return;

    this.context.globalCompositeOperation = "source-over";
    this.context.globalAlpha = 0.05;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const canvasCursor = new THREE.Vector3(
      this.mouse.mouseUv.x * this.canvas.width,
      this.mouse.mouseUv.y * this.canvas.height,
      0
    );

    const lastCanvasCursor = new THREE.Vector3(
      this.mouse.lastMouseUv.x * this.canvas.width,
      this.mouse.lastMouseUv.y * this.canvas.height,
      0
    );

    const cursorDistance = lastCanvasCursor.distanceTo(canvasCursor);

    const alpha = Math.min(cursorDistance * 0.1, 1);

    const glowSize = this.canvas.width * 0.1;
    this.context.globalCompositeOperation = "lighten";
    this.context.globalAlpha = alpha;

    this.context.drawImage(
      this.glowImage,
      canvasCursor.x - glowSize * 0.5,
      canvasCursor.y - glowSize * 0.5,
      glowSize,
      glowSize
    );

    // Texture
    this.texture.needsUpdate = true;
  }

  destroy() {
    // Remove canvas from the document if it was added
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    // Clear canvas context
    if (this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Dispose of Three.js texture
    if (this.texture) {
      this.texture.dispose();
    }

    // Clear image references
    if (this.glowImage) {
      this.glowImage.src = "";
      this.glowImage = null;
    }
  }
}
