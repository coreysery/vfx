
attribute vec2 a_position;
uniform vec2 u_resolution;

attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
  // convert postion from pixels to be 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert to be 0.0 to 2.0
  vec2 zeroToTwo = zeroToOne * 2.0;

  // shift to clip space
  vec2 clipSpace = zeroToOne - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  // pass attribute texCoord to varying, which makes it accessible in the fragment shader
  // the gpu will interpolate values between points
  v_texCoord = a_texCoord;
}