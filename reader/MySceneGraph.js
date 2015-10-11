
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
	var error = this.parseGlobalsExample(rootElement);

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
function getUniqueElement(rootElement,tag) {
 	var elems =  rootElement.getElementsByTagName(tag);
	if (elems == null) {
		return (tag + " element is missing.");
	}

	if (elems.length != 1) {
		console.log(elems.length);
		return ("either zero or more than one" + tag + " element found.");

	}
	return elems[0];
}

MySceneGraph.prototype.parseGlobalsExample= function(rootElement) {


	var initials = getUniqueElement(rootElement,'INITIALS');
	var globals =  getUniqueElement(initials,'globals');
	var frustum =  getUniqueElement(initials,'frustum');
	var translate =  getUniqueElement(initials,'translate');
	var scale =  getUniqueElement(initials,'scale');
	var reference =  getUniqueElement(initials,'reference');
	
	// various examples of different types of access
	var near = this.reader.getFloat(frustum, "near");
	var far = this.reader.getFloat(frustum, "far");
	var x = this.reader.getFloat(translate, "x");
	var y = this.reader.getFloat(translate, "y");
	var z = this.reader.getFloat(translate, "z");
	var sx = this.reader.getFloat(scale, "sx");
	var sy = this.reader.getFloat(scale, "sy");
	var sz = this.reader.getFloat(scale, "sz");
	var length = this.reader.getFloat(reference, "length");

	/*
	this.background = this.reader.getRGBA(globals, 'background');
	this.drawmode = this.reader.getItem(globals, 'drawmode', ["fill","line","point"]);
	this.cullface = this.reader.getItem(globals, 'cullface', ["back","front","none", "frontandback"]);
	this.cullorder = this.reader.getItem(globals, 'cullorder', ["ccw","cw"]);
	*/

	console.log("Globals read from file: {background=" + this.background + ", drawmode=" + this.drawmode + ", cullface=" + this.cullface + ", cullorder=" + this.cullorder + "}");

	var init=rootElement.getElementsByTagName('INITIALS');

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
		//this.list[e.id]=e.attributes.getNamedItem("coords").value;  // store element of atribute

		console.log("Read list item id "+ e.id+" with value "+this.list[e.id]);
	};

};
	
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