import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Experience from "./Experience";

export default class Camera {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;
    this.renderer = this.experience.renderer;

    this.setInstance();
    this.setControls();

    console.log(
      this.getVisibleWidthAtZDepth(-2),
      this.getVisibleHeightAtZDepth(-2)
    );
  }

  setInstance() {
    if (!this.scene || !this.sizes) {
      return;
    }

    this.instance = new THREE.PerspectiveCamera(
      70,
      this.sizes.width / this.sizes.height,
      0.01,
      20
    );
    this.instance.position.set(1, 2, -2);
    this.instance.lookAt(new THREE.Vector3(0, 0, 0));

    this.scene.add(this.instance);
  }

  setControls() {
    if (!this.instance || !this.canvas) {
      return;
    }

    this.controls = new OrbitControls(this.instance, this.canvas);

    this.controls.enableDamping = true;
    this.controls.enablePan = false;

    this.controls.maxDistance = 5;
    this.controls.maxPolarAngle = Math.PI / 2 - Math.PI / 8;
  }

  getVisibleHeightAtZDepth(depth) {
    const vFOV = (this.instance.fov * Math.PI) / 180;

    return 2 * Math.abs(depth) * Math.tan(vFOV / 2);
  }

  getVisibleWidthAtZDepth(depth) {
    const height = this.getVisibleHeightAtZDepth(depth, this.instance);
    return height * this.instance.aspect;
  }

  getViewportDimensionsAtZDepth(depth) {
    return {
      height: this.getVisibleHeightAtZDepth(depth),
      width: this.getVisibleWidthAtZDepth(depth),
    };
  }

  resize() {
    if (!this.sizes || !this.instance) {
      return;
    }

    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    if (!this.controls) {
      return;
    }

    this.controls.update();
  }

  destroy() {
    this.scene.remove(this.instance);

    this.instance = null;
  }
}
