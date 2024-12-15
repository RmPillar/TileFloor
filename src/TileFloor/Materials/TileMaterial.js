import * as THREE from "three";

export default function TileMaterial({
  mousePosition,
  displacementHeight,
  displacementTexture,
}) {
  const material = new THREE.MeshPhongMaterial({
    color: 0x121013,
    shininess: 20,
    specular: 0x222222,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uMousePosition = new THREE.Uniform(mousePosition);
    shader.uniforms.uDisplacementHeight = new THREE.Uniform(
      displacementHeight.current
    );
    shader.uniforms.uDisplacementTexture = new THREE.Uniform(
      displacementTexture
    );
    shader.uniforms.uBounds = new THREE.Uniform(0);
    shader.uniforms.uTime = new THREE.Uniform(0);

    shader.vertexShader = `
      uniform vec3 uMousePosition;
      uniform float uDisplacementHeight;
      uniform float uBounds;
      uniform sampler2D uDisplacementTexture;
      uniform float uTime;

      attribute vec3 aPosition;
      attribute float aRandom;
      attribute float aSpeed;

      ${shader.vertexShader}
    `.replace(
      "#include <begin_vertex>",
      `
      #include <begin_vertex>

      vec2 normalizedPos = vec2(1.0) - (aPosition.xz + vec2(uBounds)) / (uBounds * 2.0);

      float mouseTrail = texture(uDisplacementTexture, normalizedPos).r;
      mouseTrail = smoothstep(0.1, 1.0, mouseTrail);
      float displacement = mouseTrail * uDisplacementHeight;
      
      // Add vertical displacement and subtle animation
      transformed.y += displacement;
      transformed.y += sin(uTime * aSpeed) * 0.05 * aRandom;
      `
    );

    material.userData.shader = shader;
  };

  return material;
}
