function LinearAnimation(scene, id, span){
	Animation.call(this,id,span);
	this.id=id;
	this.span=span;
	this.control_points=[];
}