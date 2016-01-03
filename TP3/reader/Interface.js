function Interface () {
	CGFinterface.call(this);
}
Interface.prototype = Object.create(CGFinterface.prototype);
Interface.prototype.constructor = Interface;

/*
* init
* Initializing Interface
* @param app application
*/
Interface.prototype.init = function(app){
	CGFinterface.prototype.init.call(this,app);

	this.gui = new dat.GUI();
	this.loaded = 0;
	return true;
}

/*
* update
* Updates Interface
*/
Interface.prototype.update = function(){
	if(this.loaded == 0 && this.scene.lightsLoad)
	{
		// this.loaded = 1;
		// var lightsInterface = this.gui.addFolder("LIGHTS");
		// lightsInterface.open();

		// for(var i in this.scene.lights){

		// 	var nome = "lightEnable" + i;
		// 	lightsInterface.add(this.scene, nome).name("Light " + i);
			
		// }
	}
	
}