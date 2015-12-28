function MyRect(scene,args) {
    CGFobject.call(this,scene);


    this.args=args;

    this.initBuffers();
};

MyRect.prototype = Object.create(CGFobject.prototype);
MyRect.prototype.constructor = MyRect;

MyRect.prototype.initBuffers = function() {

    this.vertices = [
        this.args[0], this.args[3], 0,
        this.args[2], this.args[3], 0,
        this.args[0], this.args[1], 0,
        this.args[2], this.args[1], 0,
    ];

    this.indices = [
        0, 1, 2, 
        3, 2, 1
    ];

    this.normals = [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
    ];

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyRect.prototype.updateTex = function(S, T) {

    this.ampS = S;
    this.ampT = T;

    this.texCoords = [
        0, (this.args[1] - this.args[3]) / this.ampT,
        (this.args[2] - this.args[0]) / this.ampS, (this.args[1] - this.args[3]) / this.ampT,
        0, 0,
        (this.args[2] - this.args[0]) / this.ampS, 0
    ];

    this.setTex = true;

    this.updateTexCoordsGLBuffers();
};