/**
<!---
	If you are looking at this, you probably DO want to put these effects on your site. 
	To let you out on a secret... this site wasn't built with Flitwick. It was hand-coded.. So look around for all the messy code you can find. Use it, if you like.
	But if you really want to be ON the cutting edge of this stuff... Let us know by signing up.
-->
*/
var SplashColor = (function() {
	var _parent = null,
		_jqParent = null,
		_funcs = {};

	function _apply(effect, objectURL, parentNode) {
		_parent = parentNode;
		_jqParent = $(_parent);
		
		var noiseTexture = _parent.appendChild(document.createElement("img"));
		noiseTexture.addEventListener("load", function() {
			var img = _parent.appendChild(document.createElement("img"));
			img.addEventListener("load", function() {
				img.style.display = "none";
				noiseTexture.style.display = "none";
				_funcs.start = function() {
					effect.setTarget(img, noiseTexture);
					effect.setForever();
					_parent.removeChild(img);
					_parent.removeChild(noiseTexture);
					effect.start();
				}
			});
			img.style.position = "absolute";
			img.width = 375; // _jqParent.innerWidth();
			img.height = 250; // _jqParent.height();
			//img.height = _jqParent.innerHeight();
			img.src = objectURL;
		});
		noiseTexture.src = "/src/theme/img/noise.png";
		
	}

	function SplashMask(width, height, splashCycleCount, splatRadius) 
	{
		this.width = width;
		this.height = height;
		this.size = width * height * 4;
		this.data = new Float32Array(this.size);
		for (var i = 0; i < this.size; ++i) {
			this.data[i] = 0;
		}
		this.texture = new THREE.DataTexture(this.data, width, height, THREE.RGBAFormat, THREE.FloatType);
		this.texture.minFilter = THREE.NearestFilter;
		this.texture.magFilter = THREE.NearestFilter;
		this.texture.needsUpdate = true;
		this.splashCount = 0;
		this.splashCycle = splashCycleCount;
		this.splatRadius = splatRadius;
	}

	SplashMask.prototype.reset = function() {
		for (var i = 0; i < this.size; ++i) {
			this.data[i] = 0;
		}
		for (i = 3; i < this.size; i += 4) {
			this.data[i] = 1.0;
		}
		this.splashCount = 0;
		this.texture.needsUpdate = true;
	};

	SplashMask.prototype.splash2 = function() {

		if (this.splashCount > this.splashCycle) {
			this.reset();
			return undefined;
		}
		++this.splashCount;

		var ox = Math.floor(Math.random() * this.width),
			oy = Math.floor(Math.random() * this.height);
		this.texture.needsUpdate = true;
		return {x: ox / this.width, y: oy / this.height};
	};


	function GLCanvas(obj) {
		var par = obj.parentNode;
		this.scene = new THREE.Scene();
		this.camera = new THREE.OrthographicCamera(obj.width / -2, obj.width / 2, obj.height / 2, obj.height / -2, 0, 1000 );
		this.camera.position.z = 0;
		this.renderer = new THREE.WebGLRenderer();
		var ht = obj.height * _jqParent.innerWidth() / obj.width;
		this.renderer.setSize(_jqParent.innerWidth(), ht);
		par.appendChild(this.renderer.domElement);
		this.uniforms = {};
		this.splashMask = null;
	}

	GLCanvas.prototype.drawImage = function(image, noiseImage) {
		var plane = new THREE.PlaneBufferGeometry(image.width, image.height, 1, 1); 

		var imgTexture = new THREE.Texture(image);
		imgTexture.needsUpdate = true;
		imgTexture.minFilter = THREE.NearestFilter;

		var noiseTx = new THREE.Texture(noiseImage);
		noiseTx.needsUpdate = true;
		noiseTx.minFilter = THREE.NearestFilter;

		this.splashMask = new SplashMask(image.width, image.height, 100, 150);

		var light = new THREE.AmbientLight(0xFFFFFF);
		this.scene.add(light);

		this.uniforms = {
			texture: {type: "t", value: imgTexture},
			noiseTexture: {type: "t", value: noiseTx},
			splashMask: {type: "t", value: this.splashMask.texture},
			centerX: {type: 'f', value: 0.0},
			centerY: {type: 'f', value: 0.0}
		};

		var material =  new THREE.ShaderMaterial( {
			uniforms: this.uniforms,
			vertexShader: document.getElementById( 'vs0' ).textContent,
			fragmentShader: document.getElementById( 'fs3' ).textContent
		});

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

	function _SplashColorEffect() {
		this.targetImg = null;
		this.forever = false;
		this.fromTime = 0;
		this.toTime = 0;
		this.glCanvas = null;
		this.animFrame = null;
	}

	_SplashColorEffect.prototype.setTarget = function(target, noiseImage) {
		this.targetImg = target;
		this.glCanvas = new GLCanvas(target);
		this.glCanvas.drawImage(target, noiseImage);
		target.style.display = "none";
		noiseImage.style.display = "none";
	};

	_SplashColorEffect.prototype.setForever = function() {
		this.forever = true;
	};

	_SplashColorEffect.prototype.start = function() {
		var _cl = 0;
		var _dirX = 0.1;
		var _dirY = 0.1;
		var _posX = 0.5;
		var _posY = 0.5;
		var update = function(cv, elapsedTime, delta) {
			_cl += 4.0 * delta;
			if (_cl >= 0.00008) {
				if (cv.splashMask) {
					var center = cv.splashMask.splash2();
					if (center) {
						_posX += _dirX * Math.sin(center.x / 10.0);
						_posY += _dirY * Math.sin(center.y / 10.0);
						if (_posX > 0.9 || _posX < 0.1) { _dirX = -_dirX; }
						if (_posY > 0.9 || _posY < 0.1) { _dirY = -_dirY; }
						cv.uniforms.centerX.value = _posX;
						cv.uniforms.centerY.value = _posY;
					}
				}
				_cl = 0;
			} 
		},
		render = function(cv, elapsedTime, delta) {
			cv.render();
		};
		(new AnimationFrameGen([update, render], this.glCanvas)).start();
	};

	return {
		effect: _SplashColorEffect,
		apply: _apply,
		mkawesome: _funcs
	};
})();
