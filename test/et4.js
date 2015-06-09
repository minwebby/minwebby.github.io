
var Banner = (function() {
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

	function GLCanvas(obj, width, height) {
		var par = obj.parentNode;

	    // camera
	    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 15000 );
	    this.camera.position.z = 400;


	    // scene

	    this.scene = new THREE.Scene();
	    this.scene.fog = new THREE.Fog( 0x000000, 3500, 15000 );
	    //this.scene.fog.color.setHSL( 0.51, 0.4, 0.4 );

	    
	    // lights

	    var ambient = new THREE.AmbientLight( 0xffffff );
	    //ambient.color.setHSL( 0.1, 0.1, 0.1 );
	    this.scene.add( ambient );


	    var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
	    dirLight.position.set( 0, -1, 0 ).normalize();
	    this.scene.add( dirLight );

	   // dirLight.color.setHSL( 0.1, 0.7, 0.5 );
	        
	    //flare sprite 1
	    var map = THREE.ImageUtils.loadTexture( "/src/theme/img/lensflare0bw.png" );
	    var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: true, blending: THREE.AdditiveBlending } );
	    this.sprite1 = new THREE.Sprite( material );
	    this.sprite1.position.set(0, 0, 0);
	    this.sprite1.scale.set(50, 50, 50);
	    this.scene.add( this.sprite1 );
	        
	    //flare sprite 2
	    var map = THREE.ImageUtils.loadTexture( "/src/theme/img/lensflare0bw.png" );
	    var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: true, blending: THREE.AdditiveBlending } );
	    this.sprite2 = new THREE.Sprite( material );
	    this.sprite2.position.set(0, 0, 0);
	    this.sprite2.scale.set(50, 50, 50);
	    this.scene.add( this.sprite2 );
	    
	     // renderer

	    this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	    this.renderer.setClearColor( this.scene.fog.color );
	    this.renderer.setPixelRatio( window.devicePixelRatio );
	    this.renderer.setSize( window.innerWidth, window.innerHeight );
	    this.renderer.gammaInput = true;
	    this.renderer.gammaOutput = true;
	        
	    par.appendChild(this.renderer.domElement);
    }
        
    

	GLCanvas.prototype.drawImage = function(image) {
		var plane = new THREE.PlaneGeometry(image.width, image.height, 1, 1); 

		var imgTexture = new THREE.Texture(image);
		imgTexture.needsUpdate = true;
		imgTexture.minFilter = THREE.NearestFilter;
        
        var light = new THREE.AmbientLight(0xFFFFFF);
		this.scene.add(light);

        var material = new THREE.MeshPhongMaterial( { color: 0xffffff , map: imgTexture,} );

		this.mesh = new THREE.Mesh(plane, material);
		this.mesh.position.set( 0, 0, 0);
              
        this.box = new THREE.Box3().setFromObject( this.mesh );
        var planeheight = this.box.max.y - this.box.min.y ;
        var planewidth = this.box.max.x - this.box.min.x ;
        var scalefactor = (-(0.225 * planeheight) / planewidth ) + .3; 

        this.mesh.scale.set( scalefactor, scalefactor , scalefactor );
        this.box = new THREE.Box3().setFromObject( this.mesh );

        
		this.scene.add(this.mesh);
        
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

	function _BannerEffect() {
		this.targetImg = null;
		this.forever = false;
		this.fromTime = 0;
		this.toTime = 0;
		this.glCanvas = null;
		this.animFrame = null;
	}

	_BannerEffect.prototype.setTarget = function(target) {
		this.targetImg = target;
		this.glCanvas = new GLCanvas(target);
		this.glCanvas.drawImage(target);
		target.style.display = "none";
	};

	_BannerEffect.prototype.setForever = function() {
		this.forever = true;
	};

	_BannerEffect.prototype.start = function() {
        var that = this;
        var sgm = 1;
        this.glCanvas.sprite1.position.set(this.glCanvas.box.max.x,this.glCanvas.box.max.y,0);
        this.glCanvas.sprite2.position.set(this.glCanvas.box.min.x,this.glCanvas.box.min.y,0);
		var update = function(cv, elapsedTime, delta) {
//            //TODO animation code
            if(that.glCanvas.sprite1.position.x >that.glCanvas.box.max.x){
                sgm = -1; 
            }
            else if (that.glCanvas.sprite1.position.x < that.glCanvas.box.min.x){
                sgm = 1; 
            }
            
            that.glCanvas.sprite1.position.x+=sgm;
            that.glCanvas.sprite2.position.x-=sgm;
            
            
		},
		render = function(cv, elapsedTime, delta) {
			cv.render();
		};
		(new AnimationFrameGen([update, render], this.glCanvas)).start();
	};

	return {
		effect: _BannerEffect,
		apply: _apply
	};
})();
