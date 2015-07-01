function apply(effect, objectURL) {
	var img = document.body.appendChild(document.createElement("img"));
	img.addEventListener("load", function() {
		console.log("here");
		effect.setTarget(img);
		effect.setForever();
		document.body.removeChild(img);
		effect.start();
	});
	img.style.position = "absolute";
	// img.width = window.innerWidth;
	//img.height = img.height * (img.width / );
	img.src = objectURL;
}


// function extractImageData(obj) {
// 	var par = obj.parentNode;
// 	var cv = par.appendChild(document.createElement("canvas"));
// 	cv.width = window.innerWidth
// 	cv.height = window.innerHeight;
// 	var gd = cv.getContext('2d');
// 	gd.drawImage(obj, 0, 0);
// 	var img = gd.getImageData(0, 0, cv.width, cv.height);
// 	par.removeChild(cv);
// 	return img;
// }

function GLCanvas(obj, width, height) {
	var par = obj.parentNode;
	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera(obj.width / -2, obj.width / 2, obj.height / 2, obj.height / -2, 0.01, 15000 );//THREE.PerspectiveCamera(75, obj.width/obj.height, 0.01, 15000.0 );
	this.camera.position.z = 2000;
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize(obj.width, obj.height);
	par.appendChild(this.renderer.domElement);
	this.uniforms = {};
}

GLCanvas.prototype.drawImage = function(image) {
	var plane = new THREE.PlaneBufferGeometry(image.width, image.height, 1, 1); //image.width, image.height);

	var imgTexture = new THREE.Texture(image);
	imgTexture.needsUpdate = true;
	imgTexture.minFilter = THREE.NearestFilter;


	var light = new THREE.AmbientLight(0xFFFFFF);
	this.scene.add(light);

	this.uniforms = {
		time: { type: "f", value: 0.0 },
		resolution: { type: "v2", value: new THREE.Vector2() },
		texture: {type: "t", value: imgTexture},
		centerX: {type: "f", value: image.width},
		centerY: {type: "f", value: 0.0},
		radius: { type: 'f', value: 0.6 },
		aspectRatioSq: {type: 'f', value: (image.width * image.width) / (image.height * image.height) }
	};

	var material =  new THREE.ShaderMaterial( {
		uniforms: this.uniforms,
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent

	} );

	console.log(plane);
	var mesh = new THREE.Mesh(plane, material);
	mesh.position.x = 0;
	mesh.position.y = 0;
	mesh.position.z = 0;
	//mesh.scale.set(10.0, 10.0, 10.0);
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
		this.functions[i].call(null, this.cv, this.clock.getElapsedTime(), this.clock.getDelta());
	}
	if (!this.clock.running) {
		this.clock.start();
	}
};

function IconShine() {
	this.targetImg = null;
	this.forever = false;
	this.fromTime = 0;
	this.toTime = 0;
	this.glCanvas = null;
	this.animFrame = null;
}

IconShine.prototype.setTarget = function(target) {
	this.targetImg = target;
	this.glCanvas = new GLCanvas(target);
	this.glCanvas.drawImage(target);
	target.style.display = "none";
};

IconShine.prototype.setForever = function() {
	this.forever = true;
};

IconShine.prototype.start = function() {
	var _cl = 0;
	var _dRad = 0.005;

	var update = function(cv, elapsedTime, delta) {
		var _centerX = cv.uniforms.centerX.value;
		var _centerY = cv.uniforms.centerY.value;
		var _diag = Math.sqrt(_centerX* _centerX + _centerY + _centerY);
		_cl += 1000.0 * delta;
		if (_cl >= 0.0005) {
			var rad = cv.uniforms.radius.value;

			rad -= _dRad;

			if (rad <= 0.3 || rad >= 0.9) {
				_dRad *= -1;
			}
			cv.uniforms.radius.value = rad;
			cv.uniforms.time.value = elapsedTime;
			// console.log("radius: "+ rad);
			// console.log("diag: "+ _diag);
			_cl = 0;
		}
	},
	render = function(cv, elapsedTime, delta) {
		cv.render();
	};
	(new AnimationFrameGen([update, render], this.glCanvas)).start();
};
