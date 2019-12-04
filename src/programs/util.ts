
export const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
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

export const createProgram = (gl: WebGLRenderingContext, shaders: WebGLShader[]): WebGLProgram => {
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

export const setRectangle = (gl, x, y, width, height) => {
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

export const initCanvasSize = (gl: WebGLRenderingContext) => {
  // Fit to view
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // clear view
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}