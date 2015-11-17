function Animation(scene,id,span){
	this.scene=scene;
	this.id=id;
	this.span=span;
	this.matrix = mat4.create();

}

Animation.prototype.constructor = Animation;

Animation.prototype.getMatrix = function(){
	return this.matrix;
}