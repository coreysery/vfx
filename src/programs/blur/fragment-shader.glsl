
precision mediump float;

// texture
uniform sampler2D u_image;

// texCords passed from vertex shader
varying vec2 v_texCoord;

void main() {
  // Look up a color from the texture.
  gl_FragColor = texture2D(u_image, v_texCoord);
}