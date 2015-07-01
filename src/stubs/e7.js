
/**
<!---
	If you are looking at this, you probably DO want to put these effects on your site. 
	To let you out on a secret... this site wasn't built with Flitwick. It was hand-coded.. So look around for all the messy code you can find. Use it, if you like.
	But if you really want to be ON the cutting edge of this stuff... Let us know by signing up.
-->
*/
var CarBox = (function() {
	var _parent = null,
		_jqParent = null;

	function _apply(effect, objectURL, parentNode) {
		_parent = parentNode;
		_jqParent = $(_parent);

		var w = _jqParent.width(), h =  _jqParent.height();

		w = document.documentElement ? document.documentElement.offsetWidth : $(Window).width();
		h = document.documentElement ? document.documentElement.offsetHeight : $(Window).height();

		effect.setTarget(objectURL, _parent, w, h);
		effect.start();
	}

	function GLCanvas(obj, width, height) {

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
		this.camera.position.set(365, 50, 365);
		this.camera.lookAt(new THREE.Vector3(0,-150,-50));

		this.renderer = new THREE.WebGLRenderer({antialias: true, transparent: true});
		this.renderer.shadowMapEnabled	= true;
		this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize(width, height);

		_parent.appendChild(this.renderer.domElement);

		this.mirrorSphereCamera = new THREE.CubeCamera( 0.1, 5000, 512 );
		this.mirrorSphereCamera.position.set(200, 200, 200);
		this.scene.add( this.mirrorSphereCamera );

		this.scene.add( new THREE.AmbientLight( 0xcccccc ) );
		var lightPoint = new THREE.DirectionalLight(  0xffffff, 1);
		var dir = new THREE.Vector3(1, 20 ,1 );
		this.scene.add( lightPoint );
		
	
		var gplane = new THREE.CubeGeometry(2500, 50, 2000);
		var objTexture = THREE.ImageUtils.loadTexture('./src/theme/img/crate9.jpg');
		var material = new THREE.MeshPhongMaterial( { map: objTexture} );
		var ground = new THREE.Mesh(gplane, material);
		ground.position.x=0;
        ground.position.y=-180;
		ground.position.z=0;
		// ground.rotation.x=20;
		ground.receiveShadow=true;
		ground.castShadow=false;
		this.scene.add(ground);

		var spotLight	= new THREE.DirectionalLight( 0xFFFFFF,400 );
		spotLight.position.x=0;
		spotLight.position.y=50;
		spotLight.position.z=0;
		spotLight.shadowCameraNear	= 0.1;
		spotLight.castShadow		= true;
		spotLight.onlyShadow = true;
		spotLight.shadowDarkness = 0.5;
		spotLight.angle=Math.PI/2;
		this.scene.add(spotLight);


		var materialArray = [];
		materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( './src/theme/img/posx.jpg' ) }));
		materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( './src/theme/img/negx.jpg' ) }));
		materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( './src/theme/img/posy.jpg' ) }));
		materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( './src/theme/img/negy.jpg' ) }));
		materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( './src/theme/img/posz.jpg' ) }));
		materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( './src/theme/img/negz.jpg' ) }));
		for (var i = 0; i < 6; i++)
		   materialArray[i].side = THREE.BackSide;
		var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
		var skyboxGeom = new THREE.CubeGeometry( 5000, 5000, 5000, 1, 1, 1 );
		var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
		this.scene.add( skybox );
	}

	
	GLCanvas.prototype.render = function() {
		this.mirrorSphereCamera.updateCubeMap( this.renderer, this.scene );
		this.renderer.render(this.scene, this.camera);
	};

	GLCanvas.prototype.loadMesh = function(path) {
		var loader = new THREE.SceneLoader(),
			i, arr,
			that = this;
		loader.load(
				path, 
				function ( result ) {
					car = result.scene.children[1];
					arr = car.children[0].children[0].children;
					for(i=0; i< arr.length; i++) {
						var item = arr[i];
						if (item.name === "body") {
							carBody = item;
							carBody.material.envMap = that.mirrorSphereCamera.renderTarget;
							carBody.reflectivity = 0.2;
							carBody.material.combine = THREE.MixOperation;
						}
						if (item instanceof THREE.Mesh)  {
							item.castShadow = true;
						}
					}
					car.position.x = 0;
					car.position.y = -150;
					car.position.z = -20;
					car.receiveShadow = false;
					that.scene.add( car );
				}, 
				function ( xhr ) {}
			);
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

	function _CarBoxEffect() {
		this.glCanvas = null;
	}

	_CarBoxEffect.prototype.setTarget = function(url, target, w, h) {
		this.glCanvas = new GLCanvas(target, w, h);
		this.glCanvas.loadMesh(url);
	};

	_CarBoxEffect.prototype.start = function() {
		var dt = 0;
		var update = function(cv, elapsedTime, delta) {
			var eTime = elapsedTime / 2.0;
			var st = Math.sin(eTime), ct = Math.cos(eTime);
			var t = (300.0 + 150 * st + 150 * ct) + dt;
			dt += 5 * st * ct;
			cv.camera.position.x = t * Math.cos(eTime);
			cv.camera.position.z = t * Math.sin(eTime);
			cv.camera.lookAt(new THREE.Vector3(0,-150,-50));
		},
		render = function(cv, elapsedTime, delta) {
			cv.render();
		};
		(new AnimationFrameGen([update, render], this.glCanvas)).start();
	};

	return {
		effect: _CarBoxEffect,
		apply: _apply
	};
})();

