function MyTerrain(scene, texture, heightmap) {
    CGFobject.call(this, scene);

	this.heightmap = new CGFtexture(scene, "textures/"+heightmap);
	this.scene = scene;
	this.texture = new CGFtexture(scene, "textures/"+texture);
    this.appearance = new CGFappearance(scene);
	this.shader = new CGFshader(scene.gl,"shaders/terrain.vert", "shaders/terrain.frag");
	this.plane = new MyPlane(scene, 30);
	
    this.initBuffers();
 
 };

MyTerrain.prototype = Object.create(CGFobject.prototype);
MyTerrain.prototype.constructor = MyTerrain;

MyTerrain.prototype.initBuffers = function() {
    
	this.appearance.setTexture(this.texture);
	this.appearance.setTextureWrap ('REPEAT', 'REPEAT');

	this.appearance.setAmbient(0.5, 0.5, 0.5, 1);
	this.appearance.setDiffuse(0.5, 0.5, 0.5, 1);
	this.appearance.setSpecular(0.0, 0.0, 0.0, 1);	
	this.appearance.setShininess(10);

	this.shader.setUniformsValues({uSampler2: 1});
    this.shader.setUniformsValues({yRatio: 0.5});
	
}

MyTerrain.prototype.display = function() {

	this.appearance.apply();
	this.scene.setActiveShader(this.shader);
	this.scene.pushMatrix();

    this.heightmap.bind(1);

	this.plane.display();			
	this.scene.popMatrix();
	this.scene.setActiveShader(this.scene.defaultShader);	
}