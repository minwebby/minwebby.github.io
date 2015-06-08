function apply(effect, mesh) {
	effect.setMesh(mesh, function() { effect.start() });
}



function GLCanvas(obj, width, height) {
	var par = obj.parentNode;
	console.log(par);
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera(45, width/height, 0.01, 10000);
	this.camera.position.z = 10.0;
	this.renderer = new THREE.WebGLRenderer({ alpha: true });
	this.renderer.setSize(width, height);
	par.appendChild(this.renderer.domElement);
	this.uniforms = {};
}

GLCanvas.prototype.loadMesh = function(meshPath, andThen) {
	var loader = new THREE.JSONLoader();
	var that = this;
	

	var postLoading = function(geometry, materials) {
		that.uniforms = {
			time: { type: "f", value: 1.0 },
			scroll: {type: "f", value: 0.0 },
			color:  { type: 'c', value: new THREE.Color( 0xff0000 ) },
			size: { type: 'f', value: 5.0  },
			scale: { type: 'f', value: 1.0 },
			opacity: { type: 'f', value: 1.0 },
			cameraVec: {type: '3fv', value: that.camera.position}
		};
		var material =  new THREE.ShaderMaterial( {
			uniforms: that.uniforms,
			vertexShader: document.getElementById( 'vertexShader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentShader' ).textContent
		});
		geometry.computeFaceNormals();
		geometry.computeVertexNormals(true);
		geometry.normalsNeedUpdate = true;
		var object = new THREE.PointCloud( geometry, material );
		that.scene.add( object );
		object.position.x = 0;
		object.position.y = 0;
		object.position.z = 0;
		that.renderer.render(that.scene, that.camera);
		setTimeout(andThen, 0);
	};

	loader.load(meshPath, postLoading);

	var light = new THREE.AmbientLight(0xFFFFFF);
	this.scene.add(light);
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

function MonkeyScroll(container) {
	this.targetImg = null;
	this.forever = false;
	this.fromTime = 0;
	this.toTime = 0;
	this.glCanvas = null;
	this.animFrame = null;
	this.container = document.getElementById(container);
}

MonkeyScroll.prototype.setMesh = function(targetMesh, andThen) {
	this.glCanvas = new GLCanvas(this.container, 320, 240);
	this.glCanvas.loadMesh(targetMesh, andThen);
};

MonkeyScroll.prototype.setForever = function() {
	this.forever = true;
};

MonkeyScroll.prototype.start = function() {
	var _cl = 0;
	var update = function(cv, elapsedTime, delta) {
		_cl += 1000.0 * delta;
		if (_cl >= 0.000005) {
			cv.uniforms.time.value = elapsedTime;
		}
	},
	render = function(cv, elapsedTime, delta) {
		cv.render();
	};

	this.glCanvas.render();
	(new AnimationFrameGen([update, render], this.glCanvas)).start();
};