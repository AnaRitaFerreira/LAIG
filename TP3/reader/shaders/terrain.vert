#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform sampler2D uSampler2;
uniform float yRatio;
varying vec2 vTextureCoord;

void main() {
    vTextureCoord = aTextureCoord;
    vec4 color = texture2D(uSampler2, aTextureCoord);
    vec3 height = vec3(0,color.s,0);
    height *= yRatio;

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + height, 1.0);
}
