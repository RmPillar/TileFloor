import * as THREE from "three";

import Debug from "./Utils/Debug";
import Sizes from "./Utils/Sizes";
import Time from "./Utils/Time";
import StatsMonitor from "./Utils/StatsMonitor";
import Camera from "./Camera";
import Renderer from "./Renderer";
import Resources from "./Utils/Resources";
import sources from "./sources";
import Mouse from "./Mouse";
import Floor from "./Floor";
import Tiles from "./Tiles";
import Canvas from "./Canvas";

let instance = null;

export default class Experience {
  constructor(_canvas) {
    // Singleton
    if (instance) {
      return instance;
    }

    instance = this;

    // Options
    this.canvas = _canvas;

    // Setup
    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.statsMonitor = new StatsMonitor();
    this.resources = new Resources(sources);
    this.mouse = new Mouse();
    this.canvas2D = new Canvas();

    this.resources.on("ready", () => {
      this.fog = new THREE.Fog(0x000000, 1, 12);
      this.scene.fog = this.fog;

      this.directionalLight = new THREE.DirectionalLight(0xffffff, 15);
      this.directionalLight.position.set(1, 3, -1);
      this.scene.add(this.directionalLight);

      this.tiles = new Tiles();
      this.floor = new Floor();
      this.renderer = new Renderer();
    });

    // Resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });
  }

  resize() {
    if (!this.camera || !this.renderer) {
      return;
    }

    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    if (
      !this.camera ||
      !this.floor ||
      !this.tiles ||
      !this.renderer ||
      !this.statsMonitor ||
      !this.mouse ||
      !this.canvas2D
    )
      return;

    this.camera.update();
    this.renderer.update();
    this.statsMonitor.update();
    this.floor.update();
    this.tiles.update();
    this.mouse.update();
    this.canvas2D.update();
  }

  destroy() {
    if (
      !this.camera ||
      !this.renderer ||
      !this.floor ||
      !this.tiles ||
      !this.debug ||
      !this.mouse ||
      !this.canvas2D
    ) {
      return;
    }

    this.camera.destroy();
    this.renderer.destroy();
    this.time.destroy();
    this.floor.destroy();
    this.tiles.destroy();
    this.debug.destroy();
    this.mouse.destroy();
    this.canvas2D.destroy();

    this.instance = null;
    this.scene = null;
  }
}
