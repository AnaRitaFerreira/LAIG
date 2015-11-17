function Node(id){
	this.id = id;
	this.material=null;
	this.texture=null;
	this.m = mat4.create();
	this.descendants=[];
	this.primitive=null;
	this.anim_ref=[];
}

Node.prototype.push=function(nodename){
	this.descendants.push(nodename);
};

Node.prototype.setMaterial=function(material){
	this.material=material;
};

Node.prototype.setMatrix=function(m){
	this.m=mat4.clone(m);
	console.log(this.m);
};