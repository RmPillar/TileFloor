import * as THREE from "three";
import gsap from "gsap";

import Experience from "./Experience";
import TileMaterial from "./Materials/TileMaterial";

export default class Tiles {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.time = this.experience.time;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;
    this.mouse = this.experience.mouse;
    this.canvas2D = this.experience.canvas2D;

    this.rows = 150;
    this.cols = 150;
    this.count = this.rows * this.cols;

    this.displacementHeight = {
      current: 0,
      max: 0.5,
    };

    this.mousePosition = new THREE.Vector3();

    this.init();
  }

  init() {
    this.addTiles();
    this.addEventListeners();
    this.addDebug();
  }

  addTiles() {
    // Clone the original tile geometry
    this.tileGeometry =
      this.resources.items.tile.scene.children[0].geometry.clone();
    this.tileGeometry.scale(0.1, 0.1, 0.1);

    const geometryBoundingBox = {
      x:
        this.tileGeometry.boundingBox.max.x -
        this.tileGeometry.boundingBox.min.x,
      y:
        this.tileGeometry.boundingBox.max.y -
        this.tileGeometry.boundingBox.min.y,
      z:
        this.tileGeometry.boundingBox.max.z -
        this.tileGeometry.boundingBox.min.z,
    };

    const gutter = 0.01;

    // Create custom material that extends MeshPhongMaterial
    this.tileMaterial = TileMaterial({
      displacementHeight: this.displacementHeight,
      mousePosition: this.mouse.mousePos,
      displacementTexture: this.canvas2D.texture,
    });

    // Create instanced mesh
    this.instancedTileMesh = new THREE.InstancedMesh(
      this.tileGeometry,
      this.tileMaterial,
      this.count
    );

    const hexWidth = geometryBoundingBox.x + gutter;
    const hexHeight = geometryBoundingBox.z * 0.75 + gutter;

    // Prepare instancing attributes
    this.tilePositions = new Float32Array(this.count * 3);
    this.tileRandoms = new Float32Array(this.count);
    this.tileSpeeds = new Float32Array(this.count);

    for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
      for (let colIndex = 0; colIndex < this.cols; colIndex++) {
        const currentIndex = rowIndex * this.cols + colIndex;

        const xOffset =
          rowIndex % 2 === 0 ? geometryBoundingBox.x / 2 + gutter / 2 : 0;

        const x = colIndex * hexWidth + xOffset - (this.cols * hexWidth) / 2;
        const y = Math.random() * 0.02 - 0.04;
        const z = rowIndex * hexHeight - (this.rows * hexHeight) / 2;

        this.tilePositions[currentIndex * 3] = x;
        this.tilePositions[currentIndex * 3 + 1] = y;
        this.tilePositions[currentIndex * 3 + 2] = z;

        this.tileRandoms[currentIndex] = Math.random() * 2 - 1;
        this.tileSpeeds[currentIndex] = (Math.random() * 2 - 1) * 0.5;

        const matrix = new THREE.Matrix4();
        matrix.setPosition(x, y, z);
        this.instancedTileMesh.setMatrixAt(currentIndex, matrix);
      }
    }

    // Add custom attributes to geometry
    this.tileGeometry.setAttribute(
      "aPosition",
      new THREE.InstancedBufferAttribute(this.tilePositions, 3)
    );

    this.tileGeometry.setAttribute(
      "aRandom",
      new THREE.InstancedBufferAttribute(this.tileRandoms, 1)
    );

    this.tileGeometry.setAttribute(
      "aSpeed",
      new THREE.InstancedBufferAttribute(this.tileSpeeds, 1)
    );

    this.instancedTileMesh.instanceMatrix.needsUpdate = true;
    this.instancedTileMesh.computeBoundingBox();

    this.calculateTilesBoundingBox();

    this.scene.add(this.instancedTileMesh);
  }

  calculateTilesBoundingBox() {
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;

    for (let i = 0; i < this.count; i++) {
      const x = this.tilePositions[i * 3];
      const y = this.tilePositions[i * 3 + 1];
      const z = this.tilePositions[i * 3 + 2];

      const halfWidth =
        (this.tileGeometry.boundingBox.max.x -
          this.tileGeometry.boundingBox.min.x) /
        2;
      const halfHeight =
        (this.tileGeometry.boundingBox.max.y -
          this.tileGeometry.boundingBox.min.y) /
        2;
      const halfDepth =
        (this.tileGeometry.boundingBox.max.z -
          this.tileGeometry.boundingBox.min.z) /
        2;

      minX = Math.min(minX, x - halfWidth);
      maxX = Math.max(maxX, x + halfWidth);
      minY = Math.min(minY, y - halfHeight);
      maxY = Math.max(maxY, y + halfHeight);
      minZ = Math.min(minZ, z - halfDepth);
      maxZ = Math.max(maxZ, z + halfDepth);
    }

    this.bounds = {
      x: maxX - minX,
      y: maxY - minY,
      z: maxZ - minZ,
      min: new THREE.Vector3(minX, minY, minZ),
      max: new THREE.Vector3(maxX, maxY, maxZ),
    };
  }

  addEventListeners() {
    this.handlePointerEnter = this.handlePointerEnter.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);

    this.mouse.on("mouseEnter", this.handlePointerEnter);
    this.mouse.on("mouseLeave", this.handlePointerLeave);
  }

  handlePointerEnter(event) {
    gsap.timeline().to(this.displacementHeight, {
      current: this.displacementHeight.max,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        if (!this.tileMaterial?.userData?.shader) return;
        this.tileMaterial.userData.shader.uniforms.uDisplacementHeight.value =
          this.displacementHeight.current;
      },
    });
  }

  handlePointerLeave(event) {
    gsap.timeline().to(this.displacementHeight, {
      current: 0,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        if (!this.tileMaterial?.userData?.shader) return;

        this.tileMaterial.userData.shader.uniforms.uDisplacementHeight.value =
          this.displacementHeight.current;
      },
    });
  }

  addDebug() {
    if (!this.debug?.gui) return;

    const tileFolder = this.debug.gui.addFolder({
      title: "Tile",
    });

    tileFolder.addBinding(this.tileMaterial, "shininess", {
      label: "Shininess",
      min: 0,
      max: 100,
    });

    tileFolder.addBinding(this.tileMaterial, "specular", {
      label: "Specular",
      color: { type: "float" },
    });

    tileFolder.addBinding(this.tileMaterial, "color", {
      label: "Colour",
      color: { type: "float" },
    });

    tileFolder
      .addBinding(this.displacementHeight, "max", {
        min: -1,
        max: 1,
        label: "Displacement Height",
      })
      .on("change", (e) => {
        if (!this.tileMaterial.userData.shader) return;

        this.displacementHeight.current = e.value;
        this.tileMaterial.userData.shader.uniforms.uDisplacementHeight.value =
          e.value;
      });
  }

  update() {
    if (
      !this.mouse ||
      !this.camera?.instance ||
      !this.time ||
      !this.tileMaterial?.userData?.shader ||
      !this.canvas2D?.texture ||
      !this.bounds
    )
      return;

    this.tileMaterial.userData.shader.uniforms.uBounds.value =
      this.bounds.x / 2;

    // Update mouse position
    if (this.mouse.needsUpdate) {
      this.mousePosition.copy(this.mouse.mousePos);

      this.tileMaterial.userData.shader.uniforms.uMousePosition.value =
        this.mousePosition;
    }

    this.tileMaterial.userData.shader.uniforms.uTime.value =
      this.time.elapsed / 1000;

    this.tileMaterial.userData.shader.uniforms.uDisplacementTexture.value =
      this.canvas2D.texture;
  }

  destroy() {
    if (
      !this.scene ||
      !this.instancedTileMesh ||
      !this.tileGeometry ||
      !this.tileMaterial
    )
      return;

    this.scene.remove(this.instancedTileMesh);
    this.tileGeometry.dispose();
    this.tileMaterial.dispose();

    this.instancedTileMesh = null;
    this.tileGeometry = null;
    this.tileMaterial = null;
  }
}
