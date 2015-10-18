
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
    this.leaves = [];
    this.root = null;
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
	var error = this.parseLeaves(rootElement);
	//var error = this.parseNodes(rootElement);

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

	var ar = this.reader.getFloat(ambient, 'r');
	var ag = this.reader.getFloat(ambient, 'g');
	var ab = this.reader.getFloat(ambient, 'b');
	var aa = this.reader.getFloat(ambient, 'a');
	var br = this.reader.getFloat(background, 'r');
	var bg = this.reader.getFloat(background, 'g');
	var bb = this.reader.getFloat(background, 'b');
	var ba = this.reader.getFloat(background, 'a');
	console.log(ambient);
	console.log(background);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//												     LIGHTS    														 //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


Parser.prototype.parseLights= function(rootElement){
	var lights = getUniqueElement(rootElement,'LIGHTS');
	var light =  lights.getElementsByTagName('LIGHT');
	if (light == null) {
		return ("light element is missing.");
	}

	for(var i = 0; i < light.length; i++){
		var id= this.reader.getString(light[i], "id");
		var enable = getUniqueElement(light[i],'enable');
		var position = getUniqueElement(light[i],'position');
		var ambient = getUniqueElement(light[i],'ambient');
		var diffuse = getUniqueElement(light[i],'diffuse');
		var specular = getUniqueElement(light[i],'specular');

		var value = this.reader.getBoolean(enable, 'value');
		var x = this.reader.getFloat(position, 'x');
		var y = this.reader.getFloat(position, 'y');
		var z = this.reader.getFloat(position, 'z');
		var w = this.reader.getFloat(position, 'w');
		var ar = this.reader.getFloat(ambient, 'r');
		var ag= this.reader.getFloat(ambient, 'g');
		var ab= this.reader.getFloat(ambient, 'b');
		var aa= this.reader.getFloat(ambient, 'a');
		var dr = this.reader.getFloat(diffuse, 'r');
		var dg= this.reader.getFloat(diffuse, 'g');
		var db= this.reader.getFloat(diffuse, 'b');
		var da= this.reader.getFloat(diffuse, 'a');
		var sr = this.reader.getFloat(specular, 'r');
		var sg= this.reader.getFloat(specular, 'g');
		var sb= this.reader.getFloat(specular, 'b');
		var sa= this.reader.getFloat(specular, 'a');

		console.log(light[i]);
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//												     TEXTURES 														 //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


Parser.prototype.parseTextures= function(rootElement) {
	var textures = getUniqueElement(rootElement,'TEXTURES');
	var texture =  textures.getElementsByTagName('TEXTURE');
	if (texture == null) {
		return ("texture element is missing.");
	}

	for(var i = 0; i < texture.length; i++){
		var id= this.reader.getString(texture[i], "id");
		var file = getUniqueElement(texture[i],'file');
		var amplif_factor = getUniqueElement(texture[i],'amplif_factor');

		var path = this.reader.getString(file, 'path');
		var s = this.reader.getFloat(amplif_factor, 's');
		var t = this.reader.getFloat(amplif_factor, 't');

		console.log(texture[i]);
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

		console.log(material[i]);

		this.materials.push(material);
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//												     LEAVES    														 //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


Parser.prototype.parseLeaves= function(rootElement) {
	var leaves = getUniqueElement(rootElement,'LEAVES');
	var leaf =  leaves.getElementsByTagName('LEAF');
	if (leaf == null) {
		return ("leaf element is missing.");
	}

	for(var i = 0; i < leaf.length; i++){
		var id= this.reader.getString(leaf[i], "id");
		var type= this.reader.getString(leaf[i], "type");
		//var args=this.reader.
		console.log(leaf[i]);
	}
}



/*
Parser.prototype.parseNodes= function(rootElement) {
	var nodes = getUniqueElement(rootElement,'NODES');
	var root = getUniqueElement(nodes,'ROOT');
	var rootid=this.reader.getString(root[0],"id");
	var node =  nodes.getElementsByTagName('NODE');
	if (node == null) {
		return ("node element is missing.");
	}

	for(var i = 0; i < node.length; i++){
		var id= this.reader.getString(node[i], "id");
		var translation = getUniqueElement(node[i],'TRANSLATION');
		var rotation = getUniqueElement(node[i],'ROTATION');
		var scale = getUniqueElement(node[i],'SCALE');
		var material = getUniqueElement(node[i],'MATERIAL');
		var texture = getUniqueElement(node[i],'TEXTURE');

		var matid = this.reader.getString(material, 'id');
		var desc = nodes[i].getElementsByTagName('DESCENDANTS')[0];
        if (desc == null) return "No DESCENDANTS  found";

        var dlist = desc.getElementsByTagName('DESCENDANT');
        if (dlist.length < 1) return "DESCENDANTS not found";

        for (j = 0; j < dlist.length; j++) {
           // node.descendants.push(dlist[j].getAttribute('id'));
        }

        
		
		console.log(node[i]);
	}}

	/*x = xmlDoc.getElementsByTagName("Node")[0];
	xlen = x.childNodes.length;
	y = x.firstChild;

	txt = "";
	for (i = 0; i <xlen; i++) {
  	// Process only element nodes (type 1)
 	 if (y.nodeType == 1) {
   		 txt += y.nodeName + "<br>";
	  }
 	 y = y.nextSibling;
	};
}; 
*/


/*
 * Callback to be executed on any read error
 */
 

Parser.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);	
	this.loadedOk=false;
};