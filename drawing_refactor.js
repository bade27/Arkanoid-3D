var programs = new Array();
var gl;
var baseDir;
var shaderDir;
var modelsDir;

// light
var dirLightAlpha;
var dirLightBeta;
var directionalLight;
var directionalLightColor;

// time
var lastUpdateTime = (new Date).getTime();

// normal matrices
var paddleNormalMatrix;

// world matrices
var baseWorldMatrix;
var paddleWorldMatrix;

// game status
var stop = true;

var up = [0.0,1.0,0.0];


var positionAttributeLocation = new Array();
var matrixLocation = new Array();
var lightDirectionHandle = new Array(), lightColorHandle = new Array();
var normalMatrixPositionHandle = new Array(), vertexMatrixPositionHandle = new Array();
var baseColorLocation;
var paddleColorLocation;

// paddle coordinates
var originalPaddlePos = [0.0, 1.0, -4.5];
var xPaddle = originalPaddlePos[0];
var yPaddle = originalPaddlePos[1];
var zPaddle = originalPaddlePos[2];
var limitLeft = -5.7;
var limitRight = 5.7;
var xContr = xPaddle;
var paddleCenter = originalPaddlePos;

// Ball coordinates and status
var originalBallPos = [0, 0.5, zPaddle-1.5];
var direction = [0.0,0.0,-1.0];
var dirDescription = [1, 0, 0, 0]; //up,down, left,right
var xBall = originalBallPos[0];
var yBall = originalBallPos[1];
var zBall = originalBallPos[2];
var ballCenter = originalBallPos;

// persepctive and view
var perspectiveMatrix;
var viewMatrix;

// models
var paddleModel;
var paddleVertices;
var paddleNormals;
var paddleIndices;

var baseModel;
var baseVertices;
var baseNormals;
var baseIndices;

var ballModel;
var ballVertices;
var ballNormals;
var ballIndices;

var obstaclesModels = new Array();
var obstaclesVertices = new Array();
var obstaclesNormals = new Array();
var obstaclesIndices = new Array();


// colors
var paddleColor;
var baseColor;


// vaos
var paddleVAO;
var baseVAO;
var ballVAO;
var obstaclesVAO;

function main() {

  //directional light
  dirLightAlpha = utils.degToRad(180);
  dirLightBeta  = utils.degToRad(100);
  directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
              Math.sin(dirLightAlpha), Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)];
  directionalLightColor = [0.1, 1.0, 1.0];

  //material color
  paddleColor = [1.0, 0.0, 0.0];
  baseColor = [0.0, 0.5, 0.0];
  ballColor = [0.0, 0.0, 1.0];

  paddleWorldMatrix = utils.MakeWorld(xPaddle, yPaddle, zPaddle, 0.0, 0.0, 0.0, 1.0);
  baseWorldMatrix = utils.MakeWorld(0.0, 0.0, -15, 0.0, 0.0, 0.0, 1.0);
  ballWorldMatrix = utils.MakeWorld(xBall, yBall, zBall, 0.0, 0.0, 0.0, 1.0);

  //SET Global states (viewport size, viewport background color, Depth test)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.85, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  //Unlit
  positionAttributeLocation[2] = gl.getAttribLocation(programs[2], "inPosition");
  matrixLocation[2] = gl.getUniformLocation(programs[2], "matrix");
  paddleColorLocation = gl.getUniformLocation(programs[2], "u_color");
  baseColorLocation = gl.getUniformLocation(programs[2], "u_color");
  ballColorLocation = gl.getUniformLocation(programs[2], "u_color");

  // persepctive and view
  perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
  viewMatrix = utils.MakeView(0.0, 5.0, 0.0, -5.0, 0.0);

  //------------------------------------------------------------------------------------------------
  // OBJECTS DEFINITION
  //------------------------------------------------------------------------------------------------

  // base
  baseVertices = baseModel.vertices;
  baseNormals = baseModel.vertexNormals;
  baseIndices = baseModel.indices;

  baseVAO = gl.createVertexArray();

  gl.bindVertexArray(baseVAO);
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(baseVertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation[2]);
  gl.vertexAttribPointer(positionAttributeLocation[2], 3, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(baseIndices), gl.STATIC_DRAW);


  // ball
  ballVertices = ballModel.vertices;
  ballNormals = ballModel.vertexNormals;
  ballIndices = ballModel.indices;

  ballVAO = gl.createVertexArray();

  gl.bindVertexArray(ballVAO);
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ballVertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation[2]);
  gl.vertexAttribPointer(positionAttributeLocation[2], 3, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ballIndices), gl.STATIC_DRAW);


  // paddle
  paddleVertices = paddleModel.vertices;
  paddleNormals = paddleModel.vertexNormals;
  paddleIndices = paddleModel.indices;

  paddleVAO = gl.createVertexArray();

  gl.bindVertexArray(paddleVAO);
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(paddleVertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation[2]);
  gl.vertexAttribPointer(positionAttributeLocation[2], 3, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(paddleIndices), gl.STATIC_DRAW);

  //---------------------------------------------------------------------------------------------
  drawScene();
}

function animate(){
  if (!stop) {
    // collision with the walls
    if (zBall < -25+0.5) { // collision with up wall
      if (dirDescription[0] == 1 && dirDescription[1] == 0 && dirDescription[2] == 0 && dirDescription[3] == 0) { // perpendicular collision
        direction = [0.0,0.0,1.0];
        dirDescription = [0,1,0,0];
      } else if (dirDescription[0] == 1 && dirDescription[1] == 0 && dirDescription[2] == 0 && dirDescription[3] == 1){
        up = [0.0,-1.0,0.0];
        direction = myutils.normalize3Vector(myutils.crossProduct(up, direction));
        dirDescription = [0,1,0,1];
      } else if (dirDescription[0] == 1 && dirDescription[1] == 0 && dirDescription[2] == 1 && dirDescription[3] == 0){
        up = [0.0,1.0,0.0]
        direction = myutils.normalize3Vector(myutils.crossProduct(up, direction));
        dirDescription = [0,1,1,0];
      }
      // console.log(dirDescription);
    } else if (xBall < limitLeft-0.5) { // collision with left wall
      console.log(dirDescription);
      if (dirDescription[0] == 0 && dirDescription[1] == 0 && dirDescription[2] == 1 && dirDescription[3] == 0) { // perpendicular collision
        direction = [1.0,0.0,0.0];
        dirDescription = [0,0,0,1];
      } else if (dirDescription[0] == 1 && dirDescription[1] == 0 && dirDescription[2] == 1 && dirDescription[3] == 0) {
        up = [0.0,-1.0,0.0];
        direction = myutils.normalize3Vector(myutils.crossProduct(up, direction));
        dirDescription = [1,0,0,1];
      } else if (dirDescription[0] == 0 && dirDescription[1] == 1 && dirDescription[2] == 1 && dirDescription[3] == 0) {
        up = [0.0,1.0,0.0];
        direction = myutils.normalize3Vector(myutils.crossProduct(up, direction));
        dirDescription = [0,1,0,1];
      }
    } else if (xBall > limitRight+0.5) { // collision with right wall
      if (dirDescription[0] == 0 && dirDescription[1] == 0 && dirDescription[2] == 0 && dirDescription[3] == 1) { // perpendicular collision
        direction = [-1.0,0.0,0.0];
        dirDescription = [0,0,1,0];
      } else if (dirDescription[0] == 0 && dirDescription[1] == 1 && dirDescription[2] == 0 && dirDescription[3] == 1) {
        up = [0.0,-1.0,0.0];
        direction = myutils.normalize3Vector(myutils.crossProduct(up, direction));
        dirDescription = [0,1,1,0];
      } else if (dirDescription[0] == 1 && dirDescription[1] == 0 && dirDescription[2] == 0 && dirDescription[3] == 1) {
        up = [0.0,1.0,0.0];
        direction = myutils.normalize3Vector(myutils.crossProduct(up, direction));
        dirDescription = [1,0,1,0];
      }
    } else if (zBall >= zPaddle-1.0 && xBall >= xPaddle-1.0 && xBall <= xPaddle+1.0) { // collision with the paddle
      if (xBall > xPaddle-0.1 && xBall < xPaddle+0.1) {
        direction = [0.0,0.0,-1.0];
        dirDescription = [1,0,0,0];
      } else {
        var centralDistance = myutils.vectorDiff(ballCenter, paddleCenter);
        if (xBall >= xPaddle-1.0 && xBall < xPaddle-0.1) { // sx
          dirDescription = [1,0,1,0];
        } else if (xBall <= xPaddle+1.0 && xBall > xPaddle+0.1) { // dx
          dirDescription = [1,0,0,1];
        }
        direction = myutils.normalize3Vector(centralDistance);
      }
    }

    if (zBall > zPaddle) {
      stop = true;
      xPaddle = originalPaddlePos[0];
      xContr = originalPaddlePos[0];
      yPaddle = originalPaddlePos[1];
      zPaddle = originalPaddlePos[2];
      paddleCenter = [xPaddle, yPaddle, zPaddle];

      originalBallPos = [0, 0.5, zPaddle-1.5];
      xBall = originalBallPos[0];
      yBall = originalBallPos[1];
      zBall = originalBallPos[2];
      ballCenter = [xBall, yBall, zBall];

      direction = [0.0,0.0,-1.0];
      dirDescription = [1,0,0,0];
    } else {
      xPaddle = xContr;
      paddleCenter = [xPaddle, yPaddle, zPaddle];

      xBall += direction[0]/10;
      xBall = myutils.round2dec(xBall);

      zBall += direction[2]/10;
      zBall = myutils.round2dec(zBall);

      ballCenter = [xBall, yBall, zBall];
    }
    ballWorldMatrix = utils.MakeWorld(xBall, yBall, zBall, 0.0, 0.0, 0.0, 1.0);
    paddleWorldMatrix = utils.MakeWorld(xPaddle, yPaddle, zPaddle, 0.0, 0.0, 0.0, 1.0);
  }
}

function drawScene() {
  animate();

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.85, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  // paddle
  gl.useProgram(programs[2]);
  viewWorldMatrix = utils.multiplyMatrices(viewMatrix, paddleWorldMatrix);
  projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
  gl.uniformMatrix4fv(matrixLocation[2], gl.FALSE, utils.transposeMatrix(projectionMatrix));
  gl.uniform3fv(paddleColorLocation, paddleColor);

  gl.bindVertexArray(paddleVAO);
  gl.drawElements(gl.TRIANGLES, paddleIndices.length, gl.UNSIGNED_SHORT, 0 );


  // base
  gl.useProgram(programs[2]);
  viewWorldMatrix = utils.multiplyMatrices(viewMatrix, baseWorldMatrix);
  projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
  gl.uniformMatrix4fv(matrixLocation[2], gl.FALSE, utils.transposeMatrix(projectionMatrix));
  gl.uniform3fv(baseColorLocation, baseColor);

  gl.bindVertexArray(baseVAO);
  gl.drawElements(gl.TRIANGLES, baseIndices.length, gl.UNSIGNED_SHORT, 0 );


  // ball
  gl.useProgram(programs[2]);
  viewWorldMatrix = utils.multiplyMatrices(viewMatrix, ballWorldMatrix);
  projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
  gl.uniformMatrix4fv(matrixLocation[2], gl.FALSE, utils.transposeMatrix(projectionMatrix));
  gl.uniform3fv(ballColorLocation, ballColor);

  gl.bindVertexArray(ballVAO);
  gl.drawElements(gl.TRIANGLES, ballIndices.length, gl.UNSIGNED_SHORT, 0 );


  // drawScene
  window.requestAnimationFrame(drawScene);
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

  //Load objects
  var paddleStr = await utils.get_objstr(modelsDir+"paddle.obj");
  paddleModel = new OBJ.Mesh(paddleStr);

  var baseStr = await utils.get_objstr(modelsDir+"base.obj");
  baseModel = new OBJ.Mesh(baseStr);

  var ballStr = await utils.get_objstr(modelsDir+"sphere.obj");
  ballModel = new OBJ.Mesh(ballStr);

  main();
}

window.addEventListener("keydown", function keyFunction(e){

  if (e.code == "ArrowLeft") {
    if (xContr > limitLeft) {
      xContr-=0.1;
    }
  }
  if (e.code == "ArrowRight") {  // Right arrow
    if (xContr < limitRight) {
      xContr+=0.1;
    }
  }
  if (e.code == "Space") {
    if (stop == true) {
      stop = false;
    }
  }

  //If you put it here instead, you will redraw the cube only when the camera has been moved
  //window.requestAnimationFrame(drawScene);
});
window.onload = init;
