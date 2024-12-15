import * as THREE from "three";

import vertexShader from "./shaders/floor/vertex.glsl";
import fragmentShader from "./shaders/floor/fragment.glsl";

export default function TileMaterial() {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: new THREE.Uniform(new THREE.Color(0x121013)),
      uHighlightColor: new THREE.Uniform(new THREE.Color(0x4338ca)),
      uHighlightRadius: new THREE.Uniform(0),
      uIntensity: new THREE.Uniform(20),
      uSize: new THREE.Uniform(new THREE.Vector3()),
      uMousePosition: new THREE.Uniform(new THREE.Vector3()),
      uMouseTexture: new THREE.Uniform(),
    },
    vertexShader,
    fragmentShader,
  });

  return material;
}
