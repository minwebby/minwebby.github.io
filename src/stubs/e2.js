var TorchLight = (function() {
	var _parent = null,
		_jqParent = null;

	function _apply(effect, objectURL, parentNode) {
		_parent = parentNode;
		_jqParent = $(_parent);
		var img = _parent.appendChild(document.createElement("img"));
		img.addEventListener("load", function() {
			console.log("here");
			effect.setTarget(img);
			effect.setForever();
			_parent.removeChild(img);
			effect.start();
		});
		img.style.position = "absolute";
		img.width = _jqParent.innerWidth();
		//img.height = _jqParent.innerHeight();
		img.src = objectURL;
	}

	function GLCanvas(obj, width, height) {
		var par = obj.parentNode;
		this.scene = new THREE.Scene();
		this.camera = new THREE.OrthographicCamera(obj.width / -2, obj.width / 2, obj.height / 2, obj.height / -2, 0, 1000 );
		this.camera.position.z = 0;
		this.renderer = new THREE.WebGLRenderer();
		var ht = obj.height * _jqParent.innerWidth() / obj.width;
		this.renderer.setSize(_jqParent.innerWidth(), ht);
		par.appendChild(this.renderer.domElement);
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
			texture: {type: "t", value: imgTexture},
			posX: {type: 'f', value: 0.4 },
			posY: {type: 'f', value: 0.5 },
			radius: { type: 'f', value: 0.25 },
			aspectRatioSq: {type: 'f', value: (image.width * image.width) / (image.height * image.height) }
		};

		var material =  new THREE.ShaderMaterial( {
			uniforms: this.uniforms,
			vertexShader: document.getElementById( 'vs0' ).textContent,
			fragmentShader: document.getElementById( 'fs1' ).textContent

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
			this.functions[i].call(null, this.cv, this.clock.getElapsedTime(), this.clock.getDelta());
		}
		if (!this.clock.running) {
			this.clock.start();
		}
	};

	function _TorchLightEffect() {
		this.targetImg = null;
		this.forever = false;
		this.fromTime = 0;
		this.toTime = 0;
		this.glCanvas = null;
		this.animFrame = null;
	}

	_TorchLightEffect.prototype.setTarget = function(target) {
		this.targetImg = target;
		this.glCanvas = new GLCanvas(target);
		this.glCanvas.drawImage(target);
		target.style.display = "none";
	};

	_TorchLightEffect.prototype.setForever = function() {
		this.forever = true;
	};

	_TorchLightEffect.prototype.start = function() {
		var _cl = 0;
		var _dirX = 0.005;
		var _dirY = 0.005;
		var update = function(cv, elapsedTime, delta) {
			_cl += 1000.0 * delta;
			if (_cl >= 0.000005) {
				var px = cv.uniforms.posX.value, 
					py = cv.uniforms.posY.value;
				px += _dirX;
				py += _dirY;
				var dRand = Math.random()/5.0;
				if (px >= (0.85 + dRand)) {
					_dirX = -0.005- Math.random()/100.0;
				} else if (px <= (0.05 - dRand)) {
					_dirX = 0.005+ Math.random()/100.0;
				}
				if (py >= (0.85 + dRand)) {
					_dirY = -0.005- Math.random()/100.0;
				} else if (py <= (0.05 - dRand)) {
					_dirY = 0.005+ Math.random()/100.0;
				}
				cv.uniforms.posX.value = px;
				cv.uniforms.posY.value = py;
				_cl = 0;
			} 
		},
		render = function(cv, elapsedTime, delta) {
			cv.render();
		};
		(new AnimationFrameGen([update, render], this.glCanvas)).start();
	};

	return {
		effect: _TorchLightEffect,
		apply: _apply
	};
})();
