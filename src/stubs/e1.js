function apply(effect, objectURL) {
	var par = document.getElementById("mainHeader");
	var img = par.insertBefore(document.createElement("img"), par.childNodes[0]);
	img.addEventListener("load", function() {
		effect.setTarget(img);
		effect.setForever();
		par.removeChild(img);
		effect.start();
	});
	img.style.position = "absolute";
	img.width = window.innerWidth;
	img.height = window.innerHeight;
	img.style.left = "0px";
	img.style.top = "0px";
	img.src = objectURL;
}

function extractImageData(obj) {
	var par = obj.parentNode;
	var cv = par.appendChild(document.createElement("canvas"));
	cv.width = window.innerWidth
	cv.height = window.innerHeight;
	var gd = cv.getContext('2d');
	gd.drawImage(obj, 0, 0);
	var img = gd.getImageData(0, 0, cv.width, cv.height);
	par.removeChild(cv);
	return img;
}

function GLCanvas(obj, width, height) {
	var par = obj.parentNode;
	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera(obj.width / -2, obj.width / 2, obj.height / 2, obj.height / -2, 0, 1000 );
	this.camera.position.z = 0;
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize(innerWidth, innerHeight);
	par.insertBefore(this.renderer.domElement, par.childNodes[0]);
	this.renderer.domElement.style.position = "absolute";
	this.renderer.domElement.style.left = "0px";
	this.uniforms = {};
}

GLCanvas.prototype.drawImage = function(image) {
	var plane = new THREE.PlaneGeometry(image.width, image.height, 1, 1); //image.width, image.height);

	var imgTexture = new THREE.Texture(image);
	imgTexture.needsUpdate = true;
	imgTexture.minFilter = THREE.NearestFilter;


	var light = new THREE.AmbientLight(0xFFFFFF);
	this.scene.add(light);

	this.uniforms = {
		time: { type: "f", value: 1.0 },
		resolution: { type: "v2", value: new THREE.Vector2() },
		texture: {type: "t", value: imgTexture}
	};

	var material =  new THREE.ShaderMaterial( {
		uniforms: this.uniforms,
		vertexShader: document.getElementById( 'vs0' ).textContent,
		fragmentShader: document.getElementById( 'fs0' ).textContent

	} );

	var mesh = new THREE.Mesh(plane, material);
	mesh.position.x = 0;
	mesh.position.y = 0;
	mesh.position.z = 0;
	this.scene.add(mesh);

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

var done = 1;

AnimationFrameGen.prototype.start = function() {
	var that = this;
	var wrappedFn = function() { that.start.call(that); };
	requestAnimationFrame(wrappedFn);
	for (var i = 0; i < this.functions.length; ++i) {
		this.functions[i].call(null, this.cv, this.clock.getElapsedTime());
	}
	if (!this.clock.running) {
		this.clock.start();
	}
};

function Waver() {
	this.targetImg = null;
	this.forever = false;
	this.fromTime = 0;
	this.toTime = 0;
	this.glCanvas = null;
	this.animFrame = null;
}

Waver.prototype.setTarget = function(target) {
	this.targetImg = target;
	this.glCanvas = new GLCanvas(target);
	this.glCanvas.drawImage(target);
	target.style.display = "none";
};

Waver.prototype.setForever = function() {
	this.forever = true;
};

Waver.prototype.start = function() {
	var update = function(cv, elapsedTime) {
		cv.uniforms.time.value = elapsedTime;

	},
	render = function(cv, elapsedTime) {
		cv.render();
	};
	(new AnimationFrameGen([update, render], this.glCanvas)).start();
};




