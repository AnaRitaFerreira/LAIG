
function Parser(filename, scene) {
	this.loadedOk = null;
	
	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;
		
	// File reading 
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */
	 
	this.reader.open('scenes/'+filename, this);  


	// Scene graph data
    this.initials = new Initials();
    this.illumination = new Illumination();
    this.lights = [];
    this.textures = [];
    this.materials = [];
    this.animations=[];
    this.leaves = [];
    this.root = null;
    this.root_node=null;
    this.nodes = [];

}

/*
 * Callback to be executed after successful reading
 */
Parser.prototype.onXMLReady=function() {
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;
	
	// Here should go the calls for different functions to parse the various blocks
	var error = this.parseInitials(rootElement);
	var error = this.parseIllumination(rootElement);
	var error = this.parseLights(rootElement);
	var error = this.parseTextures(rootElement);
	var error = this.parseMaterials(rootElement);
	var error = this.parseAnimations(rootElement);
	var error = this.parseLeaves(rootElement);
	var error = this.parseNodes(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}	

	this.loadedOk=true;
	
	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//												     AUX FUCNTIONS 													 //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/*
 * Example of method that parses elements of one block and stores information in a specific data structure
 */
function getUniqueElement(nametag,tag) {
 	var elems =  nametag.getElementsByTagName(tag);
	if (elems == null) {
		return (tag + " element is missing.");
	}

	if (elems.length != 1) {
		console.log(elems.length);
		return ("either zero or more than one " + tag + " element found.");

	}
	return elems[0];
}

Parser.prototype.rgbaElement = function(element) {
    var rgba = {};
    rgba.r = this.reader.getFloat(element, 'r');
    rgba.g = this.reader.getFloat(element, 'g');
    rgba.b = this.reader.getFloat(element, 'b');
    rgba.a = this.reader.getFloat(element, 'a');
    return rgba;
};

Parser.prototype.findNode = function(id) {
    for (i = 0; i < this.nodes.length; i++){
        if (this.nodes[i].id == id) 
        	return this.nodes[i];
    }

    return null;
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//												     INITIALS    													 //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


Parser.prototype.parseInitials= function(rootElement) {


	var initials = getUniqueElement(rootElement,'INITIALS');
	var frustum =  getUniqueElement(initials,'frustum');
	var translation =  getUniqueElement(initials,'translation');
	var rotation =  initials.getElementsByTagName('rotation');
	if (rotation == null) {
		return ("rotation element is missing.");
	}

	if (rotation.length != 3) {
		console.log(rotation.length);
		return ("not three rotation elements found.");

	}
	var scale =  getUniqueElement(initials,'scale');
	var reference =  getUniqueElement(initials,'reference');

	for(var i = 0; i < rotation.length; i++){

		var tempRot = {
			axis: null,
			angle: null
		};

		tempRot.axis= this.reader.getItem(rotation[i], "axis", ['x','y','z']);
		tempRot.angle=this.reader.getFloat(rotation[i],"angle");
		this.initials.rotations.push(tempRot);
		console.log(tempRot);
	}
	
	// various examples of different types of access
	
	
	this.initials.frustum.near = this.reader.getFloat(frustum, "near");
	this.initials.frustum.far = this.reader.getFloat(frustum, "far");
	this.initials.translation.x = this.reader.getFloat(translation, "x");
	this.initials.translation.y = this.reader.getFloat(translation, "y");
	this.initials.translation.z = this.reader.getFloat(translation, "z");
	this.initials.scale.sx = this.reader.getFloat(scale, "sx");
	this.initials.scale.sy = this.reader.getFloat(scale, "sy");
	this.initials.scale.sz = this.reader.getFloat(scale, "sz");
	this.initials.reference = this.reader.getFloat(reference, "length");
	console.log(frustum);
	console.log(translation);
	console.log(scale);
	console.log(reference);

};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//												     ILLUMINATION  													 //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


Parser.prototype.parseIllumination= function(rootElement){
	
	var illumination = getUniqueElement(rootElement,'ILLUMINATION');
	var ambient =  getUniqueElement(illumination,'ambient');
	var background =  getUniqueElement(illumination,'background');


	this.illumination.ambient = this.rgbaElement(ambient);
	this.illumination.background = this.rgbaElement(background);
	console.log("background R: " + this.illumination.background.r);
	console.log("background G: " + this.illumination.background.g);
	console.log("background B: " + this.illumination.background.b);
	console.log("background A: " + this.illumination.background.a);
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//												     LIGHTS    														 //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


Parser.prototype.parseLights= function(rootElement){
	var array_lights = getUniqueElement(rootElement,'LIGHTS');
	var light =  array_lights.getElementsByTagName('LIGHT');
	if (light == null) {
		return ("light element is missing.");
	}

	for(var i = 0; i < light.length; i++){
		
		var lgt = new Light(light[i].getAttribute('id'));

		var enable = getUniqueElement(light[i],'enable');
		var position = getUniqueElement(light[i],'position');
		var ambient = getUniqueElement(light[i],'ambient');
		var diffuse = getUniqueElement(light[i],'diffuse');
		var specular = getUniqueElement(light[i],'specular');

		
		lgt.enabled = this.reader.getBoolean(enable, 'value');
        var pos = {};
		pos.x = this.reader.getFloat(position, 'x');
		pos.y = this.reader.getFloat(position, 'y');
		pos.z = this.reader.getFloat(position, 'z');
		pos.w = this.reader.getFloat(position, 'w');
    	lgt.position=pos;
    	console.log(pos);
		lgt.ambient = this.rgbaElement(ambient);
		lgt.diffuse = this.rgbaElement(diffuse);
		lgt.specular = this.rgbaElement(specular);
		
		
		console.log(lgt);
		console.log("LUZES:" + lgt.enabled);
		this.lights.push(lgt);
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//												     TEXTURES 														 //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


Parser.prototype.parseTextures= function(rootElement) {
	var array_textures = getUniqueElement(rootElement,'TEXTURES');
	var texture =  array_textures.getElementsByTagName('TEXTURE');
	if (texture == null) {
		return ("texture element is missing.");
	}

	for(var i = 0; i < texture.length; i++){
		var txt = new Texture(texture[i].getAttribute('id'));
		var file = getUniqueElement(texture[i],'file');
		var amplif_factor = getUniqueElement(texture[i],'amplif_factor');

		txt.path = this.reader.getString(file, 'path');
		var ampfac ={};
		ampfac.s = this.reader.getFloat(amplif_factor, 's');
		ampfac.t = this.reader.getFloat(amplif_factor, 't');
		txt.amplif_factor=ampfac;

		
		this.textures.push(txt);
	}
	
}	


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//												MATERIALS 															 //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



Parser.prototype.parseMaterials= function(rootElement) {
	var array_material = getUniqueElement(rootElement,'MATERIALS');
	var material =  array_material.getElementsByTagName('MATERIAL');
	if (material == null) {
		return ("material element is missing.");
	}

	for(var i = 0; i < material.length; i++){

		var mat = new Material(material[i].getAttribute('id'));

		var shininess = getUniqueElement(material[i],'shininess');
		var ambient = getUniqueElement(material[i],'ambient');
		var diffuse = getUniqueElement(material[i],'diffuse');
		var specular = getUniqueElement(material[i],'specular');
		var emission = getUniqueElement(material[i],'emission');
		console.log(this.reader.getFloat(shininess, 'value'));
		mat.shininess = this.reader.getFloat(shininess, 'value');
		mat.ambient = this.rgbaElement(ambient);
		mat.diffuse = this.rgbaElement(diffuse);
		mat.specular = this.rgbaElement(specular);
		mat.emission = this.rgbaElement(emission);

		console.log("AMB R:" + mat.ambient.r);

		this.materials.push(mat);
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//												Animations															 //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Parser.prototype.parseAnimations= function(rootElement) {
	var array_animation= getUniqueElement(rootElement, 'ANIMATIONS');
	var animation = array_animation.getElementsByTagName('ANIMATION');
	if(animation==null)
		return ("animation element is missing.");

	for(var i=0; i<animation.length;i++){
		var id = animation[i].getAttribute('id');
    	var span = animation[i].getAttribute('span');
    	var type = animation[i].getAttribute('type');

    	if(type=="linear"){
    		var linear = new LinearAnimation(id, span);
    		var ctr_pt=animation[i].getElementsByTagName('controlpoint');
    		for(var j=0;j<ctr_pt.length;j++){
    			var cntr_p=[];
    			cntr_p.push(this.reader.getFloat(ctr_pt[j],'xx'));
    			cntr_p.push(this.reader.getFloat(ctr_pt[j],'yy'));
    			cntr_p.push(this.reader.getFloat(ctr_pt[j],'zz'));
    			linear.control_points.push(cntr_p);
    		}
    		this.animations.push(linear);
    	}
    	else if(type=="circular"){
    		var circular = new CircularAnimation(id, span);
    		var center = this.reader.getVector3(animation[i],'center');
        	var radius = this.reader.getFloat(animation[i],'radius');
        	var startang = this.reader.getFloat(animation[i],'startang');
        	var rotang = this.reader.getFloat(animation[i],'rotang');
        	circular.center=center; circular.radius= radius; circular.startang= startang; circular.rotang= rotang; 
        	this.animations.push(circular);
    	}
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//												     LEAVES    														 //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


Parser.prototype.parseLeaves= function(rootElement) {
	var array_leaves = getUniqueElement(rootElement,'LEAVES');
	var leaf =  array_leaves.getElementsByTagName('LEAF');
	if (leaf == null) {
		return ("leaf element is missing.");
	}

	for(var i = 0; i < leaf.length; i++){
		var lf = new Leaf(leaf[i].getAttribute('id'));
		lf.type= this.reader.getItem(leaf[i], 'type', ['rectangle', 'cylinder', 'sphere', 'triangle', 'plane', 'patch', 'vehicle', 'terrain']);
		console.log("LEAF TYPE: " + lf.type);
		if(lf.type!="terrain" && lf.type!="vehicle" && lf.type!="patch" && lf.type!="plane"){
			var args_aux = leaf[i].getAttribute('args').split(" ");
		}
		switch(lf.type){
			case "rectangle":{
				if (args_aux.length != 4)
					return "Invalid number of arguments for type 'rectangle'";

				for (var j = 0; j < args_aux.length; j++)
					lf.args.push(parseFloat(args_aux[j]));
				console.log("LEAF NAME:" + args_aux);

				break;
			}
			case "cylinder":{
				if (args_aux.length != 5)
					return "Invalid number of arguments for type 'cylinder'";

				lf.args.push(parseFloat(args_aux[0]));
				lf.args.push(parseFloat(args_aux[1]));
				lf.args.push(parseFloat(args_aux[2]));
				lf.args.push(parseInt(args_aux[3]));
				lf.args.push(parseInt(args_aux[4]));
			}
			break;

			case "triangle":{

				if (args_aux.length != 9)
					return "Invalid number of arguments for type 'triangle'";

				for (j = 0; j < args_aux.length; j++)
					lf.args.push(parseFloat(args_aux[j]));
				break;
			}
			case "sphere":{
				if (args_aux.length != 3)
					return "Invalid number of arguments for type 'sphere'";

				lf.args.push(parseFloat(args_aux[0]));
				lf.args.push(parseInt(args_aux[1]));
				lf.args.push(parseInt(args_aux[2]));
				break;
			}
			case "plane":{
				lf.parts=this.reader.getFloat(leaf[i],'parts');
				break;
			}
			case "patch":{
				lf.order=this.reader.getFloat(leaf[i],'order');
				lf.partsU=this.reader.getFloat(leaf[i],'partsU');
				lf.partsV=this.reader.getFloat(leaf[i],'partsV');
				var child = leaf[i].children;
				console.log("chega");
				for(j=0; j<child.length; j++){
					if(child[j].tagName == "controlpoint"){
						console.log(child[j].tagName);
						var cntr_p=[];
    					cntr_p.push(this.reader.getFloat(child[j],'x'));
    					cntr_p.push(this.reader.getFloat(child[j],'y'));
    					cntr_p.push(this.reader.getFloat(child[j],'z'));
    					lf.control_points.push(cntr_p);
					}
				}
				break;
			}
			case "terrain":{
				lf.texture=this.reader.getString('texture');
				lf.heightmap=this.reader.getString('heightmap');
				break;
			}
			default:{
				return "Type " + "\"" + lf.type + "\" not valid.";
			}

		}
		//var args=this.reader.
		this.leaves.push(lf);
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//												     NODES    														 //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



Parser.prototype.parseNodes= function(rootElement) {

	var array_nodes = getUniqueElement(rootElement,'NODES');
	var root_nd = getUniqueElement(array_nodes,'ROOT');
	this.root=this.reader.getString(root_nd,"id");
	this.root_node = new Node(this.root);
	console.log('Root ID: ' + this.root_node.id);

	var nodes =  array_nodes.getElementsByTagName('NODE');
	
	if (nodes == null) {
		return ("node element is missing.");
	}


	for(var i = 0; i < nodes.length; i++){

		var nd = new Node(nodes[i].getAttribute('id'));
		var mat =getUniqueElement(nodes[i],'MATERIAL');
		var text = getUniqueElement(nodes[i],'TEXTURE');
		nd.material = mat.id;
		nd.texture = text.id;
		console.log(nd.id);

		var child = nodes[i].children;
		for(j=0; j<child.length; j++){
			if(child[j].tagName == "TRANSLATION"){
				var translation = [];
				translation.push(this.reader.getFloat(child[j], "x"));
				translation.push(this.reader.getFloat(child[j], "y"));
				translation.push(this.reader.getFloat(child[j], "z"));
				console.log("Translation: " + translation);
				mat4.translate(nd.m, nd.m, translation);
			}
			else if(child[j].tagName == "SCALE"){
				var scale = [];
				scale.push(this.reader.getFloat(child[j], "sx"));
				scale.push(this.reader.getFloat(child[j], "sy"));
				scale.push(this.reader.getFloat(child[j], "sz"));
				console.log("Scale: " + scale);
				mat4.scale(nd.m, nd.m, scale);
			}
			else if(child[j].tagName == "ROTATION"){
				var rotation = [0,0,0];
				var axis = this.reader.getItem(child[j], "axis", ["x", "y", "z"]);
				var angle = this.reader.getFloat(child[j], "angle") * (Math.PI / 180);
				rotation[["x", "y", "z"].indexOf(axis)] = 1;
				console.log("Rotation: " + rotation);
				mat4.rotate(nd.m, nd.m, angle, rotation);
			}
			else if(child[j].tagName=="ANIMATIONREF"){
				var anim_ref=child[j].getAttribute('id');
			}
		}
		
		var desc = getUniqueElement(nodes[i], 'DESCENDANTS');
		var dlist = desc.getElementsByTagName('DESCENDANT');
		if (dlist.length < 1) 
			return "No DESCENDANT found";

		for (j = 0; j < dlist.length; j++) {
			nd.descendants.push(dlist[j].getAttribute('id'));
		}
		console.log(nd.material)
		this.nodes.push(nd);
	}
}


/*
 * Callback to be executed on any read error
 */
 
Parser.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);	
	this.loadedOk=false;
};