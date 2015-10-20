var d2r=Math.PI/180;

function XMLscene() {
    CGFscene.call(this);
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    
    this.enableTextures(true);

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

	
	this.grafo=[];

	this.textures = [];
    this.materials = [];
    this.leaves = [];
    this.nodes = [];
    this.lightsEnabled = [];
	this.axis=new CGFaxis(this);
	this.materialDefault = new CGFappearance(this);
};

XMLscene.prototype.initLights = function(){

	this.shader.bind();

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
	this.shader.unbind();

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

XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.setDefaultAppearance = function () {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);	
};

XMLscene.prototype.setInterface = function(interface){
	this.interface=interface;
};

// Handler called when the graph is finally loaded. 
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function () {
	
	this.axis = new CGFaxis(this,this.graph.initials.reference);
	
	this.applyInitials();
	this.initLights();
	this.gl.clearColor(this.graph.illumination.background.r, this.graph.illumination.background.g,this.graph.illumination.background.b, this.graph.illumination.background.a);


	var mat = this.graph.materials;
	for (i = 0; i < mat.length; i++) {
		material = new ScMaterial(this, mat[i].id);
		material.setAmbient(mat[i].ambient.r, mat[i].ambient.g, mat[i].ambient.b, mat[i].ambient.a);
		material.setDiffuse(mat[i].diffuse.r, mat[i].diffuse.g, mat[i].diffuse.b, mat[i].diffuse.a);
		material.setSpecular(mat[i].specular.r, mat[i].specular.g, mat[i].specular.b, mat[i].specular.a);
		material.setEmission(mat[i].emission.r, mat[i].emission.g, mat[i].emission.b, mat[i].emission.a);
		material.setShininess(mat[i].shine);

		this.materials.push(material);
	}

	var text = this.graph.textures;
	for (var i = 0; i < text.length; i++) {
		texture = new ScTexture(this, text[i].id, text[i].path, text[i].amplif_factor);

		this.textures.push(texture);
	}


	this.initLeaves();

	this.initNodes();
	
};

function ScTexture(scene, id, path, amplif_factor) {
	CGFtexture.call(this, scene, path);
	this.id = id;
	this.amplif_factor = amplif_factor;
}
ScTexture.prototype = Object.create(CGFtexture.prototype);
ScTexture.prototype.constructor = ScTexture;

function ScMaterial(scene, id) {
	CGFappearance.call(this, scene);
	this.id = id;
}
ScMaterial.prototype = Object.create(CGFappearance.prototype);
ScMaterial.prototype.constructor = ScMaterial;


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
				var primitive = new MyRect(this,leaf.args);
				primitive.id=leaf.id;
				this.leaves.push(primitive);
				break;
			}
			case "sphere":{
				var primitive = new MySphere(this,leaf.args);
				primitive.id = leaf.id;
				this.leaves.push(primitive);
				break;
			}
			case "triangle":{
				var primitive = new MyTriangle(this,leaf.args);
				primitive.id = leaf.id;
				this.leaves.push(primitive);
				break;
			}
			case "cylinder":{
				var primitive = new MyCylinder(this,leaf.args);
				primitive.id = leaf.id;
				this.leaves.push(primitive);
				break;
			}
		}
	}
}

XMLscene.prototype.initNodes = function() {
	var nodes_list = this.graph.nodes;	
	this.DFS(this.graph.nodes[0], this.graph.nodes[0].material.id, this.graph.nodes[0].texture.id,  this.graph.nodes[0].m);
};


XMLscene.prototype.update = function(){

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
};


XMLscene.prototype.DFS = function(node, currMaterial, currTexture, currMatrix) {
	var nextMat = node.material;
	if (node.material == "null") 
		nextMat = currMaterial;

	var nextTex = node.texture;
	
	if (node.texture == "null") 
		nextTex = currTexture;
	else if (node.texture == "clear") 
		nextTex = null;

	var nextMatrix = mat4.create();
	mat4.multiply(nextMatrix, currMatrix, node.m);
	console.log("DESCENDANTS:" + node.descendants);
	for (var i = 0; i < node.descendants.length; i++) {
		var nextNode = this.graph.findNode(node.descendants[i]);
		if (nextNode == null) {
			var aux = new Node(node.descendants[i]);
			aux.material = this.getMaterial(nextMat);
			aux.texture = this.getTexture(nextTex);
			aux.m = nextMatrix;
			for (var j = 0; j < this.leaves.length; j++) {
				if (this.leaves[j].id == aux.id) {
					aux.primitive = this.leaves[j];
					break;
				}
			}
			this.nodes.push(aux);
			continue;
		}
		this.DFS(nextNode, nextMat, nextTex, nextMatrix);
	}
};

XMLscene.prototype.display = function () {
	// ---- BEGIN Background, camera and axis setup
    this.shader.bind();

	
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

    // Nodes
    for (i = 0; i < this.nodes.length; i++) {
    	var node = this.nodes[i];
    	this.pushMatrix();
    	if(node.material != null)
    		node.material.setTexture(node.texture);
    	else{
    		node.material = this.materialDefault;
    		node.material.setTexture(node.texture);
    	}
    	if (node.texture != null) {
    		node.primitive.updateTex(node.texture.amplif_factor.s, node.texture.amplif_factor.t);
    	}


    	if(node.material != null)
    		node.material.apply();
    	this.multMatrix(node.m);
    	
    	node.primitive.display();
    	this.popMatrix();
    }


    
	this.axis.display();

this.shader.unbind();

	// ---- END Background, camera and axis setup

	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it
};

