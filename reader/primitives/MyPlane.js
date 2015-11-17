function MyPlane(scene, parts) {

	CGFobject.call(this,scene);
	this.parts = parts;
	
	this.initBuffers();
};

MyPlane.prototype = Object.create(CGFobject.prototype);
MyPlane.prototype.constructor=MyPlane;

MyPlane.prototype.initBuffers = function() {
  
	this.makeSurface(1, 1, [0,0,1,1], [0,0,1,1], 
						[// U = 0
						[ // V = 0..1;
							 [-1.0, 0.0, 1.0, 1 ],
							 [-1.0,  0.0, -1.0, 1 ]
							
						],
						// U = 1
						[ // V = 0..1
							 [ 1.0, 0.0, 1.0, 1 ],
							 [ 1.0, 0.0, -1.0, 1 ]							 
						]
					]);
};

MyPlane.prototype.makeSurface = function (deg1, deg2, knots1, knots2, control_vert) {
		
	var nurbsSurface = new CGFnurbsSurface(deg1, deg2, knots1, knots2, control_vert);
	getSurfacePoint = function(u, v) {
		return nurbsSurface.getPoint(u, v);
	};

	this.surface = new CGFnurbsObject(this.scene, getSurfacePoint,this.parts,this.parts);

};

MyPlane.prototype.display = function() {
	this.surface.display();
};