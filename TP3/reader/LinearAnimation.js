function LinearAnimation (scene,id, span){
	Animation.call(this,scene,id,span);
	this.id=id;
	this.span=span;
	this.control_points=[];
	//movement control
	this.distance=0;
	this.finish=false;
	this.timeStart=0;
	this.rot_ang=0;

/*
	this.currtime = 0;
	this.initial = true;
	this.current = false;
	this.rotAng = 0;
	
*/
	//this.init();

}

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;
LinearAnimation.prototype.init =function(){

	this.directions=[];
	this.previousPoint=0;

	for(var i = 0; i < (this.control_points.length-1); i++){
		console.log(this.control_points[i]);
		var vec = vec3.fromValues(
			this.control_points[i+1][0] - this.control_points[i][0],
			this.control_points[i+1][1] - this.control_points[i][1],
			this.control_points[i+1][2] - this.control_points[i][2]);

		var distVec = Math.sqrt(Math.pow(v[0],2)+ Math.pow(v[1],2)+ Math.pow(v[2],2));

		this.distance += distVec;

		this.directions[i] = vec;
	}

	this.nowX = this.control_points[0][0];
	this.nowY = this.control_points[0][1];
	this.nowZ = this.control_points[0][2];

	this.velocity = this.distance/this.span;
	
};
LinearAnimation.prototype.update=function(current_time){
	if(this.previousPoint<(this.control_points.length-1) &&
		this.nowX==this.control_points[this.previousPoint+1][0] &&
		this.nowY==this.control_points[this.previousPoint+1][1] &&
		this.nowZ==this.control_points[this.previousPoint+1][2]){
			this.previousPoint++;
	}

	if(this.previousPoint == (this.control_points.length-1))
		this.finish = true;

	if(!this.finish){
		var delta = (current_time - this.timeStart)*0.001;
		this.timeStart = current_time;
		var vel = (this.distance/this.span)*delta;

		var d_norm = Math.sqrt(Math.pow(this.directions[this.previousPoint][0],2) +Math.pow(this.directions[this.previousPoint][1],2) +Math.pow(this.directions[this.previousPoint][2],2));
		if(d_norm != 0){
			this.directions[this.previousPoint][0] /= d_norm;
			this.directions[this.previousPoint][1] /= d_norm;
			this.directions[this.previousPoint][2] /= d_norm;
		}
		//aponta para proxima posiçao do control point
		this.directions[this.previousPoint][0] *= vel;
		this.directions[this.previousPoint][1] *= vel;
		this.directions[this.previousPoint][2] *= vel;
		//atualizar posição atual
		this.nowX +=this.directions[this.previousPoint][0];
		this.nowY +=this.directions[this.previousPoint][1];
		this.nowZ +=this.directions[this.previousPoint][2];

		if((this.directions[this.previousPoint][0] > 0 && this.nowX > this.control_points[this.previousPoint+1][0]) || (this.directions[this.previousPoint][0] < 0 && this.nowX < this.control_points[this.previousPoint+1][0]))
			this.nowX = this.control_points[this.previousPoint+1][0];
		if((this.directions[this.previousPoint][1] > 0 && this.nowY > this.control_points[this.previousPoint+1][1]) || (this.directions[this.previousPoint][1] < 0 && this.nowY < this.control_points[this.previousPoint+1][1]))
			this.nowY = this.control_points[this.previousPoint+1][1];
		if((this.directions[this.previousPoint][2] > 0 && this.nowZ > this.control_points[this.previousPoint+1][2]) || (this.directions[this.previousPoint][2] < 0 && this.nowZ < this.control_points[this.previousPoint+1][2]))
			this.nowZ = this.control_points[this.previousPoint+1][2];

		var AB = vec2.fromValues(this.control_points[this.previousPoint+1][0]-this.control_points[this.previousPoint][0],
			this.control_points[this.previousPoint+1][2]-this.control_points[this.previousPoint][2]);

		var BC = vec2.fromValues(0,1);

		this.rot_ang = Math.acos(((AB[0]*BC[0])+(AB[1]*BC[1]))/
				(Math.sqrt(Math.pow(AB[0],2)+Math.pow(AB[1],2))+
				Math.sqrt(Math.pow(BC[0],2)+Math.pow(BC[1],2))))*(180/Math.PI);

		mat4.identity(this.matrix);
		mat4.translate(this.matrix, this.matrix,[this.nowX, this.nowY, this.nowZ]);
		mat4.rotate(this.matrix, this.matrix,this.rot_ang, [0, 1, 0]);

	}
};
/*
LinearAnimation.prototype.apply=function(){
	if(!this.finish){
		this.scene.translate(this.nowX, this.nowY, this.nowZ);
		this.scene.rotate(this.rot_ang, 0, 1, 0);
	}
};*/
