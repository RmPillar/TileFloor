import * as THREE from "three";
import {
  SelectiveBloomEffect,
  GodRaysEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from "postprocessing";

import Experience from "./Experience";

export default class Renderer {
  constructor() {
    this.experience = new Experience();
    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.debug = this.experience.debug;
    this.floor = this.experience.floor;

    this.setInstance();
    this.setPostProccessing();
    // this.setDebug();
  }

  setInstance() {
    if (!this.canvas || !this.sizes) {
      return;
    }

    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false,
    });
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
    this.instance.setClearColor(0x000000);
    this.instance.fog = this.scene.fog;
  }

  setPostProccessing() {
    if (!this.instance || !this.scene || !this.camera?.instance) return;

    this.composer = new EffectComposer(this.instance);
    this.composer.addPass(new RenderPass(this.scene, this.camera.instance));

    this.setBloom();
    this.setGodRays();
  }

  setBloom() {
    if (
      !this.scene ||
      !this.camera?.instance ||
      !this.floor?.floor ||
      !this.composer
    )
      return;

    this.bloomParams = {
      mipmapBlur: true,
      intensity: 2.0,
    };

    this.bloomEffect = new SelectiveBloomEffect(
      this.scene,
      this.camera.instance,
      this.bloomParams
    );

    this.bloomEffect.luminancePass.enabled = false;

    this.bloomEffect.selection.add(this.floor.floor);

    this.bloomPass = new EffectPass(this.camera.instance, this.bloomEffect);
    this.composer.addPass(this.bloomPass);
  }

  setGodRays() {
    if (!this.camera?.instance || !this.floor?.floor) return;

    this.godRaysParams = {
      decay: 0.8,
      samples: 200,
    };

    this.godRaysEffect = new GodRaysEffect(
      this.camera.instance,
      this.floor.floor,
      this.godRaysParams
    );

    this.godRaysPass = new EffectPass(this.camera.instance, this.godRaysEffect);
    this.composer.addPass(this.godRaysPass);
  }

  setDebug() {
    if (!this.debug?.gui || !this.godRaysEffect || !this.bloomEffect) {
      return;
    }

    const bloomFolder = this.debug.gui.addFolder({
      title: "Bloom",
    });

    bloomFolder.addBinding(this.bloomEffect, "intensity", {
      min: 0,
      max: 20,
      step: 0.01,
    });
    bloomFolder.addBinding(this.bloomEffect.mipmapBlurPass, "radius", {
      min: 0,
      max: 1,
      step: 1e-3,
    });
    bloomFolder.addBinding(this.bloomEffect.mipmapBlurPass, "levels", {
      min: 1,
      max: 9,
      step: 1,
    });

    const godRaysFolder = this.debug.gui.addFolder({
      title: "God Rays",
    });

    // godRaysFolder
    //   .addBinding(this.godRaysParams, "decay", {
    //     min: 0,
    //     max: 1,
    //     step: 0.01,
    //   })
    //   .on("change", (e) => {
    //     // this.godRaysPass.dispose();
    //     // this.godRaysEffect.dispose();

    //     // this.godRaysEffect = null;
    //     // this.godRaysPass = null;

    //     // this.setGodRays();

    //   });

    godRaysFolder.addBinding(this.godRaysEffect, "samples", {
      min: 0,
      max: 500,
      step: 10,
    });
  }

  resize() {
    if (!this.instance || !this.sizes) {
      return;
    }

    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
  }

  update() {
    if (!this.composer) {
      return;
    }

    this.composer.render();
  }

  destroy() {
    if (
      !this.instance ||
      !this.composer ||
      !this.godRaysEffect ||
      this.bloomEffect
    ) {
      return;
    }

    this.instance.dispose();
    this.composer.dispose();
    this.godRaysEffect.dispose();
    this.bloomEffect.dispose();

    this.instance = null;
    this.composer = null;
    this.godRaysEffect = null;
    this.bloomEffect = null;
  }
}
