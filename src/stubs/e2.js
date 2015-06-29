/**
<!---
	If you are looking at this, you probably DO want to put these effects on your site. 
	To let you out on a secret... this site wasn't built with Flitwick. It was hand-coded.. So look around for all the messy code you can find. Use it, if you like.
	But if you really want to be ON the cutting edge of this stuff... Let us know by signing up.
-->
*/
var TorchLight = (function() {
	var _parent = null,
		_jqParent = null;

	function _apply(effect, objectURL, parentNode) {
		_parent = parentNode;
		_jqParent = $(_parent);
		var img = _parent.appendChild(document.createElement("img"));
		img.addEventListener("load", function() {
			effect.setTarget(img);
			effect.setForever();
			//_parent.removeChild(img);
			effect.start();
		});
		img.style.position = "absolute";
		img.width = _jqParent.innerWidth();
		//img.height = _jqParent.innerHeight();
		img.style.left = "0px";
		img.src = objectURL;
	}

	function GLCanvas(obj, width, height) {
		var par = obj.parentNode;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(60, obj.width/obj.height, 0.01, 15000 );
		// new THREE.OrthographicCamera(obj.width / -2, obj.width / 2, obj.height / 2, obj.height / -2, 0, 1000 );
		this.camera.position.z = 200.0;
		this.renderer = new THREE.WebGLRenderer({alpha: true});
		var ht = obj.height * _jqParent.innerWidth() / obj.width;
		this.renderer.setSize(_jqParent.innerWidth(), ht);
		this.renderer.setClearColor( 0x000000, 0 );
		par.appendChild(this.renderer.domElement);
		this.uniforms = {};
		this.mesh = null;
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

		this.mesh = new THREE.Mesh(plane, material);
		this.mesh.position.x = 0;
		this.mesh.position.y = 0;
		this.mesh.position.z = -10;
		//this.mesh.rotation.set(0.1, -0.9, 0);
		this.scene.add(this.mesh);

		this.renderer.render(this.scene, this.camera);
		this.renderer.domElement.style.position = "absolute";
		this.renderer.domElement.style.left = "0px";
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
		// target.style.display = "none";
	};

	_TorchLightEffect.prototype.setForever = function() {
		this.forever = true;
	};

	_TorchLightEffect.prototype.start = function() {
		var _cl = 0;
		var _dirX = 0.005;
		var _dirY = 0.005;
		var dt = 0.005;
		var update = function(cv, elapsedTime, delta) {
			_cl += 1000.0 * delta;
			if (_cl >= 0.0000005) {
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

				// if (cv.mesh.rotation.y > 1.0 || cv.mesh.rotation.y < -1.0) {
				// 	dt = -dt;
				// }
				// cv.mesh.rotation.y += dt;
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
