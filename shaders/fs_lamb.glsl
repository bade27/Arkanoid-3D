#version 300 es

precision mediump float;

in vec3 fsNormal;
out vec4 outColor;

uniform vec3 mDiffColor; //material diffuse color
uniform vec3 lightDirection; // directional light direction vec
uniform vec3 lightColor; //directional light color
uniform vec3 mSpecular;
uniform vec3 eyeDir;
uniform float shine;

void main() {
  vec3 lightDirNorm = normalize(lightDirection);
  vec3 eyeDirNorm = normalize(eyeDir);

  vec3 nNormal = normalize(fsNormal);
  vec3 lambertDiffuse = mDiffColor * clamp(dot(-lightDirNorm,nNormal), 0.0, 1.0);
  vec3 lambertColor = lightColor * lambertDiffuse;

  vec3 h = normalize(lightDirNorm+eyeDirNorm);
  vec3 blinnSpecular = mSpecular * pow(clamp(dot(nNormal, h), 0.0, 1.0), shine);
  vec3 blinnColor = lightColor * blinnSpecular;

  outColor = clamp(vec4(lambertColor+blinnColor,1.0), 0.0, 1.0);
}
