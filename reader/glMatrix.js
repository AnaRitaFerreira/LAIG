var pMatrix = mat4.create();
	var mvMatrixStack = [];
    
    function pushMatrix(someMatrix) {
        var copy = mat4.create();
        mat4.copy(copy, someMatrix);
        mvMatrixStack.push(copy);
    }

    function popMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        return mvMatrixStack.pop();
    }


    function setMatrixUniforms() {
	    //gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        //gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    }


    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }


    
    function drawScene() {

		// create matrix
		var a = mat4.create();
		console.log("Matrix A created: " + a);
		
		// set to identity
        mat4.identity(a);
		console.log("Matrix A after identity: " + a);
		
		// add  translation
        mat4.translate(a, a, [-1.5, 0.0, -7.0]);
		console.log("Matrix A after translate: " + a);
		
		// push matrix into matrix stack
        pushMatrix(a);
		console.log("Push matrix A: " + a);
		
		// 
        mat4.rotate(a, a, degToRad(20), [0, 1, 0]);
		console.log("Matrix A after rotate : " + degToRad(20) + " radians on Y axis: " + a);

        setMatrixUniforms();
        
		// draw geometry
		console.log("Do something with matrix A (" + a + ")....");
		
		console.log("Later we pop a matrix from the matrix stack and assign it to A.");
        a = popMatrix();
		console.log("Matrix A is  now: " + a);
	

		var b = mat4.create();
		console.log("Matrix B created: " + b);
		
		mat4.identity(b);
		console.log("Matrix B after identity: " + b);
		
		mat4.translate(b, b, [3.0, 3.0, 3.0]);
		console.log("Matrix B after translate: " + b);
	
	
		var c = mat4.create();
		console.log("Matrix C created: " + c);
		
		mat4.multiply(c, a, b);
		console.log("Multiply matrix AxB and store it in C: " + c);
		
		var d = mat4.create();
		console.log("Matrix d created: " + d);
		mat4.perspective(45, 800* 600 , 0.1, 100.0, d);
		console.log("Build projection matrix into matrix d with the following args: (45º view angle, 800x600pixel, 0.1 near and 100.0 far planes):" + d);
    }

    function webGLStart() {
		var canvas = document.getElementById("canvas");
		drawScene();
    }
