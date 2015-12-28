function MyTriangle(scene, args){
    CGFobject.call(this,scene);
    this.args=args;

	this.v1 = vec3.fromValues(args[0], args[1], args[2]);
	this.v2 = vec3.fromValues(args[3], args[4], args[5]);
	this.v3 = vec3.fromValues(args[6], args[7], args[8]);
  
    this.initBuffers();
}

MyTriangle.prototype = Object.create(CGFobject.prototype);

MyTriangle.prototype.constructor = MyTriangle;

MyTriangle.prototype.initBuffers = function() {

    this.vertices = [
    	this.v1[0], this.v1[1], this.v1[2],
    	this.v2[0], this.v2[1], this.v2[2],
    	this.v3[0], this.v3[1], this.v3[2]
    ];

    this.indices = [0,1,2];

	var AB = vec3.create();
	vec3.sub(AB, this.v2, this.v1);
	var AC = vec3.create();
	vec3.sub(AC, this.v3, this.v1);
	var BC = vec3.create();
	vec3.sub(BC, this.v3, this.v2);

	var N = vec3.create();
	vec3.cross(N, AB, BC);
	vec3.normalize(N, N);

	this.normals = [
		N[0], N[1], N[2],
		N[0], N[1], N[2],
		N[0], N[1], N[2],
    ];

    var tC = (vec3.sqrLen(AB) + vec3.sqrLen(AC) - vec3.sqrLen(BC))/ (2 * vec3.length(AB));
	var sC = Math.sqrt(vec3.sqrLen(AC) - tC * tC);
	this.nonScaledTexCoords = [
		0,0,
		vec3.length(AB),0,
		sC, tC
	];

	this.texCoords = this.nonScaledTexCoords.slice(0);

    this.primitiveType=this.scene.gl.TRIANGLES;

	this.initGLBuffers();
}


MyTriangle.prototype.updateTex = function(ampS, ampT) {
	for (var i = 0; i < this.texCoords.length; i += 2) {
		this.texCoords[i] = this.nonScaledTexCoords[i] / ampS;
		this.texCoords[i + 1] = this.nonScaledTexCoords[i+1] / ampT;
	}

	this.updateTexCoordsGLBuffers();
}