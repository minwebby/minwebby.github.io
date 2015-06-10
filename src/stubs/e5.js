var SplashColor = (function() {
	var _parent = null,
		_jqParent = null;

	function _apply(effect, objectURL, parentNode) {
		_parent = parentNode;
		_jqParent = $(_parent);
		var img = _parent.appendChild(document.createElement("img"));
		img.addEventListener("load", function() {
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

	SplashMask.prototype.drawLine = function(ox, oy, tx, ty, dx, dy) {
		var pos, pixs = new Array(100), pc = 0;
		if (dx > 0) {
			if (dy > 0) {
				while (ox < tx && oy < ty) {
					pixs[pc++] = (oy * this.width + ox) * 4;  ox += dx; oy += dy;
				}
			} else {
				while (ox < tx && oy > ty) {
					pixs[pc++] = (oy * this.width + ox) * 4;  ox += dx; oy += dy;
				}
			}
		} else {
			if (dy > 0) {
				while (ox > tx && oy < ty) {
					pixs[pc++] = (oy * this.width + ox) * 4;  ox += dx; oy += dy;
				}
			} else {
				while (ox > tx && oy > ty) {
					pixs[pc++] = (oy * this.width + ox) * 4;  ox += dx; oy += dy;
				}
			}
		}
		for (var i = 0; i < pc; ++i) {
			pos = pixs[i];
			this.data[pos] = 1.0;
			this.data[pos+1] = 1.0;
			this.data[pos+2] = 1.0;
			this.data[pos+3] = 1.0;
		}
	};

	SplashMask.prototype.splash = function() {

		if (this.splashCount > this.splashCycle) {
			this.reset();
			return;
		}
		++this.splashCount;

		var minSplashRad = 2, maxRangeRad = 20;
			theta = 0, 
			dtheta = 0.1,
			ox = Math.floor(Math.random() * this.width),
			oy = Math.floor(Math.random() * this.height), 
			tx = 0, ty = 0,
			ftheta = 2 * 3.141592653589,
			rradiusx = 0, rradiusy = 0;
			i = 0, dx = 0, dy = 0, pos = 0,
			clamp = function(val, max) {
				if (val < -max) { val = -max; }
				else if (val > max) { val = max; }
				else if (Math.abs(val) < 0.001) { val = minSplashRad; }
				return val;
			};	

		for (; theta < ftheta; theta += dtheta) {
			rradiusx = minSplashRad + parseInt(Math.random() * maxRangeRad) * Math.sin(theta);
			rradiusy = minSplashRad + parseInt(Math.random() * maxRangeRad) * Math.sin(theta);
			rradiusx = clamp(rradiusx, maxRangeRad);
			rradiusy = clamp(rradiusy, maxRangeRad);
			tx = ox + parseInt(rradiusx);
			ty = oy + parseInt(rradiusy);
			dx = rradiusx / Math.abs(rradiusx);
			dy = rradiusy / Math.abs(rradiusy);
			this.drawLine(ox, oy, tx, ty, dx, dy);
		}
		this.texture.needsUpdate = true;
	};

	SplashMask.prototype.splash2 = function() {

		if (this.splashCount > this.splashCycle) {
			this.reset();
			return;
		}
		++this.splashCount;

		var x, xe = this.width,
		 	y, ye = this.height,
		 	ox = Math.floor(Math.random() * this.width),
			oy = Math.floor(Math.random() * this.height), 
			minx = ((ox - this.splatRadius) > 0 ) ? ox - this.splatRadius : 0,
			maxx = ((ox + this.splatRadius) < this.width) ? ox + this.splatRadius : this.width,
			miny = ((oy - this.splatRadius) > 0) ? oy - this.splatRadius : 0,
			maxy = ((oy + this.splatRadius) < this.height) ? oy + this.splatRadius : this.height,
		 	pos, distsq, randTol, 
		 	radiusSq = this.splatRadius * this.splatRadius;
		randTol =  Math.random() * this.splatRadius * this.splatRadius;
		for (y = miny; y < maxy; ++y) {
			for (x = minx; x < maxx; ++x) {
				distsq = (x - ox) * (x - ox) + (y - oy) * (y - oy);
				randTol += 4.0 * Math.random() * Math.sin(Math.random() * 10);
				if ((distsq + randTol ) <= radiusSq ) {
					pos = y * xe * 4 + x * 4;
					this.data[pos] = 1.0;
					this.data[pos+1] = 1.0;
					this.data[pos+2] = 1.0;
					this.data[pos+3] = 1.0;
				}
			}
			randTol += 2.0 * Math.sin(10.0*Math.random());
		}
		this.texture.needsUpdate = true;
	};


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
		this.splashMask = null;
	}

	GLCanvas.prototype.drawImage = function(image) {
		var plane = new THREE.PlaneGeometry(image.width, image.height, 1, 1); //image.width, image.height);

		var imgTexture = new THREE.Texture(image);
		imgTexture.needsUpdate = true;
		imgTexture.minFilter = THREE.NearestFilter;

		this.splashMask = new SplashMask(image.width, image.height, 100, 150);

		var light = new THREE.AmbientLight(0xFFFFFF);
		this.scene.add(light);

		this.uniforms = {
			texture: {type: "t", value: imgTexture},
			splashMask: {type: "t", value: this.splashMask.texture}
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

	_SplashColorEffect.prototype.setTarget = function(target) {
		this.targetImg = target;
		this.glCanvas = new GLCanvas(target);
		this.glCanvas.drawImage(target);
		target.style.display = "none";
	};

	_SplashColorEffect.prototype.setForever = function() {
		this.forever = true;
	};

	_SplashColorEffect.prototype.start = function() {
		var _cl = 0;
		var _dirX = 0.005;
		var _dirY = 0.005;
		var update = function(cv, elapsedTime, delta) {
			_cl += 1000.0 * delta;
			if (_cl >= 0.000005) {
				if (cv.splashMask) {
					cv.splashMask.splash2();
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
		apply: _apply
	};
})();
