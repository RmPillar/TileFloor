import * as THREE from "three";
import gsap from "gsap";
import Experience from "./Experience";

import FloorMaterial from "./Materials/FloorMaterial";

export default class Floor {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.time = this.experience.time;
    this.debug = this.experience.debug;
    this.mouse = this.experience.mouse;
    this.canvas2D = this.experience.canvas2D;
    this.tiles = this.experience.tiles;

    this.floorHighlightRadius = {
      current: 0,
      last: 0,
      max: 0.05,
    };

    this.init();
  }

  init() {
    this.addFloor();
    this.addEventListeners();
    this.addDebug();
  }

  addFloor() {
    this.floorSize = new THREE.Vector2(
      this.tiles.bounds.x,
      this.tiles.bounds.z
    );

    // this.floorSize = new THREE.Vector2(15, 15);

    this.floorGeometry = new THREE.PlaneGeometry(
      this.floorSize.x,
      this.floorSize.y
    );
    this.floorMaterial = FloorMaterial();
    this.floorMaterial.uniforms.uSize.value = this.floorSize;

    this.floor = new THREE.Mesh(this.floorGeometry, this.floorMaterial);

    this.floor.position.set(0, -0.1, 0);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.rotation.z = Math.PI;

    this.scene.add(this.floor);

    this.mouse.intersectObjects.push(this.floor);
  }

  addEventListeners() {
    this.handlePointerEnter = this.handlePointerEnter.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);

    this.mouse.on("mouseEnter", this.handlePointerEnter);
    this.mouse.on("mouseLeave", this.handlePointerLeave);
  }

  handlePointerEnter(event) {
    gsap.to(this.floorHighlightRadius, {
      current: this.floorHighlightRadius.max,
      duration: 1,
      ease: "power2.out",
    });
  }

  handlePointerLeave(event) {
    gsap.to(this.floorHighlightRadius, {
      current: 0,
      duration: 1,
      ease: "power2.out",
    });
  }

  addDebug() {
    if (!this.debug?.gui) {
      return;
    }

    const floorFolder = this.debug.gui.addFolder({
      title: "Floor",
    });

    floorFolder.addBinding(this.floorMaterial.uniforms.uColor, "value", {
      label: "Colour",
      color: { type: "float" },
    });

    floorFolder.addBinding(
      this.floorMaterial.uniforms.uHighlightColor,
      "value",
      {
        label: "Highlight Colour",
        color: { type: "float" },
      }
    );

    floorFolder.addBinding(this.floorHighlightRadius, "max", {
      label: "Highlight Radius",
      min: 0,
      max: 0.2,
    });
  }

  update() {
    if (
      !this.mouse ||
      !this.camera?.instance ||
      !this.time ||
      !this.mouse ||
      !this.scene ||
      !this.floor ||
      !this.canvas2D?.texture
    )
      return;

    if (this.mouse.needsUpdate) {
      this.floorMaterial.uniforms.uMousePosition.value = this.mouse.mousePos;
    }

    this.floorMaterial.uniforms.uMouseTexture.value = this.canvas2D.texture;

    if (this.floorHighlightRadius.current !== this.floorHighlightRadius.last) {
      this.floorMaterial.uniforms.uHighlightRadius.value =
        this.floorHighlightRadius.current;
      this.floorHighlightRadius.last = this.floorHighlightRadius.current;
    }
  }

  destroy() {
    if (
      !this.scene ||
      !this.floor ||
      !this.floorGeometry ||
      !this.floorMaterial
    )
      return;

    this.scene.remove(this.floor);
    this.floorGeometry.dispose();
    this.floorMaterial.dispose();

    this.floor = null;
    this.floorGeometry = null;
    this.floorMaterial = null;
  }
}
