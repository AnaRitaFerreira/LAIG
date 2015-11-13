function CircularAnimation(id, span){
	Animation.call(id,span);
	this.id=id;
	this.span=span;
	this.center=null; 
	this.radius= null;
	this.startang= null;
	this.rotang= null; 
}

CircularAnimation.prototype = Object.create(Animation);
CircularAnimation.prototype.constructor = CircularAnimation;
CircularAnimation.prototype.init =function(){};
CircularAnimation.prototype.update=function(){};
CircularAnimation.prototype.display=function(){};