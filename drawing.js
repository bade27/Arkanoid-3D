var programs = new Array();
var gl;
var baseDir;
var shaderDir;
var modelsDir;
var models = new Array();

var dirLightAlpha;
var dirLightBeta;
var directionalLight;
var directionalLightColor;

var cubeMaterialColor;
var lastUpdateTime;

var modelsNormalMatrix = new Array(), modelsWorldMatrix = new Array();
var positionAttributeLocation = new Array(), normalAttributeLocation = new Array();  
var matrixLocation = new Array(), materialDiffColorHandle = new Array();
var lightDirectionHandle = new Array(), lightColorHandle = new Array();
var normalMatrixPositionHandle = new Array(), vertexMatrixPositionHandle = new Array();
var materialDiffColorHandle = new Array();
var vaos = new Array();
  
var xBar;
var yBar;
var zBar;

var limitLeft = -4.5;
var limitRight = 4.5;

var perspectiveMatrix;
var viewMatrix;
var modelVertices;
var modelNormals;
var modelIndices;

function main() {

  //directional light
  dirLightAlpha = utils.degToRad(180);
  dirLightBeta  = utils.degToRad(100);
  directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
              Math.sin(dirLightAlpha), Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)];
  directionalLightColor = [0.1, 1.0, 1.0];
  //material color
  cubeMaterialColor = [0.5, 0.5, 0.5];
  lastUpdateTime = (new Date).getTime();

  modelsNormalMatrix = new Array(), modelsWorldMatrix = new Array();
  positionAttributeLocation = new Array(), normalAttributeLocation = new Array();  
  matrixLocation = new Array(), materialDiffColorHandle = new Array();
  lightDirectionHandle = new Array(), lightColorHandle = new Array();
  normalMatrixPositionHandle = new Array(), vertexMatrixPositionHandle = new Array();
  materialDiffColorHandle = new Array();
  vaos = new Array();
  
  xBar = 0.5;
  yBar = 0.0;
  zBar = -4.5;
  modelsWorldMatrix[0] = utils.MakeWorld(xBar, yBar, zBar, 0.0, 0.0, 0.0, 1.0);
  modelsWorldMatrix[1] = utils.MakeWorld( 0.0, -1.0, zBar-10.2, 0.0, 0.0, 0.0, 1.0);

  modelsNormalMatrix[0] = utils.invertMatrix(utils.transposeMatrix(modelsWorldMatrix[0]));

  //SET Global states (viewport size, viewport background color, Depth test)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.85, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  //Lambert
  positionAttributeLocation[0] = gl.getAttribLocation(programs[0], "inPosition");  
  normalAttributeLocation[0] = gl.getAttribLocation(programs[0], "inNormal");  
  matrixLocation[0] = gl.getUniformLocation(programs[0], "matrix");
  materialDiffColorHandle[0] = gl.getUniformLocation(programs[0], 'mDiffColor');
  lightDirectionHandle[0] = gl.getUniformLocation(programs[0], 'lightDirection');
  lightColorHandle[0] = gl.getUniformLocation(programs[0], 'lightColor');
  normalMatrixPositionHandle[0] = gl.getUniformLocation(programs[0], 'nMatrix');

  //Colour by position
  positionAttributeLocation[1] = gl.getAttribLocation(programs[1], "inPosition");  
  matrixLocation[1] = gl.getUniformLocation(programs[1], "matrix");

  //Unlit
  positionAttributeLocation[2] = gl.getAttribLocation(programs[2], "inPosition");  
  matrixLocation[2] = gl.getUniformLocation(programs[2], "matrix");
  
  // persepctive and view
  perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
  viewMatrix = utils.MakeView(0.0, 2.0, 0.0, -5.0, 0.0);
  
  //------------------------------------------------------------------------------------------------
  // OBJECTS DEFINITION
  //------------------------------------------------------------------------------------------------
  modelVertices = new Array();
  modelNormals = new Array();
  modelIndices = new Array();
  
  // bar
  modelVertices[0] = models[0].vertices;
  modelNormals[0] = models[0].vertexNormals;
  modelIndices[0] = models[0].indices;

  vaos[0] = gl.createVertexArray();

  gl.bindVertexArray(vaos[0]);
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelVertices[0]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation[0]);
  gl.vertexAttribPointer(positionAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelNormals[0]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalAttributeLocation[0]);
  gl.vertexAttribPointer(normalAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);


  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelIndices[0]), gl.STATIC_DRAW);
  
  
  // base
  modelVertices[1] = models[1].vertices;
  modelNormals[1] = models[1].vertexNormals;
  modelIndices[1] = models[1].indices;

  vaos[1] = gl.createVertexArray();

  gl.bindVertexArray(vaos[1]);
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelVertices[1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation[1]);
  gl.vertexAttribPointer(positionAttributeLocation[1], 3, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelIndices[1]), gl.STATIC_DRAW);


  // ball
  
  //---------------------------------------------------------------------------------------------
  drawScene();
}

function animate(){
}

function drawScene() {
  animate();

  gl.clearColor(0.85, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  // bar
  gl.useProgram(programs[0]);
  modelsWorldMatrix[0] = utils.MakeWorld(xBar, yBar, zBar, 0.0, 0.0, 0.0, 1.0);
  var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, modelsWorldMatrix[0]);
  var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
  gl.uniformMatrix4fv(matrixLocation[0], gl.FALSE, utils.transposeMatrix(projectionMatrix));

  gl.uniformMatrix4fv(vertexMatrixPositionHandle[0], gl.FALSE, utils.transposeMatrix(modelsWorldMatrix[0]));
  gl.uniformMatrix4fv(normalMatrixPositionHandle[0], gl.FALSE, utils.transposeMatrix(modelsNormalMatrix[0]));

  gl.uniform3fv(materialDiffColorHandle[0], cubeMaterialColor);
  gl.uniform3fv(lightColorHandle[0],  directionalLightColor);
  gl.uniform3fv(lightDirectionHandle[0],  directionalLight);

  gl.bindVertexArray(vaos[0]);
  gl.drawElements(gl.TRIANGLES, modelIndices[0].length, gl.UNSIGNED_SHORT, 0 );


  // base
  gl.useProgram(programs[2]);
  viewWorldMatrix = utils.multiplyMatrices(viewMatrix, modelsWorldMatrix[1]);
  projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
  gl.uniformMatrix4fv(matrixLocation[2], gl.FALSE, utils.transposeMatrix(projectionMatrix));

  gl.bindVertexArray(vaos[1]);
  gl.drawElements(gl.TRIANGLES, modelIndices[1].length, gl.UNSIGNED_SHORT, 0 );
  

  // drawScene
  //window.requestAnimationFrame(drawScene);
}

async function init(){
    var path = window.location.pathname;
    var page = path.split("/").pop();
    baseDir = window.location.href.replace(page, '');
    shaderDir = baseDir+"shaders/"; 
    modelsDir = baseDir+"models/";
    
  var canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("GL context not opened");
    return;
  }
  utils.resizeCanvasToDisplaySize(gl.canvas);
    
  //MultipleShaders
  await utils.loadFiles([shaderDir + 'vs_lamb.glsl', shaderDir + 'fs_lamb.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

    programs[0] = utils.createProgram(gl, vertexShader, fragmentShader);
  });
    
  await utils.loadFiles([shaderDir + 'vs_pos.glsl', shaderDir + 'fs_pos.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

    programs[1] = utils.createProgram(gl, vertexShader, fragmentShader);
  });
    
    await utils.loadFiles([shaderDir + 'vs_unlit.glsl', shaderDir + 'fs_unlit.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

    programs[2] = utils.createProgram(gl, vertexShader, fragmentShader);
  });

  //Multiple objects
  var barStr = await utils.get_objstr(modelsDir+"bar.obj");
  models[0] = new OBJ.Mesh(barStr);
  
  var baseStr = await utils.get_objstr(modelsDir+"base.obj");
  models[1] = new OBJ.Mesh(baseStr);

  main();
}

window.addEventListener("keydown", function keyFunction(e){
 
  if (e.key == "ArrowLeft") {
    if (xBar > limitLeft) {
      xBar-=0.5;
    }
  }
  if (e.key == "ArrowRight") {  // Right arrow
    if (xBar < limitRight) {
      xBar+=0.5;
    }
  } 

  //If you put it here instead, you will redraw the cube only when the camera has been moved
  window.requestAnimationFrame(drawScene);
});
window.onload = init;