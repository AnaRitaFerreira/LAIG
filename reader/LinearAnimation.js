function LinearAnimation(scene, id, span){
	Animation.call(this,id,span);
	this.id=id;
	this.span=span;
	this.control_points=[];
}

LinearAnimation.prototype = Object.create(Animation);
LinearAnimation.prototype.constructor = LinearAnimation;
LinearAnimation.prototype.init =function(){};
LinearAnimation.prototype.update=function(){};
LinearAnimation.prototype.display=function(){};
