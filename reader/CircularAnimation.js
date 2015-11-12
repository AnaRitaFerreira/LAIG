function CircularAnimation(id, span){
	Animation.call(this,id,span);
	this.id=id;
	this.span=span;
	this.center=null; 
	this.radius= null;
	this.startang= null;
	this.rotang= null; 
}