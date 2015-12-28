function Interface() {
	CGFinterface.call(this);
};

Interface.prototype = Object.create(CGFinterface.prototype);
Interface.prototype.constructor = Interface;

Interface.prototype.init = function(application){

	CGFinterface.prototype.init.call(this, application);

	this.gui = new dat.GUI();

	//this.gui.add(this.scene, 'LightsInterface');



};

Interface.prototype.callLight = function()
{
	
	var group = this.gui.addFolder("Lights");

	for(light in this.scene.lightsEnabled)
		group.add(this.scene.lightsEnabled, light);

};