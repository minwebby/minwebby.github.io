/**
<!---
	If you are looking at this, you probably DO want to put these effects on your site. 
    So look around for all the messy code you can find. Use it, if you like.
	But if you really want to be ON the cutting edge of this stuff... Let us know by signing up.
-->
*/
var ButtonBar = (function() {
	var _parent = null,
		_jqParent = null,
		_funcs = {}, _started = false;

	function _apply(effect, parentNode) {
		_parent = parentNode;
		_jqParent = $(_parent);
		effect.setTarget(parentNode);
		//effect.start()
		_funcs.start = function() { 
			effect.start(); 
			_started = true;
		};
		_funcs.isStarted = function() {
			return _started;
		};
		_funcs.show = function() {
			effect.show();
		};
		_funcs.hide = function() {
			effect.hide();
		};
	}

	function GLCanvas(obj) {
		var par = _parent,
			width = 900,
			height = 200;

	    this.scene = new THREE.Scene();
	   	this.camera = new THREE.PerspectiveCamera( 75, width/height, 1, 15000 );
	    this.camera.position.z = 200;
	    
	    var ambient = new THREE.AmbientLight( 0xffffff );
	    this.scene.add( ambient );

	    var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
	    dirLight.position.set( 0, -1, 0 ).normalize();
	    this.scene.add( dirLight );

	    this.renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
	    this.renderer.setPixelRatio( window.devicePixelRatio );
	    this.renderer.setSize( width, height );

	    this.btnWidth = width / 3;
	    this.btnHeight = this.btnWidth ;


	    this.uniforms = {
	    	time: { type: "f", value: 1.0 },
	    	over: { type: 'f', value: 0.1 }
	    };

	    var geometries = [
	     	new THREE.PlaneBufferGeometry(this.btnWidth, this.btnHeight, 1, 1),
	     	new THREE.PlaneBufferGeometry(this.btnWidth, this.btnHeight, 1, 1),
	     	new THREE.PlaneBufferGeometry(this.btnWidth, this.btnHeight, 1, 1),
	     	new THREE.PlaneBufferGeometry(this.btnWidth, this.btnHeight, 1, 1)
	    ];


	    var vs = document.getElementById( 'vs_btn' ).textContent;
	    var materials = [ 
	    		new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader:vs , fragmentShader: document.getElementById( 'fs_btnPassive' ).textContent}),
	    		new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader:vs, fragmentShader: document.getElementById( 'fs_btnHover' ).textContent}),
	    		new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader:vs, fragmentShader: document.getElementById( 'fs_btnActive' ).textContent}),
	    		new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader:vs, fragmentShader: document.getElementById( 'fs_btnDisabled' ).textContent})
	    ];
	
		var spc = 10,
			x = - 1.5 * this.btnWidth - spc;

		for (var i = 0; i < geometries.length; ++i) {
			var mesh = new THREE.Mesh(geometries[i], materials[i]);
			mesh.position.set(x, 0, 0);
			this.scene.add(mesh);
			x += this.btnWidth + spc;
		}
	    
	    par.appendChild(this.renderer.domElement);

	    var that = this;
	    $(this.renderer.domElement).hover(function() {
	    	if (!that.stopped) {
	    		that.uniforms.over.value = 1.0;
	    	}
	    }, function() {
	    	if (!that.stopped) {
	    		that.uniforms.over.value = 0.1;
	    	}
	    });
    }
        

	GLCanvas.prototype.drawImage = function(image) {
		var light = new THREE.AmbientLight(0xFFFFFF);
		this.scene.add(light);

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

	function _ButtonBarEffect() {
		this.targetImg = null;
		this.forever = false;
		this.fromTime = 0;
		this.toTime = 0;
		this.glCanvas = null;
		this.animFrame = null;
		this.stopped = false;
	}

	_ButtonBarEffect.prototype.setTarget = function(target) {
		this.targetImg = target;
		this.glCanvas = new GLCanvas(target);
		this.glCanvas.drawImage(target);
		// target.style.display = "none";
	};

	_ButtonBarEffect.prototype.setForever = function() {
		this.forever = true;
	};

	_ButtonBarEffect.prototype.start = function() {
        var that = this;
		var update = function(cv, elapsedTime, delta) {
			if (!that.stopped) {
          		cv.uniforms.time.value = elapsedTime;
          	}
		},
		render = function(cv, elapsedTime, delta) {
			cv.render();
		};
		(new AnimationFrameGen([update, render], this.glCanvas)).start();
	};
	_ButtonBarEffect.prototype.show = function() {
		this.stopped = false;
	};
	_ButtonBarEffect.prototype.hide = function() {
		this.stopped =  true;
//		console.log("stopped");
	};

	return {
		effect: _ButtonBarEffect,
		apply: _apply,
		mkawesome: _funcs
	};
})();
