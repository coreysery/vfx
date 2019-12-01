import vertexShaderSrc from './vertex-shader.glsl';
import fragmentShaderSrc from './fragment-shader.glsl';

const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
  const shader = gl.createShader(type);
  if (shader) {
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
  }

  gl.deleteShader(shader);
}

const createProgram = (gl: WebGLRenderingContext, shaders: WebGLShader[]): WebGLProgram => {
  const program = gl.createProgram();
  if (program) {
    shaders.forEach(shader => gl.attachShader(program, shader));
    gl.linkProgram(program);
    const okay = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (okay) {
      return program;
    }
  }
  gl.deleteProgram(program);
}

const setRectangle = (gl, x, y, width, height) => {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}

export const blurInit = (gl: WebGLRenderingContext) => {
  // make shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);

  const program = createProgram(gl, [vertexShader, fragmentShader]);

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
  const textureSizeLocation = gl.getUniformLocation(program, 'u_textureSize');

  // create buffer for attribute to get data from
  const positionBuffer = gl.createBuffer();

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

  return (image: ImageData) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setRectangle(gl, 0, 0, image.width * 2, image.height * 2);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Fit to view
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // gl.viewport(0, 0, image.width, image.height);

    // clear view
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // tell attribute how to get data from position buffer
    {
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    }

    {
      gl.enableVertexAttribArray(texCoordLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    }

    // pass canvas size to resolution uniform
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform2f(textureSizeLocation, image.width, image.height);

    window.requestAnimationFrame(() => {
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });

  };

}