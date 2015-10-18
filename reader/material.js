function Material(id){
	this.id = id;
    this.shininess = 0.0;
    this.ambient = {
        r: 0.0,
        g: 0.0,
        b: 0.0,
        a: 0.0
    };
    this.diffuse = {
        r: 0.0,
        g: 0.0,
        b: 0.0,
        a: 0.0
    };
    this.specular = {
        r: 0.0,
        g: 0.0,
        b: 0.0,
        a: 0.0
    };
    this.emission = {
        r: 0.0,
        g: 0.0,
        b: 0.0,
        a: 0.0
    };
}