function MyPatch(scene, order, partsU, partsV, control_points) {

	CGFobject.call(this, scene);

	this.knots = createKnot(order);
	this.partsU = partsU;
	this.partsV = partsV;
	this.order = order;
	this.control_Vert = createMatrixCV(order, control_points);

	this.initBuffers();
}

MyPatch.prototype = Object.create(CGFobject.prototype);
MyPatch.prototype.constructor=MyPatch;

MyPatch.prototype.initBuffers = function() {

	 this.makeSurface(this.order, this.order, this.knots,this.knots, this.control_Vert);

}

MyPatch.prototype.makeSurface = function (deg1, deg2, knots1, knots2, control_Vert) {
		
	var nurbsSurface = new CGFnurbsSurface(deg1, deg2, knots1, knots2, control_Vert);
	getSurfacePoint = function(u, v) {
		return nurbsSurface.getPoint(u, v);
	};
	
	this.nurbObj = new CGFnurbsObject(this.scene, getSurfacePoint, this.partsU,this.partsV) ;
};

MyPatch.prototype.display = function() {
	this.nurbObj.display();
};

function createKnot(order){
	var i = order+1;
	var knot = new Array(i);
	var n = i*2;

	for(var j = 0; j < n;j++)
	{
		if(j < i)
			knot[j] = 0;
		else
			knot[j] = 1;
	}
	return knot;
}

function createMatrixCV(order, control_points){

	var n = order+1;
	var CV = [];
	var index = 0;
	for(var i = 0; i < n; i++)
	{
		var temp = [];
		for(var j = 0; j < n; j++)
		{
			console.log("CP: " + control_points[index]);
			temp[j] = control_points[index];
			index++;
		}
		CV[i] = temp;
	}
	console.log("CV: " + CV[0][0][0][0]);

	return CV;

}