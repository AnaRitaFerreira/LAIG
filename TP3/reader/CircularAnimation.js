function CircularAnimation(scene,id, span){
	Animation.call(this,scene,id,span);
	this.id=id;
	this.span=span;
	this.center=null; 
	this.radius= null;
	this.startang= null;
	this.rotang= null; 

	//this.tmatrix = mat4.create();
	this.initial = true;
	this.time = Date.now();
	this.currTime = Date.now();
	this.current=false;
	this.finish = false;
}

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;
CircularAnimation.prototype.init =function(){
	this.lastAng = this.startang + this.rotang;
	this.velocity = this.rotang/(this.span*1000);
	this.curr_ang = this.startang;
};
CircularAnimation.prototype.update=function(current_time){

	if(this.curr_ang <= this.lastAng){

		if(this.initial){
			this.initial = false;
			this.time = current_time;
			this.currTime = current_time;
		}
		else{
			this.currTime = current_time;
		}
		this.curr_ang = this.startang + (this.velocity * (this.currTime - this.time));
		mat4.identity(this.matrix);
		mat4.translate(this.matrix, this.matrix,this.center);
		mat4.rotate(this.matrix, this.matrix, (this.curr_ang*Math.PI)/180.0, [0,1,0]);
		mat4.translate(this.matrix, this.matrix,[this.radius,0,0]);
	}
	else{
		this.finish = true;
		this.current = false;
	}
};
/*
CircularAnimation.prototype.apply=function(){
	if(!this.finish){
		this.scene.translate(center);
		console.log(this.scene.translate(center));
		this.scene.rotate((this.curr_ang*Math.PI)/180.0, 0,1,0);
		console.log(this.scene.rotate((this.curr_ang*Math.PI)/180.0, 0,1,0));
		this.scene.translate(this.radius,0,0);
		console.log(this.scene.translate(this.radius,0,0));
	}

};*/