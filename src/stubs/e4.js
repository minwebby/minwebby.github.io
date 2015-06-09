var MonkeyScroll = (function() {

	function _apply(effect, mesh) {
		effect.setMesh(mesh, function() { 
			effect.start() 
		});
	}

	function GLCanvas(obj, width, height) {
		var par = obj;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(60, width/height, 0.00001, 10000);
		this.camera.position.z = 3.0;
		this.renderer = new THREE.WebGLRenderer({ alpha: true });
		this.renderer.setSize(width, height);
		par.appendChild(this.renderer.domElement);
		this.uniforms = {};
		this.mainObj = null;
		this.doRotate = true;
	}

	GLCanvas.prototype.loadMesh = function(meshPath, andThen) {
		var loader = new THREE.JSONLoader();
		var that = this;
		var normMat;

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
				vertexShader: document.getElementById( 'vs1' ).textContent,
				fragmentShader: document.getElementById( 'fs2' ).textContent
			});
			geometry.computeFaceNormals();
			geometry.computeVertexNormals(true);
			geometry.normalsNeedUpdate = true;
			var object = new THREE.PointCloud( geometry, material );
			that.scene.add( object );
			object.position.x = 0;
			object.position.y = 0;
			object.position.z = 0;
			that.mainObj = object;
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

	function _MonkeyScroll(container) {
		this.targetImg = null;
		this.forever = false;
		this.fromTime = 0;
		this.toTime = 0;
		this.glCanvas = null;
		this.animFrame = null;
		this.container = document.getElementById(container);
		this.container.style.position = "absolute";
		this.container.style.top = "0px";
		this.container.style.left = (window.innerWidth - 310) + "px";
		this.animTask = null;
		this.newScrollPos = 0;
		this.animTime = 0;
	}

	_MonkeyScroll.prototype.animCanvas = function() {
		var that = this, 
			fn = function() {
				that.animCanvas.call(that);
			},
			pos = $(this.container).position().top, 
			targ = this.newScrollPos,
			ease = function(t, fval, tval) {
				var ts = t * t;
				var tc = ts * t;
				return fval + (tval - fval) * (6 * tc * ts -15 * ts * ts + 10 * tc);
			}

		this.animTime += 0.01;
		var newpos = pos, changed = false;
		if ((pos + 5) < targ) {
			newpos = ease(this.animTime, pos+5, targ);
			changed = true;
		} else if ((pos - 5) > targ) {
			newpos = ease(this.animTime, pos-5, targ);
			changed = true;
		}

		if (changed) {
			this.container.style.top = newpos + "px";
			this.animTask = setTimeout(fn, 0);
		} else {
			this.glCanvas.doRotate = true;
		}
	};


	_MonkeyScroll.prototype.handleScroll = function(target) {
		if (this.animTask) {
			window.clearTimeout(this.animTask)
			this.animTime = 0;
		}
		this.newScrollPos = $(target).scrollTop();
		this.glCanvas.uniforms.scroll.value = this.newScrollPos;
		var that = this,
		    fn = function() {
		    	that.animCanvas.call(that);
		    };
		this.glCanvas.doRotate = false;
		this.animTask = setTimeout(fn, 0);
	};


	_MonkeyScroll.prototype.setMesh = function(targetMesh, andThen) {
		this.glCanvas = new GLCanvas(this.container, 300, 200);
		this.glCanvas.loadMesh(targetMesh, andThen);

		var that = this,
			fn = function(ev) {
				that.handleScroll.call(that, ev.currentTarget);
			};
		$(window).scroll(fn);
	};

	_MonkeyScroll.prototype.setForever = function() {
		this.forever = true;
	};

	_MonkeyScroll.prototype.start = function() {
		var _cl = 0;
		var that = this;
		var update = function(cv, elapsedTime, delta) {
			_cl += 1000.0 * delta;
			if (_cl >= 0.000005) {
				cv.uniforms.time.value = elapsedTime;
				if (cv.doRotate) {
					cv.mainObj.rotation.y += Math.abs(Math.sin(elapsedTime)*0.05);
				} else {
					cv.mainObj.rotation.y = 0.3;
				}
			}
		},
		render = function(cv, elapsedTime, delta) {
			cv.render();
		};

		this.glCanvas.render();
		(new AnimationFrameGen([update, render], this.glCanvas)).start();
	};

	return {
		effect: _MonkeyScroll,
		apply: _apply
	};

})();