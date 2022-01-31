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
var ambientLightColor;
var shine;

// skybox
var skyboxVertPos;
var skyboxVertPosAttr;

// world matrices
var baseWorldMatrix;
var paddleWorldMatrix;
var ballWorldMatrix;
var obstaclesWorldMatrix = new Array();


var positionAttributeLocationP;
var positionAttributeLocationB;
var matrixLocationP;
var matrixLocationB;
var lightDirectionHandle;
var lightColorHandle;
var normalMatrixPositionHandle;
var vertexMatrixPositionHandle;
var baseColorLocation;
var baseColorHandler;
var paddleColorLocation;
var obstaclesColorLocation;
var uvAttributeLocation;
var normalAttributeLocation;
var materialDiffColorHandle;
var specularDiffColorHandle;
var eyePosHandler;
var shineHanlder;
var viewHandler;
var eyePos;
var emitHandler;
var ambientLightColorHandler;
var ambientHandler;
var up = [0.0,1.0,0.0];


// Paddle coordinates and status
var originalPaddlePos = [0.0, 1.0, -4.5];
var xPaddle = originalPaddlePos[0];
var yPaddle = originalPaddlePos[1];
var zPaddle = originalPaddlePos[2];
var limitLeft = -5.7;
var limitRight = 5.7;
var xContr = xPaddle;
var paddleCenter = originalPaddlePos;
var paddleNormalMatrix;
var paddleSpecular;

// Ball coordinates and status
var originalBallPos = [0, 1.0, zPaddle-1.0];
var direction = [0.0,0.0,-1.0];
var dirDescription = [1, 0, 0, 0]; //up,down, left,right
var xBall = originalBallPos[0];
var yBall = originalBallPos[1];
var zBall = originalBallPos[2];
var ballCenter = originalBallPos;
var ballNormalMatrix;
var ballSpecular;

// Obstacles coordinates and status
var obstaclesCenters = new Array();
var obstacleHit = new Array();
var obstaclesNormalMatrix;
var obstacleSpecular1;
var obstacleSpecular2;

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

var noObstacles = 5;
var noRows = 2;
var obstacleModel;
var obstacleVertices;
var obstacleNormals;
var obstacleIndices;


// object colors
var paddleColor;
var baseColor;
var ballColor;
var obstacleColor1;
var obstacleColor2;
var paddleEmit;
var ballEmit;
var obstaclesEmit1;
var obstaclesEmit2;
var paddleAmbient;
var ballAmbient;
var obstaclesAmbient1;
var obstaclesAmbient2;


// vaos
var paddleVAO;
var baseVAO;
var ballVAO;
var obstacleVAO;
var skyboxVao;


// textures
var skyboxTexture;
var textLocation;
var texture;

// game status
var lives = 3;
var points = 0;
var game_over = false;
var stop = true;



function main() {

  //directional light
  dirLightAlpha = -utils.degToRad(150);
  dirLightBeta  = -utils.degToRad(240);
  directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
              Math.sin(dirLightAlpha), Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)];
  directionalLightColor = [1.0, 1.0, 1.0];

  dirEyeAlpha = -utils.degToRad(120);
  dirEyeBeta  = -utils.degToRad(270);
  eyePos = [0.0,0.0,0.0];

  //material color
  paddleColor = [0.2, 0.4, 0.8];
  baseColor = [0.5, 0.4, 0.3];
  ballColor = [1.0, 0.0, 0.5];
  obstacleColor1 = [0.5,0.5,0.5];
  obstacleColor2 = [0.1,0.2,0.3];

  shine = 64;
  paddleSpecular = [1.0,1.0,1.0];
  ballSpecular = [1.0,1.0,1.0];
  obstacleSpecular1 = [0.0,1.0,0.0];
  obstacleSpecular2 = [0.0,0.0,1.0];

  paddleEmit = [0.0,0.0,0.1];
  ballEmit = [0.1,0.0,0.0];
  obstaclesEmit1 = [1.0,1.0,1.0];
  obstaclesEmit2 = [0.1,0.2,0.3];

  paddleAmbient = [0.0,0.1,0.3];
  ballAmbient = [0.8,0.3,0.5];
  obstaclesAmbient1 = [0.0,0.5,0.5];
  obstaclesAmbient2 = [0.0,0.0,0.1];

  ambientLightColor = [0.5,0.5,0.4];


  paddleWorldMatrix = utils.MakeWorld(xPaddle, yPaddle, zPaddle, 0.0, 0.0, 0.0, 1.0);
  baseWorldMatrix = utils.MakeWorld(0.0, 0.0, -15, 0.0, 0.0, 0.0, 1.0);
  ballWorldMatrix = utils.MakeWorld(xBall, yBall, zBall, 0.0, 0.0, 0.0, 1.0);

  for (let i = 0; i < noRows; i++) {
    for (let j = 0; j < noObstacles; j++) {
      var [x, y, z] = [-4.3+myutils.round2dec(j*2.1),1.5,myutils.round2dec(-14.0-i*1.5)];
      obstaclesCenters.push([x, y, z]);
      obstacleHit.push(false);
      obstaclesWorldMatrix.push(utils.MakeWorld(x, y, z, 0.0,0.0,0.0,1.0));
    }
  }

  //SET Global states (viewport size, viewport background color, Depth test)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.85, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  //Lambert + Blinn
  positionAttributeLocationP = gl.getAttribLocation(program, "inPosition");
  normalAttributeLocation = gl.getAttribLocation(program, "inNormal");
  matrixLocationP = gl.getUniformLocation(program, "matrix");
  materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
  lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');
  lightColorHandle = gl.getUniformLocation(program, 'lightColor');
  normalMatrixPositionHandle = gl.getUniformLocation(program, 'nMatrix');
  specularDiffColorHandle = gl.getUniformLocation(program, 'mSpecular');
  eyePosHandler = gl.getUniformLocation(program, 'eyePos');
  shineHanlder = gl.getUniformLocation(program, 'shine');
  viewHandler = gl.getUniformLocation(program, "view");
  emitHandler = gl.getUniformLocation(program, "emit");
  ambientHandler = gl.getUniformLocation(program, "ambient");
  ambientLightColorHandler = gl.getUniformLocation(program, "ambientLight");


  // skybox
  skyboxTexHandle = gl.getUniformLocation(skyboxProgram, "u_texture");
  inverseViewProjMatrixHandle = gl.getUniformLocation(skyboxProgram, "inverseViewProjMatrix");
  skyboxVertPosAttr = gl.getAttribLocation(skyboxProgram, "in_position");


  // base texture
  positionAttributeLocationB = gl.getAttribLocation(baseProgram, "inPosition");
  matrixLocationB = gl.getUniformLocation(baseProgram, "matrix");
  uvAttributeLocation = gl.getAttribLocation(baseProgram, "a_uv");
  textLocation = gl.getUniformLocation(baseProgram, "u_texture");
  baseColorHandler = gl.getUniformLocation(baseProgram, "color");

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
  baseUV = baseModel.textures;

  baseVAO = gl.createVertexArray();

  gl.bindVertexArray(baseVAO);
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(baseVertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocationB);
  gl.vertexAttribPointer(positionAttributeLocationB, 3, gl.FLOAT, false, 0, 0);

  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(baseUV), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation);
  gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(baseIndices), gl.STATIC_DRAW);

  // Create a texture.
  texture = gl.createTexture();
  // use texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  // bind to the TEXTURE_2D bind point of texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Asynchronously load an image
  var baseImage = new Image();
  baseImage.src = baseDir + "textures/" + "base5.jpg";
  baseImage.onload = function() {
      //Make sure this is the active one
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, baseImage);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

      gl.generateMipmap(gl.TEXTURE_2D);
    };


  // ball
  ballVertices = ballModel.vertices;
  ballNormals = ballModel.vertexNormals;
  ballIndices = ballModel.indices;

  ballVAO = gl.createVertexArray();

  gl.bindVertexArray(ballVAO);
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ballVertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocationP);
  gl.vertexAttribPointer(positionAttributeLocationP, 3, gl.FLOAT, false, 0, 0);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ballNormals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalAttributeLocation);
  gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

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
  gl.enableVertexAttribArray(positionAttributeLocationP);
  gl.vertexAttribPointer(positionAttributeLocationP, 3, gl.FLOAT, false, 0, 0);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(paddleNormals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalAttributeLocation);
  gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(paddleIndices), gl.STATIC_DRAW);


  // obstacles
  obstacleVertices = obstacleModel.vertices;
  obstacleNormals = obstacleModel.vertexNormals;
  obstacleIndices = obstacleModel.indices;

  obstacleVAO = gl.createVertexArray();

  gl.bindVertexArray(obstacleVAO);
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obstacleVertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocationP);
  gl.vertexAttribPointer(positionAttributeLocationP, 3, gl.FLOAT, false, 0, 0);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obstacleNormals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalAttributeLocation);
  gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obstacleIndices), gl.STATIC_DRAW);

  //---------------------------------------------------------------------------------------------
  drawScene();
}

function animate(){
  if (!stop) {
    // collision with the walls
    if (zBall < -25+1.0) { // collision with up wall
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
    } else if (xBall < limitLeft-0.5) { // collision with left wall
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
    } else{
      for (let i = 0; i < noRows; i++) {
        for (let j = 0; j < noObstacles; j++) {
          if (!obstacleHit[j+noObstacles*i]) {
            var [x, y, z] = obstaclesCenters[j+noObstacles*i];
            if (zBall < z+0.5 && zBall > z+0.1 && xBall >= x-1.0 && xBall <= x+1.0) {  //  front bounce
              if (xBall > x-0.5 && xBall < x+0.5) {
                direction = [0.0,0.0,1.0];
                dirDescription = [0,1,0,0];
              } else {
                var centralDistance = myutils.vectorDiff(ballCenter, [x, y, z]);
                if (xBall >= x-1.0 && xBall < x-0.1) { // sx
                  dirDescription = [0,1,1,0];
                } else if (xBall <= x+1.0 && xBall > x+0.1) { // dx
                  dirDescription = [0,1,0,1];
                }
                direction = myutils.normalize3Vector(centralDistance);
              }
              obstacleHit[j+noObstacles*i] = true;
              points++;
            } else if (zBall > z-1 && zBall < z-1.8 && xBall >= x-1.0 && xBall <= x+1.0) {  //  back bounce
              console.log("back");
              if (xBall > x-0.5 && xBall < x+0.5) {
                direction = [0.0,0.0,-1.0];
                dirDescription = [1,0,0,0];
              } else {
                var centralDistance = myutils.vectorDiff(ballCenter, [x, y, z]);
                if (xBall >= x-1.0 && xBall < x-0.1) { // sx
                  dirDescription = [1,0,1,0];
                } else if (xBall <= x+1.0 && xBall > x+0.1) { // dx
                  dirDescription = [1,0,0,1];
                }
                direction = myutils.normalize3Vector(centralDistance);
              }
              obstacleHit[j+noObstacles*i] = true;
              points++;
            } else if (xBall > x+1.0 && xBall < x+1.0 && zBall >= z-1.0 && zBall <= z+1.0) { // left bounce
              var centralDistance = myutils.vectorDiff(ballCenter, [x, y, z]);
              if (dirDescription[0] == 0 && dirDescription[0] == 1 && dirDescription[0] == 0 && dirDescription[0] == 1) {
                dirDescription = [1,0,1,0];
              } else {
                dirDescription = [0,1,1,0];
              }
              direction = myutils.normalize3Vector(centralDistance);
              obstacleHit[j+noObstacles*i] = true;
              points++;
            } else if (xBall < x-1.0 && xBall > x-1.0 && zBall >= z-1.0 && zBall <= z+1.0) { // right bounce
              var centralDistance = myutils.vectorDiff(ballCenter, [x, y, z]);
              if (dirDescription[0] == 0 && dirDescription[0] == 1 && dirDescription[0] == 1 && dirDescription[0] == 0) {
                dirDescription = [1,0,0,1];
              } else {
                dirDescription = [0,1,0,1];
              }
              direction = myutils.normalize3Vector(centralDistance);
              obstacleHit[j+noObstacles*i] = true;
              points++;
            }
          }
        }
      }
    }

    const score = document.getElementById("score");
    score.textContent = ""+points;

    if (zBall > zPaddle) {
      stop = true;
      lives--;
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

      const livestx = document.getElementById("lives");
      livestx.textContent = ""+lives;

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

  game_status();

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.85, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  // paddle
  gl.useProgram(program);
  viewWorldMatrix = utils.multiplyMatrices(viewMatrix, paddleWorldMatrix);
  projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);

  paddleNormalMatrix = utils.invertMatrix(utils.transposeMatrix(viewWorldMatrix));
  gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(paddleNormalMatrix));

  gl.uniformMatrix4fv(matrixLocationP, gl.FALSE, utils.transposeMatrix(projectionMatrix));

  gl.uniformMatrix4fv(viewHandler, gl.FALSE, utils.transposeMatrix(viewWorldMatrix));

  var dirLightTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(viewMatrix), directionalLight);
  gl.uniform3fv(lightDirectionHandle,  dirLightTransformed);

  gl.uniform3fv(materialDiffColorHandle, paddleColor);
  gl.uniform3fv(lightColorHandle,  directionalLightColor);

  gl.uniform3fv(ambientHandler, paddleAmbient);
  gl.uniform3fv(ambientLightColorHandler, ambientLightColor);
  gl.uniform3fv(emitHandler, paddleEmit);

  gl.uniform3fv(specularDiffColorHandle, paddleSpecular);
  gl.uniform3fv(eyePosHandler, eyePos);
  gl.uniform1f(shineHanlder, shine);

  gl.bindVertexArray(paddleVAO);
  gl.drawElements(gl.TRIANGLES, paddleIndices.length, gl.UNSIGNED_SHORT, 0 );


  // base
  gl.useProgram(baseProgram);
  viewWorldMatrix = utils.multiplyMatrices(viewMatrix, baseWorldMatrix);
  projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
  gl.uniformMatrix4fv(matrixLocationB, gl.FALSE, utils.transposeMatrix(projectionMatrix));

  gl.uniform3fv(baseColorHandler, baseColor);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(textLocation, 0);

  gl.bindVertexArray(baseVAO);
  gl.drawElements(gl.TRIANGLES, baseIndices.length, gl.UNSIGNED_SHORT, 0 );


  // ball
  gl.useProgram(program);
  viewWorldMatrix = utils.multiplyMatrices(viewMatrix, ballWorldMatrix);
  projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);

  ballNormalMatrix = utils.invertMatrix(utils.transposeMatrix(viewWorldMatrix));
  gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(ballNormalMatrix));

  gl.uniformMatrix4fv(matrixLocationP, gl.FALSE, utils.transposeMatrix(projectionMatrix));

  gl.uniformMatrix4fv(viewHandler, gl.FALSE, utils.transposeMatrix(viewWorldMatrix));

  var dirLightTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(viewMatrix), directionalLight);
  gl.uniform3fv(lightDirectionHandle,  dirLightTransformed);

  gl.uniform3fv(materialDiffColorHandle, ballColor);
  gl.uniform3fv(lightColorHandle,  directionalLightColor);

  gl.uniform3fv(ambientHandler, ballAmbient);
  gl.uniform3fv(ambientLightColorHandler, ambientLightColor);
  gl.uniform3fv(emitHandler, ballEmit);


  gl.uniform3fv(specularDiffColorHandle, ballSpecular);
  gl.uniform3fv(eyePosHandler, eyePos);
  gl.uniform1f(shineHanlder, shine);

  gl.bindVertexArray(ballVAO);
  gl.drawElements(gl.TRIANGLES, ballIndices.length, gl.UNSIGNED_SHORT, 0 );


  // obstacles
  for (let i = 0; i < noRows; i++) {
    for (let j = 0; j < noObstacles; j++) {
      if (!obstacleHit[j+noObstacles*i]) {
        gl.useProgram(program);
        
        viewWorldMatrix = utils.multiplyMatrices(viewMatrix, obstaclesWorldMatrix[j+noObstacles*i]);
        projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);

        obstaclesNormalMatrix = utils.invertMatrix(utils.transposeMatrix(viewWorldMatrix));
        gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(obstaclesNormalMatrix));

        gl.uniformMatrix4fv(matrixLocationP, gl.FALSE, utils.transposeMatrix(projectionMatrix));

        gl.uniformMatrix4fv(viewHandler, gl.FALSE, utils.transposeMatrix(viewWorldMatrix));

        var dirLightTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(viewMatrix), directionalLight);
        gl.uniform3fv(lightDirectionHandle,  dirLightTransformed);

        var obstacleColor = (i+j)%2==0 ? obstacleColor1 : obstacleColor2;
        gl.uniform3fv(obstaclesColorLocation, obstacleColor);

        gl.uniform3fv(lightColorHandle,  directionalLightColor);

        var obstaclespec = (i+j)%2==0 ? obstacleSpecular1 : obstacleSpecular2;
        gl.uniform3fv(specularDiffColorHandle, obstaclespec);
        gl.uniform3fv(eyePosHandler, eyePos);
        gl.uniform1f(shineHanlder, shine);

        var emitcolor = (i+j)%2==0? obstaclesEmit1 : obstaclesEmit2;
        var oambient = (i+j)%2==0? obstaclesAmbient1 : obstaclesAmbient2;
        gl.uniform3fv(ambientHandler, oambient);
        gl.uniform3fv(ambientLightColorHandler, ambientLightColor);
        gl.uniform3fv(emitHandler, emitcolor);

        gl.bindVertexArray(obstacleVAO);
        gl.drawElements(gl.TRIANGLES, obstacleIndices.length, gl.UNSIGNED_SHORT, 0 );
      }
    }
  }

  DrawSkybox();

  // drawScene
  window.requestAnimationFrame(drawScene);
}

function DrawSkybox(){
    gl.useProgram(skyboxProgram);

    gl.activeTexture(gl.TEXTURE0+3);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
    gl.uniform1i(skyboxTexHandle, 3);

    var viewProjMat = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);
    inverseViewProjMatrix = utils.invertMatrix(viewProjMat);
    gl.uniformMatrix4fv(inverseViewProjMatrixHandle, gl.FALSE, utils.transposeMatrix(inverseViewProjMatrix));

    gl.bindVertexArray(skyboxVao);
    gl.depthFunc(gl.LEQUAL);
    gl.drawArrays(gl.TRIANGLES, 0, 1*6);
}

function LoadEnvironment(){
    skyboxVertPos = new Float32Array(
    [
      -1, -1, 1.0,
       1, -1, 1.0,
      -1,  1, 1.0,
      -1,  1, 1.0,
       1, -1, 1.0,
       1,  1, 1.0,
    ]);

    skyboxVao = gl.createVertexArray();
    gl.bindVertexArray(skyboxVao);

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, skyboxVertPos, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(skyboxVertPosAttr);
    gl.vertexAttribPointer(skyboxVertPosAttr, 3, gl.FLOAT, false, 0, 0);

    skyboxTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0+3);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);

    var envTexDir = baseDir+"environment/";

    const faceInfos = [
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            url: envTexDir+'right.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            url: envTexDir+'left.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            url: envTexDir+'top.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            url: envTexDir+'bottom.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            url: envTexDir+'front.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            url: envTexDir+'back.png',
        },
    ];
    faceInfos.forEach((faceInfo) => {
        const {target, url} = faceInfo;

        // Upload the canvas to the cubemap face.
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 256;
        const height = 256;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;

        // setup each face so it's immediately renderable
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

        // Asynchronously load an image
        const image = new Image();
        image.src = url;
        image.addEventListener('load', function() {
            // Now that the image has loaded upload it to the texture.
            gl.activeTexture(gl.TEXTURE0+3);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
            gl.texImage2D(target, level, internalFormat, format, type, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        });


    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

}

function game_reset() {
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

  points = 0;
  lives = 3;

  for (let i = 0; i < noRows; i++) {
    for (let j = 0; j < noObstacles; j++) {
      obstacleHit[j+noObstacles*i] = false;
    }
  }

  ballWorldMatrix = utils.MakeWorld(xBall, yBall, zBall, 0.0, 0.0, 0.0, 1.0);
  paddleWorldMatrix = utils.MakeWorld(xPaddle, yPaddle, zPaddle, 0.0, 0.0, 0.0, 1.0);
}

function game_status() {
  const status = document.getElementById("status");
  const instr = document.getElementById("instructions");
  if (lives == 0) {
    game_over = true;
    status.textContent = "GAME OVER";
    instr.textContent = "Press TAB to strat a new game";
    game_reset();
  }
  if (points == obstaclesCenters.length) {
    game_over = true;
    status.textContent = "YOU WON";
    instr.textContent = "Press TAB to strat a new game";
    game_reset();
  }
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

  // MultipleShaders
  await utils.loadFiles([shaderDir + 'vs_blinn.glsl', shaderDir + 'fs_blinn.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

    program = utils.createProgram(gl, vertexShader, fragmentShader);
  });

    await utils.loadFiles([shaderDir + 'vs_text_base.glsl', shaderDir + 'fs_text_base.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

    baseProgram = utils.createProgram(gl, vertexShader, fragmentShader);
  });

    await utils.loadFiles([shaderDir + 'skybox_vs.glsl', shaderDir + 'skybox_fs.glsl'], function (shaderText) {
      var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
      var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

      skyboxProgram = utils.createProgram(gl, vertexShader, fragmentShader);
  });

  //Load objects
  var paddleStr = await utils.get_objstr(modelsDir+"paddle.obj");
  paddleModel = new OBJ.Mesh(paddleStr);

  var baseStr = await utils.get_objstr(modelsDir+"base.obj");
  baseModel = new OBJ.Mesh(baseStr);

  var ballStr = await utils.get_objstr(modelsDir+"sphere.obj");
  ballModel = new OBJ.Mesh(ballStr);

  var obstacleStr = await utils.get_objstr(modelsDir+"obstacle.obj");
  obstacleModel = new OBJ.Mesh(obstacleStr);

  LoadEnvironment();

  main();
}

window.addEventListener("keydown", function keyFunction(e){

  if (e.code == "ArrowLeft") {
    if (xContr > limitLeft) {
      xContr-=0.25;
    }
  }
  if (e.code == "ArrowRight") {  // Right arrow
    if (xContr < limitRight) {
      xContr+=0.25;
    }
  }
  if (e.code == "Space") {
    if (stop == true) {
      stop = false;
    }
    if (game_over) {
      const score = document.getElementById("score");
      score.textContent = ""+points;
      const livestx = document.getElementById("lives");
      livestx.textContent = ""+lives;
      const status = document.getElementById("status");
      status.textContent = "";
      const instr = document.getElementById("instructions");
      instr.textContent = "";
      game_over = false;
    }
  }

  //If you put it here instead, you will redraw the cube only when the camera has been moved
  //window.requestAnimationFrame(drawScene);
});
window.onload = init;
