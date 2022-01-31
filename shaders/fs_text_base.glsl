#version 300 es

precision mediump float;

in vec2 uvFS;
out vec4 outColor;
uniform sampler2D u_texture;
uniform vec3 color;

void main() {
  outColor = texture(u_texture, uvFS)*vec4(color, 1.0);
}