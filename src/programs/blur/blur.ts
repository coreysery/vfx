import vertexShaderSrc from './vertex-shader.glsl';
import fragmentShaderSrc from './fragment-shader.glsl';
import { createShader, createProgram, setRectangle, initCanvasSize } from '../util';

export const blurInit = (gl: WebGLRenderingContext) => {
  // make shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
  const program = createProgram(gl, [vertexShader, fragmentShader]);

  // Get Locations
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
  const textureSizeLocation = gl.getUniformLocation(program, 'u_textureSize');

  // create buffer for attribute to get data from
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRectangle(gl, 0, 0, gl.canvas.width * 2, gl.canvas.height * 2);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  setRectangle(gl, 0.0, 0.0, 1.0, 1.0);

  // create texture
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  /**
   * Rendering
   */
  initCanvasSize(gl);
  gl.useProgram(program);

  // tell attribute how to get data from position buffer
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
 
  // tell texCoord attribute how get data and enable
  gl.enableVertexAttribArray(texCoordLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  // pass canvas size to resolution uniform
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  // gl.uniform2f(textureSizeLocation, image.width, image.height);
  gl.uniform2f(textureSizeLocation, gl.canvas.width, gl.canvas.height);


  return (image: ImageData) => {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    window.requestAnimationFrame(() => {
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });
  };

}