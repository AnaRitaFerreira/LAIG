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
   	this.desc = 0;

   	this.doublePick = false;
   	this.lastObj = -1;
   	this.playerType = 2;	// black = 0 | white = 1
   	this.board = [];
	this.axis=new CGFaxis(this);
	this.setUpdatePeriod(10);
	this.rect = new MyRect(this,[0, 1, 1, 0]);
	this.setPickEnabled(true);
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

	this.initBoard();

	this.drawBoard();
	//this.createBoard();

	//this.createPiece(1,1,"white_piece");
	//this.nodeProcessor(this.graph.nodes[0]);
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//												     PICKING  														 //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
XMLscene.prototype.logPicking = function (){
	if (this.pickMode == false) {
		if (this.pickResults != null && this.pickResults.length > 0) {
			for (var i=0; i< this.pickResults.length; i++) {
				var obj = this.pickResults[i][0];
				if (obj)
				{
					var customId = this.pickResults[i][1];	
					if(customId == this.lastObject){ // DOUBLE PICK
						this.lastObject = -1;
						console.log("DOUBLE PICKING - Picked object: " + obj + ", with pick id " + customId );
					}
					else{ // SIMPLE PICK
						console.log("Picked object: " + obj + ", with pick id " + customId);
						this.lastObject = customId;
					}			
				}
					//make move (check wich player is - this.playerType)
				
			}
			this.pickResults.splice(0,this.pickResults.length);
		}		
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//												 PROLOG CONNECTION													 //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
XMLscene.prototype.getPrologRequest = function(requestString, onSuccess, onError, port){

	var requestPort = port || 8081
	var request = new XMLHttpRequest();
	request.open('GET', 'http://localhost:'+requestPort+'/'+requestString, true);

	request.onload = onSuccess || function(data){console.log("Request successful. Reply: " + data.target.response);};
	request.onerror = onError || function(){console.log("Error waiting for response");};

	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	request.send();
}

XMLscene.prototype.initBoard = function(){
	var request = "board";
	
	/*
	var a1 = [0,0,0];
	var a2 = [0,0,1];
	if(a1.length != a2.length)
		console.log("not equal");
	for(var i = 0; i<a1.length; i++){
		if(a1[i]!=a2[i])
			console.log("not equal");
	}
	*/
	var self = this;
	this.getPrologRequest(request, function(data) {
        var board = data.target.response;

        self.board = JSON.parse(board);
    	
        console.log(self.board[0]);
        console.log(self.board.length);
        // console.log("[" + typeof array + "]");
        /*
        var test = new Board(self,self.graph, array);
         test.display();
        self.initNodes();
        */
    });
}

XMLscene.prototype.fillBoard = function(){
	for (var i = 0; i < this.board.length; i++) {
		for (var j = 0; j < this.board.length; j++) {
			if(this.board[i][j]=='0'){
				this.drawPiece(j,i,"black_piece");
			}
			else if(this.board[i][j]==1){
				this.drawPiece(j,i,"white_piece");
			}
		}
	}
}

XMLscene.prototype.drawCube = function (texture) {
	var args = [0, 1, 1, 0]; 
	var cube = [];
	var matrixf = mat4.create();
	var matrixb = mat4.create();
	var matrixl = mat4.create();
	var matrixr = mat4.create();
	var matrixt = mat4.create();
	var matrixbt = mat4.create();
	var front_translation = [0, 0, 1];
	var back_rotation = [0,1,0];
	var back_translation = [1,0,0];
	var left_rotation = [0,1,0];
	var right_rotation = [0,1,0];
	var right_translation = [1,0,1];
	var top_translation = [0,1,1];
	var top_rotation = [1,0,0];
	var bottom_rotation = [1,0,0];
	this.rect.type = "rectangle";
	this.rect.texture = texture;

	this.pushMatrix();
	mat4.translate(matrixf, matrixf, front_translation);
	this.multMatrix(matrixf);
	this.draw(this.rect,texture.amp.s,texture.amp.t);
	this.popMatrix();

	this.pushMatrix();
	mat4.translate(matrixb, matrixb, back_translation);
	mat4.rotate(matrixb, matrixb, 180*d2r, back_rotation);
	this.multMatrix(matrixb);
	this.draw(this.rect,texture.amp.s,texture.amp.t);
	this.popMatrix();

	this.pushMatrix();
	mat4.rotate(matrixl, matrixl, -90*d2r, left_rotation);
	this.multMatrix(matrixl);
	this.draw(this.rect,texture.amp.s,texture.amp.t);
	this.popMatrix();

	this.pushMatrix();
	mat4.translate(matrixr, matrixr, right_translation);
	mat4.rotate(matrixr, matrixr, 90*d2r, right_rotation);
	this.multMatrix(matrixr);
	this.draw(this.rect,texture.amp.s,texture.amp.t);
	this.popMatrix();

	this.pushMatrix();
	mat4.translate(matrixt, matrixt, top_translation);
	mat4.rotate(matrixt, matrixt, -90*d2r, top_rotation);
	this.multMatrix(matrixt);
	this.draw(this.rect,texture.amp.s,texture.amp.t);
	this.popMatrix();

	this.pushMatrix();
	mat4.rotate(matrixbt, matrixbt, 90*d2r, bottom_rotation);
	this.multMatrix(matrixbt);
	this.draw(this.rect,texture.amp.s,texture.amp.t);
	this.popMatrix();
}

XMLscene.prototype.drawBoard = function () {
	var board_size=11;
	var texture = this.textures["board"];
	for(var i=0; i<board_size;i++){
		for(var j=0; j<board_size;j++){
			var matrix = mat4.create();
			this.pushMatrix();
			mat4.translate(matrix, matrix, [i,0,j]);
			this.multMatrix(matrix);
			this.drawCube(texture); 
			this.popMatrix();
		}
	}
}

XMLscene.prototype.drawPiece = function (x,z,color) {
	var matrix = mat4.create();
	var texture = this.textures[color];
	this.pushMatrix();
	mat4.translate(matrix, matrix, [-0.25+x,1,-0.25+z]);
	mat4.scale(matrix, matrix, [0.5,0.3,0.5]);
	this.multMatrix(matrix);
	this.drawCube(texture); 
	this.popMatrix();
}

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
	this.desc++;
	this.registerForPick(this.desc, leaf);
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

	this.logPicking();
	this.clearPickRegistration();
	
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
	this.desc = 0;
	//this.nodeProcessor(this.graph.nodes[0]);

	//console.log("Teste: " + this.textures["board"].amp.s);


	this.axis.display();
	this.drawBoard();
	this.fillBoard();
	//this.createPiece();
    //this.shader.unbind();

	// ---- END Background, camera and axis setup

	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it
};