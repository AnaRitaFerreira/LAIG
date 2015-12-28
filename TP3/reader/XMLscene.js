var d2r=Math.PI/180;

function XMLscene() {
    CGFscene.call(this);
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.enableTextures(true);

	this.lightsEnabled = [];
	this.grafo=[];

	this.textures = {};
    this.materials = {};
    this.leaves = {};
    this.nodes = [];
    this.a_material = null;
    this.a_texture = null;
   
	this.axis=new CGFaxis(this);
	this.setUpdatePeriod(10);
	//this.materialDefault = new CGFappearance(this);
};

XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};
XMLscene.prototype.setDefaultAppearance = function () {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);	
};

XMLscene.prototype.initLights = function(){

	//this.shader.bind();

	for(var i = 0; i < this.graph.lights.length; i++){

		var lgt = this.graph.lights[i];

		if(lgt.enabled)
			this.lights[i].enable();
		else
			this.lights[i].disable();

		this.lightsEnabled[lgt.id] = lgt.enabled;

		this.lights[i].setPosition(lgt.position.x,lgt.position.y,lgt.position.z,lgt.position.w);
		this.lights[i].setAmbient(lgt.ambient.r,lgt.ambient.g,lgt.ambient.b,lgt.ambient.a);
		this.lights[i].setDiffuse(lgt.diffuse.r,lgt.diffuse.g,lgt.diffuse.b,lgt.diffuse.a);
		this.lights[i].setSpecular(lgt.specular.r,lgt.specular.g,lgt.specular.b,lgt.specular.a);
		this.lights[i].setVisible(true);
		this.lights[i].update();
	}
	//this.shader.unbind();

	//this.interface.callLight();
};

XMLscene.prototype.updateLights = function() {
	for (i = 0; i < this.lights.length; i++)
		this.lights[i].update();
};

XMLscene.prototype.applyInitials = function(){

	this.camera.near = this.graph.initials.frustum.near;
	this.camera.far = this.graph.initials.frustum.far;

	var initMatrix = mat4.create();

	mat4.identity(initMatrix);

	var initial = this.graph.initials;
	var trans = initial.translation;
	var rots = initial.rotations;
	var scl = initial.scale;

	mat4.translate(initMatrix,initMatrix,[trans.x,trans.y,trans.z]);

	for(var i=0; i < rots.length;i++)
	{
		if(rots[i].axis == 'x')
			mat4.rotate(initMatrix,initMatrix,rots[i].angle*d2r,[1,0,0]);

		if(rots[i].axis == 'y')
			mat4.rotate(initMatrix,initMatrix,rots[i].angle*d2r,[0,1,0]);

		if(rots[i].axis == 'z')
			mat4.rotate(initMatrix,initMatrix,rots[i].angle*d2r,[0,0,1]);

	}

	mat4.scale(initMatrix,initMatrix,[scl.sx,scl.sy,scl.sz]);

	this.multMatrix(initMatrix);

	console.log(initMatrix);
};

// Handler called when the graph is finally loaded. 
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function () {
	
	this.axis = new CGFaxis(this,this.graph.initials.reference);
	
	this.applyInitials();
	
	this.initLights();

	this.gl.clearColor(this.graph.illumination.background.r, this.graph.illumination.background.g,this.graph.illumination.background.b, this.graph.illumination.background.a);

	this.processMaterials();

	this.processTextures();
	
	this.initAnim();

	this.initLeaves();

	this.nodeProcessor(this.graph.nodes[0]);
};

XMLscene.prototype.isLeaf = function(id){
	for(var i = 0; i < this.graph.leaves.length; i++){
		if(this.graph.leaves[i].id == id)
			return true;
	}

	return false;
}

XMLscene.prototype.processMaterials = function(){
	var mat = this.graph.materials;
	for (var i = 0; i<mat.length; i++) {
		console.log("\n----DEBUG----\n");
		console.log("material: "+ mat[i].id);
		console.log("\n----DEBUG----\n");

	    this.materials[mat[i].id] = new CGFappearance(this);
		this.materials[mat[i].id].setAmbient(mat[i].ambient.r, mat[i].ambient.g, mat[i].ambient.b, mat[i].ambient.a);
		this.materials[mat[i].id].setDiffuse(mat[i].diffuse.r, mat[i].diffuse.g, mat[i].diffuse.b, mat[i].diffuse.a);
		this.materials[mat[i].id].setSpecular(mat[i].specular.r, mat[i].specular.g, mat[i].specular.b, mat[i].specular.a);
		this.materials[mat[i].id].setEmission(mat[i].emission.r, mat[i].emission.g, mat[i].emission.b, mat[i].emission.a);
		this.materials[mat[i].id].setShininess(mat[i].shininess);
	}
}

XMLscene.prototype.processTextures = function(){
	var text = this.graph.textures;
	for (var i = 0; i < text.length; i++) {
		this.textures[text[i].id] = new CGFtexture(this, text[i].path);
		this.textures[text[i].id].path = text[i].path;
		this.textures[text[i].id].amp = {};
		this.textures[text[i].id].amp.s = text[i].amplif_factor.s;
		this.textures[text[i].id].amp.t = text[i].amplif_factor.t;
	}
}

XMLscene.prototype.getMaterial = function(id) {
	if (id == null) 
		return null;

	for (var i = 0; i < this.materials.length; i++)
		if (id == this.materials[i].id) 
			return this.materials[i];
};

XMLscene.prototype.getTexture = function(id) {
	if (id == null) 
		return null;

	for (var i = 0; i < this.textures.length; i++)
		if (id == this.textures[i].id) 
			return this.textures[i];
};


XMLscene.prototype.initLeaves = function(){
	for( var i=0; i < this.graph.leaves.length; i++)
	{
		var leaf = this.graph.leaves[i]; 
		console.log("LEAF:" + this.graph.leaves[i].id);
		switch(leaf.type){
			case "rectangle":{
				this.leaves[leaf.id] = new MyRect(this,leaf.args);
				this.leaves[leaf.id].type = "rectangle";
				break;
			}
			case "sphere":{
				this.leaves[leaf.id] = new MySphere(this,leaf.args);
				this.leaves[leaf.id].type = "sphere";
				break;
			}
			case "triangle":{
				this.leaves[leaf.id] = new MyTriangle(this,leaf.args);
				this.leaves[leaf.id].type = "triangle";
				break;
			}
			case "cylinder":{
				this.leaves[leaf.id] = new MyCylinder(this,leaf.args);
				this.leaves[leaf.id].type = "cylinder";
				break;
			}
			case "plane":{
				this.leaves[leaf.id] = new MyPlane(this,leaf.parts);
				this.leaves[leaf.id].type = "plane";
				break;
			}
			case "patch":{
				this.leaves[leaf.id] = new MyPatch(this,leaf.order, leaf.partsU, leaf.partsV, leaf.control_points);
				this.leaves[leaf.id].type = "patch";
				break;
			}
			case "terrain":{
				this.leaves[leaf.id] = new MyTerrain(this,leaf.texture, leaf.heightmap);
				this.leaves[leaf.id].type = "terrain";
				break;
			}
		}
	}
}

XMLscene.prototype.update = function(current_time){

	for(light in this.lightsEnabled)
	{
		for( var i=0; i < this.graph.lights.length;i++)
		{
			if(this.graph.lights[i].id == light){
				if(this.lightsEnabled[light]){
	               // console.log(this.lightsEnabled[light]);
	               this.lights[i].enable();
           		}
           	else
           		this.lights[i].disable();
           continue;
       		}
   		}
	}
	for(anim in this.graph.animations){

		//if(this.graph.animations[anim].current)
			this.graph.animations[anim].update(current_time);
	}
};

XMLscene.prototype.initAnim = function(){

	for(var i=0; i < this.graph.animations.length; i++){
		this.graph.animations[i].init();
	}
}

XMLscene.prototype.nodeProcessor = function(node) {
	this.pushMatrix();
/*
	console.log("\n----------------DEBUG -> " + node.id + "--------------\n");
	console.log("\nMATERIAL: " + node.material +"\n");
	console.log("\n-----------------DEBUG--------------\n");
*/
	if(node.texture != "null"){
		if(node.material != "null"){
			this.a_material=node.material;
			this.a_texture=node.texture;
			this.materials[node.material].setTexture(this.textures[node.texture]);
			this.materials[node.material].apply();
		}
		else{
			this.a_texture=node.texture;
			this.materials[this.a_material].setTexture(this.textures[node.texture]);
			this.materials[this.a_material].apply();
		}
	}
	else if(node.material != "null"){
		this.a_material=node.material;
		if(this.a_texture != undefined){
			this.materials[node.material].setTexture(this.textures[this.a_texture]);
		}
		this.materials[node.material].apply();
	}

	this.multMatrix(node.m);

	/*
	var anim=node.anim_ref[0];
	//console.log(node.anim_ref[0]);

	
	
	if(anim != undefined ){
	var animMatrix;
		for(var i=0; i < this.graph.animations.length; i++)
		{
			if(this.graph.animations[i].id==anim){
				animMatrix =  this.graph.animations[i].getMatrix();
				if (animMatrix != null){
				this.multMatrix(animMatrix);
				break;
				}
			}
		}			
	}	
	*/
	
	console.log("DESCENDANTS:" + node.descendants);
	for (var i = 0; i < node.descendants.length; i++) {
		if(this.isLeaf(node.descendants[i])){
			if(this.a_texture==undefined){
				this.draw(this.leaves[node.descendants[i]],1,1);
			}
			else{
				this.draw(this.leaves[node.descendants[i]], this.textures[this.a_texture].amp.s, this.textures[this.a_texture].amp.t);
			}
		}
		else
			this.nodeProcessor(this.graph.findNode(node.descendants[i]))
	}

	this.popMatrix();
};

XMLscene.prototype.draw = function(leaf, s, t){
	switch(leaf.type){
			case "rectangle":{
				leaf.updateTex(s,t);
				leaf.display();
				break;
			}
			case "sphere":{
				this.scale(leaf.radius*2,leaf.radius*2,leaf.radius*2);
				leaf.display();
				break;
			}
			case "triangle":{
				leaf.updateTex(s,t);
				leaf.display();
				break;
			}
			case "cylinder":{
				this.scale(1,1,leaf.height);
				leaf.display();
				break;
			}
			case "plane":{
				leaf.display();
				break;
			}
			case "patch":{
				leaf.display();
				break;
			}
			case "terrain":{
				leaf.display();
				break;
			}
		}
}

XMLscene.prototype.display = function () {
	// ---- BEGIN Background, camera and axis setup
   // this.shader.bind();

	
	// Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	// Initialize Model-View matrix as identity (no transformation
	this.updateProjectionMatrix();
    this.loadIdentity();

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();
	// Draw axis

	this.setDefaultAppearance();
	//this.update();
	for (var i = 0; i < this.lights.length; i++)
		this.lights[i].update();

	this.nodeProcessor(this.graph.nodes[0]);

	this.axis.display();

    //this.shader.unbind();

	// ---- END Background, camera and axis setup

	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it
};

