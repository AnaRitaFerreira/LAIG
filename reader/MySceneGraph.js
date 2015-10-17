
function MySceneGraph(filename, scene) {
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
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady=function() 
{
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;
	
	// Here should go the calls for different functions to parse the various blocks
	var error = this.parseInitials(rootElement);
	var error = this.parseIllumination(rootElement);
	var error = this.parseLights(rootElement);
	var error = this.parseTextures(rootElement);
	var error = this.parseMaterials(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}	

	this.loadedOk=true;
	
	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};



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
		return ("either zero or more than one" + tag + " element found.");

	}
	return elems[0];
}

MySceneGraph.prototype.parseInitials= function(rootElement) {


	var initials = getUniqueElement(rootElement,'INITIALS');
	var frustum =  getUniqueElement(initials,'frustum');
	var translation =  getUniqueElement(initials,'translation');
	//  -----------------------------------------------------------
	var rotation =  initials.getElementsByTagName('rotation');
	if (rotation == null) {
		return ("rotation element is missing.");
	}

	if (rotation.length != 3) {
		console.log(rotation.length);
		return ("not three rotation elements found.");

	}
	//------------------------------------------------------------------
	var scale =  getUniqueElement(initials,'scale');
	var reference =  getUniqueElement(initials,'reference');

	console.log(rotation.length);

	for(var i = 0; i < rotation.length; i++){
		var axis= this.reader.getString(rotation[i], "axis");
		var angle=this.reader.getFloat(rotation[i],"angle");
		console.log(rotation[i]);
	}
	
	// various examples of different types of access
	
	
	var near = this.reader.getFloat(frustum, "near");
	var far = this.reader.getFloat(frustum, "far");
	var x = this.reader.getFloat(translation, "x");
	var y = this.reader.getFloat(translation, "y");
	var z = this.reader.getFloat(translation, "z");
	var sx = this.reader.getFloat(scale, "sx");
	var sy = this.reader.getFloat(scale, "sy");
	var sz = this.reader.getFloat(scale, "sz");
	var length = this.reader.getFloat(reference, "length");
	console.log(frustum);
	console.log(translation);
	console.log(scale);
	console.log(reference);
	/*this.near = this.reader.getFloat(frustum, 'near');
	this.far = this.reader.getFloat(frustum, 'far');
	this.tx = this.reader.getFloat(translation, 'x');
	this.ty = this.reader.getFloat(translation, 'y');
	this.tz = this.reader.getFloat(translation, 'z');
	this.sx = this.reader.getFloat(scale, 'sx');
	this.sy = this.reader.getFloat(scale, 'sy');
	this.sz = this.reader.getFloat(scale, 'sz');
	this.leng = this.reader.getFloat(reference, 'length');*/
	/*
	this.background = this.reader.getRGBA(globals, 'background');
	this.drawmode = this.reader.getItem(globals, 'drawmode', ["fill","line","point"]);
	this.cullface = this.reader.getItem(globals, 'cullface', ["back","front","none", "frontandback"]);
	this.cullorder = this.reader.getItem(globals, 'cullorder', ["ccw","cw"]);
	*/

	//console.log("Frustum read from file: {background=" + this.background + ", drawmode=" + this.drawmode + ", cullface=" + this.cullface + ", cullorder=" + this.cullorder + "}");
	//console.log("Frustum read from file: {near=" + this.near + ", far=" + this.far "}");
	//console.log("Translate read from file: {x=" + this.x + ", y=" + this.y + ", z=" + this.z + "}");
	/*var init=rootElement.getElementsByTagName('INITIALS');

	if (init == null  || init.length==0) {
		return "initials element is missing.";
	}
	
	this.list=[];
	// iterate over every element
	var nnodes=init[0].children.length;
	for (var i=0; i< nnodes; i++)
	{
		var e=init[0].children[i];

		// process each element and store its information
		this.list[e.id]=e.attributes.getNamedItem("coords").value;  // store element of atribute

		console.log("Read list item id "+ e.id+" with value "+this.list[e.id]);
	};
*/
};

MySceneGraph.prototype.parseIllumination= function(rootElement){
	
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

MySceneGraph.prototype.parseLights= function(rootElement){
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

MySceneGraph.prototype.parseTextures= function(rootElement) {
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

MySceneGraph.prototype.parseMaterials= function(rootElement) {
	var materials = getUniqueElement(rootElement,'MATERIALS');
	var material =  materials.getElementsByTagName('MATERIAL');
	if (material == null) {
		return ("material element is missing.");
	}

	for(var i = 0; i < material.length; i++){
		var id= this.reader.getString(material[i], "id");
		var shininess = getUniqueElement(material[i],'shininess');
		var ambient = getUniqueElement(material[i],'ambient');
		var diffuse = getUniqueElement(material[i],'diffuse');
		var specular = getUniqueElement(material[i],'specular');
		var emission = getUniqueElement(material[i],'emission');

		var value = this.reader.getBoolean(shininess, 'value');
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
		var er = this.reader.getFloat(emission, 'r');
		var eg= this.reader.getFloat(emission, 'g');
		var eb= this.reader.getFloat(emission, 'b');
		var ea= this.reader.getFloat(emission, 'a');

		console.log(material[i]);
}
}

MySceneGraph.prototype.parseLeaves= function(rootElement) {
	var leaves = getUniqueElement(rootElement,'LEAVES');
	var leaf =  leaves.getElementsByTagName('LEAF');
	if (leaf == null) {
		return ("leaf element is missing.");
	}

	for(var i = 0; i < leaf.length; i++){
		var id= this.reader.getString(leaf[i], "id");
		var type= this.reader.getString(leaf[i], "type");
		//var args=this.reader.

}
MySceneGraph.prototype.parseNodes= function(xmlDoc) {
	x = xmlDoc.getElementsByTagName("Node")[0];
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
/*
 * Callback to be executed on any read error
 */
 
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);	
	this.loadedOk=false;
};