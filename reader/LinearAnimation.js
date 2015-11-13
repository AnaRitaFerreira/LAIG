function LinearAnimation (id, span){
	Animation.call(id,span);
	this.id=id;
	this.span=span;
	this.control_points=[];
}

LinearAnimation.prototype = Object.create(Animation);
LinearAnimation.prototype.constructor = LinearAnimation;
LinearAnimation.prototype.init =function(){};
LinearAnimation.prototype.update=function(){};
LinearAnimation.prototype.display=function(){};
