
precision mediump float;

// texture
uniform sampler2D u_image;
uniform vec2 u_textureSize;

// texCords passed from vertex shader
varying vec2 v_texCoord;

void main() {

  vec2 onePixel = 5.0 * vec2(1.0, 1.0) / u_textureSize;

  // Look up a color from the texture.
  // gl_FragColor = texture2D(u_image, v_texCoord);

  gl_FragColor = (
    texture2D(u_image, v_texCoord)
    + texture2D(u_image, v_texCoord + vec2(onePixel.x, 0.0))
    + texture2D(u_image, v_texCoord + vec2(-onePixel.x, 0.0))
  ) / 3.0;
}