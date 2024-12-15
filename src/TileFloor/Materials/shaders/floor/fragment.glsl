uniform vec3 uColor;
uniform vec3 uHighlightColor;
uniform vec2 uSize;
uniform float uHighlightRadius;
uniform float uIntensity;
uniform vec3 uMousePosition;
uniform sampler2D uMouseTexture;

varying vec2 vUv;

float sdCircle( vec2 p, float r )
{
    return length(p) - r;
}

void main () {

  vec3 color = uColor;
  vec2 uv = vUv;
  uv.y  = 1.0 - uv.y;

  float mouseTrail = texture(uMouseTexture, uv).r;
  mouseTrail = smoothstep(0.1, 1.0, mouseTrail);

  float dist = distance(vUv, vec2(-uMousePosition.x / uSize.x + 0.5, uMousePosition.z / uSize.y + 0.5));
  dist = 1.0 - smoothstep(0.0, uHighlightRadius, dist);
  
  color = mix(color, uHighlightColor * uIntensity, mouseTrail);

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}