
var Flare = (function() {
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

//    this.camera = new THREE.OrthographicCamera(obj.width / -2, obj.width / 2, obj.height / 2, obj.height / -2, 0, 1000 );
//    this.camera.position.z = 50;
      this.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 15000 );
      this.camera.position.z = 250;


    // scene

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog( 0x000000, 3500, 15000 );
    this.scene.fog.color.setHSL( 0.51, 0.4, 0.01 );

    // world

    
    // lights

    var ambient = new THREE.AmbientLight( 0xffffff );
    ambient.color.setHSL( 0.1, 0.3, 0.2 );
    this.scene.add( ambient );


    var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
    dirLight.position.set( 0, -1, 0 ).normalize();
    this.scene.add( dirLight );

    dirLight.color.setHSL( 0.1, 0.7, 0.5 );

    // lens flares

    this.textureFlare0 = THREE.ImageUtils.loadTexture( "../img/lensflare0.png" );
    this.textureFlare2 = THREE.ImageUtils.loadTexture( "../img/lensflare2.png" );
    this.textureFlare3 = THREE.ImageUtils.loadTexture( "../img/lensflare3.png" );

    this.addLight( 0.55, 0.9, 0.5, 5000, 0, -1000 );
    this.addLight( 0.08, 0.8, 0.5,    0, 0, -1000 );
    this.addLight( 0.995, 0.5, 0.9, 5000, 5000, -1000 );
    
     // renderer

    this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    this.renderer.setClearColor( this.scene.fog.color );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
        
    par.appendChild(this.renderer.domElement);
    }
    GLCanvas.prototype.lensFlareUpdateCallback = function ( object ) {

        var f, fl = object.lensFlares.length;
        var flare;
        var vecX = -object.positionScreen.x * 2;
        var vecY = -object.positionScreen.y * 2;


        for( f = 0; f < fl; f++ ) {

               flare = object.lensFlares[ f ];

               flare.x = object.positionScreen.x + vecX * flare.distance;
               flare.y = object.positionScreen.y + vecY * flare.distance;

               flare.rotation = 0;

        }
        
        object.lensFlares[ 0 ].position++;
        object.lensFlares[ 1 ].y += 0.025;
        object.lensFlares[ 2 ].y += 0.025;
        object.lensFlares[ 3 ].rotation = object.lensFlares[3].x * 0.5 + THREE.Math.degToRad( 45 );
        object.lensFlares[ 4 ].rotation = object.lensFlares[4].x * 0.5 + THREE.Math.degToRad( 45 );
        object.lensFlares[ 5 ].rotation = object.lensFlares[5].x * 0.5 + THREE.Math.degToRad( 45 );
        object.lensFlares[ 6 ].rotation = object.lensFlares[6].x * 0.5 + THREE.Math.degToRad( 45 );

    };
    GLCanvas.prototype.addLight = function ( h, s, l, x, y, z ) {

        var light = new THREE.PointLight( 0xffffff, 1.5, 4500 );
        light.color.setHSL( h, s, l );
        light.position.set( x, y, z );
        this.scene.add( light );

        var flareColor = new THREE.Color( 0xffffff );
        flareColor.setHSL( h, s, l + 0.5 );

        this.lensFlare = new THREE.LensFlare( this.textureFlare0, 100, 0.0, THREE.AdditiveBlending, flareColor );

       this.lensFlare.add( this.textureFlare2, 512/2, 0.0, THREE.AdditiveBlending );
       this.lensFlare.add( this.textureFlare2, 512/2, 0.0, THREE.AdditiveBlending );
       this.lensFlare.add( this.textureFlare2, 512/2, 0.0, THREE.AdditiveBlending );

       this.lensFlare.add( this.textureFlare3, 60/2, 0.6, THREE.AdditiveBlending );
       this.lensFlare.add( this.textureFlare3, 70/2, 0.7, THREE.AdditiveBlending );
       this.lensFlare.add( this.textureFlare3, 120/2, 0.9, THREE.AdditiveBlending );
       this.lensFlare.add( this.textureFlare3, 70/2, 1.0, THREE.AdditiveBlending );

       this.lensFlare.customUpdateCallback = this.lensFlareUpdateCallback;
       this.lensFlare.position.set( 0,0,-1 );
        this.lensFlare.scale = .05;
        
        this.scene.add(this.lensFlare );

    };
        
    

	GLCanvas.prototype.drawImage = function(image) {
		var plane = new THREE.PlaneGeometry(image.width, image.height, 1, 1); //image.width, image.height);

		var imgTexture = new THREE.Texture(image);
        
		imgTexture.needsUpdate = true;
		imgTexture.minFilter = THREE.NearestFilter;


		var light = new THREE.AmbientLight(0xFFFFFF);
		this.scene.add(light);
        
        
        var material = new THREE.MeshPhongMaterial( { color: 0xffff00 , map: imgTexture,} );

		this.mesh = new THREE.Mesh(plane, material);
		this.mesh.position.x = 0;
		this.mesh.position.y = 0;
		this.mesh.position.z = 0;
        this.mesh.scale.x = 0.15;
		this.mesh.scale.y = 0.15;
		this.mesh.scale.z = 0.15;
        this.box = new THREE.Box3().setFromObject( this.mesh );
        this.lensFlare.position.set( this.box.min.x +10 , this.box.max.y -10, -1 );
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
            that.glCanvas.tween.start();
			this.clock.start();
		}
	};

	function _FlareEffect() {
		this.targetImg = null;
		this.forever = false;
		this.fromTime = 0;
		this.toTime = 0;
		this.glCanvas = null;
		this.animFrame = null;
	}

	_FlareEffect.prototype.setTarget = function(target) {
		this.targetImg = target;
		this.glCanvas = new GLCanvas(target);
		this.glCanvas.drawImage(target);
		target.style.display = "none";
	};

	_FlareEffect.prototype.setForever = function() {
		this.forever = true;
	};

	_FlareEffect.prototype.start = function() {
        var that = this;
		var update = function(cv, elapsedTime, delta) {
//            that.glCanvas.camera.position.x += 10;
//            that.glCanvas.camera.position.y += 10;
            if(that.glCanvas.lensFlare.position.x < (that.glCanvas.box.max.x)/4)
            {
                that.glCanvas.lensFlare.position.x++;
                that.glCanvas.lensFlare.position.y += 0.0025;
                that.glCanvas.lensFlare.position.z++;
            }
            else
            {
                that.glCanvas.lensFlare.position.set( that.glCanvas.box.min.x +10 , that.glCanvas.box.max.y -10, -1 );
            }
//            that.glCanvas.lensFlare.position.z--;
//            console.log(that.glCanvas.source);
		},
		render = function(cv, elapsedTime, delta) {
			cv.render();
		};
		(new AnimationFrameGen([update, render], this.glCanvas)).start();
	};

	return {
		effect: _FlareEffect,
		apply: _apply
	};
})();
