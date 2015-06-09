function apply(effect, objectURL1, objectURL2 ) {
	var img = document.body.appendChild(document.createElement("img"));
	img.addEventListener("load", function() {
		var img2 = document.body.appendChild(document.createElement("img"));
		img2.width = window.innerWidth;
		img2.height = window.innerHeight;
		img2.style.position = "absolute";
		img2.addEventListener("load", function() {
			effect.setTargets(img, img2);
			effect.setForever();
			document.body.removeChild(img);
			document.body.removeChild(img2);
			effect.start();	
		});
		img2.src = objectURL2;
	});
	img.style.position = "absolute";
	img.width = window.innerWidth;
	img.height = window.innerHeight;
	img.src = objectURL1;
}


function GLCanvas(obj, width, height) {
	var par = obj.parentNode;
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera(60, obj.width/obj.height, 1.0, 2000.0);
	this.camera.lookAt(new THREE.Vector3(0, 0, 0));
	// THREE.OrthographicCamera(obj.width / -2, obj.width / 2, obj.height / 2, obj.height / -2, -500, 1000 );
	this.camera.position.z = 1000;

	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize(innerWidth, innerHeight);
	par.appendChild(this.renderer.domElement);
	this.uniforms = {};
	this.meshes = [];
	this.subdivX = 64;
	this.subdivY = 64;
	this.cols = 0;
	this.rows = 0;
}


GLCanvas.prototype.genCellMesh = function(cellRect, material) {
	var geom = new THREE.PlaneGeometry(cellRect.width, cellRect.height, 1, 1),
	faceVtxUVs = geom.faceVertexUvs[0];

	// there'll be two faces faceVtxUVs[0], faceVtxUVs[1]
	// each face will have a triangle => 3 vertex UVs 
	faceVtxUVs[0] = [
		new THREE.Vector2(cellRect.uvLeft, cellRect.uvTop),
		new THREE.Vector2(cellRect.uvLeft, cellRect.uvBottom),
		new THREE.Vector2(cellRect.uvRight, cellRect.uvTop)
	];
	faceVtxUVs[1] = [
		new THREE.Vector2(cellRect.uvLeft, cellRect.uvBottom),
		new THREE.Vector2(cellRect.uvRight, cellRect.uvBottom),
		new THREE.Vector2(cellRect.uvRight, cellRect.uvTop)
	];

	var mesh = new THREE.Mesh(geom, material);
	mesh.position.x = cellRect.x;
	mesh.position.y = cellRect.y;
	mesh.position.z = 0.0;
	mesh.origp = {x: mesh.position.x, y: mesh.position.y, z: mesh.position.z};
	
	return mesh;
};

GLCanvas.prototype.addGridMeshes = function(width, height, imgTexture, imgTexture2) {

	this.uniforms = {
		time: { type: "f", value: 1.0 },
		resolution: { type: "v2", value: new THREE.Vector2(0, 0) },
		texture: {type: "t", value: imgTexture},
		texture2: {type: "t", value: imgTexture2},
		posX: {type: 'f', value: 0.4 },
		posY: {type: 'f', value: 0.5 },
		radius: { type: 'f', value: 0.25 }
	};

	var material =  new THREE.ShaderMaterial( {
		uniforms: this.uniforms,
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent
	} );


	var rect = {
		x: 0,
		y: height/2.0,
		width: this.subdivX,
		height: this.subdivY,
		uvLeft: 0,
		uvTop: 1.0,
		uvRight: 0,
		uvBottom: 0
	},
	fractX = this.subdivX / width,
	fractY = this.subdivY / height;

	this.rows = parseInt(width / this.subdivX);
	this.cols = parseInt(height / this.subdivY);
	

	
	rect.uvBottom = 1.0 - fractY;
	for (var j = 0; j <= height; j += this.subdivY) {
		rect.uvLeft = 0;
		rect.uvRight = fractX;
		rect.x = -width/2.0;
		for (var i  = 0; i <= width; i += this.subdivX) {
			var mesh = this.genCellMesh(rect, material);
			this.scene.add(mesh);
			this.meshes.push(mesh);
			rect.uvLeft += fractX;
			rect.uvRight += fractX;
			rect.x += this.subdivX;
		}
		rect.uvTop -= fractY;
		rect.uvBottom -= fractY;
		rect.y -= this.subdivY;
	}
};



GLCanvas.prototype.drawImage = function(image, image2) {
	var imgTexture = new THREE.Texture(image);
	imgTexture.needsUpdate = true;
	imgTexture.minFilter = THREE.NearestFilter;

	var imgTexture2 = new THREE.Texture(image2);
	imgTexture2.needsUpdate = true;
	imgTexture2.minFilter = THREE.NearestFilter;

	var light = new THREE.AmbientLight(0xFFFFFF);
	this.scene.add(light);

	this.addGridMeshes(image.width, image.height, imgTexture, imgTexture2);

	this.renderer.render(this.scene, this.camera);
};

GLCanvas.prototype.render = function() {
	this.renderer.render(this.scene, this.camera);
};


function AnimationFrameGen(arrCalls, canvasCtx) {
	this.functions = arrCalls ? arrCalls : [];
	this.clock = new THREE.Clock(true);
	this.cv = canvasCtx;
}

AnimationFrameGen.prototype.start = function() {
	var that = this;
	var wrappedFn = function() { that.start.call(that); };
	requestAnimationFrame(wrappedFn);
	for (var i = 0; i < this.functions.length; ++i) {
		this.functions[i].call(null, this.cv, this.clock.getElapsedTime(), this.clock.getDelta());
	}
	if (!this.clock.running) {
		this.clock.start();
	}
};

function ParticleSet() {
	this.forever = false;
	this.fromTime = 0;
	this.toTime = 0;
	this.glCanvas = null;
	this.animFrame = null;
}

ParticleSet.prototype.setTargets = function(target1, target2) {
	this.glCanvas = new GLCanvas(target1);
	this.glCanvas.drawImage(target1, target2);
	target1.style.display = "none";
	target2.style.display = "none";
};

ParticleSet.prototype.setForever = function() {
	this.forever = true;
};

ParticleSet.prototype.start = function() {
	var _cl = 0;
	var update = function(cv, t, delta) {
		_cl += 1000.0 * delta;
		if (_cl >= 0.000005) {
			var i = 0, e = cv.meshes.length;
			var rTime = 0.5 + 0.5 * Math.sin(t/2.0);
			var theta = 4 * 3.14159 * rTime;
			var offX = 10.0 * Math.cos(theta);
			var offY = 10.0 * Math.sin(theta);

			for (; i < e; ++i) {
				var dz = Math.sin(t * cv.meshes[i].origp.x * 0.005) * 100.0;
				var dx = Math.cos(t * cv.meshes[i].origp.y * 0.005) * 100.0;

				cv.meshes[i].position.z = cv.meshes[i].origp.z + dz;
				cv.meshes[i].position.x = cv.meshes[i].origp.x + dx;
				//cv.meshes[i].rotation.y = Math.cos(t + cv.meshes[i].origp.x) * 0.5;
				//cv.meshes[i].rotation.x = Math.sin(t + cv.meshes[i].origp.y) * 0.5;
				cv.uniforms.time.value = t;
			}
		}
	},
	render = function(cv, elapsedTime, delta) {
		cv.render();
	};
	(new AnimationFrameGen([update, render], this.glCanvas)).start();
};




