/**
<!---
	If you are looking at this, you probably DO want to put these effects on your site. 
	To let you out on a secret... this site wasn't built with Flitwick. It was hand-coded.. So look around for all the messy code you can find. Use it, if you like.
	But if you really want to be ON the cutting edge of this stuff... Let us know by signing up.
-->
*/
var Effect = function (container, height, width) {

    this.container = container;
    this.width = width || 500;
    this.height = height || 312;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    this.ambientlights = new THREE.AmbientLight(0xFFFFFF);
    this.scene.add(this.ambientlights);
};

Effect.prototype.apply = function () {

    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);

    this.camera.position.set(-0, 0, 100);
//        this.camera.position.set(0, 2000, 0);

    this.camera.lookAt(new THREE.Vector3(0, 0, -1000));

    this.container.height = this.height;
    this.container.width = this.width;
    this.container.appendChild(this.renderer.domElement);


};

var CarouselEffect = function (container, images) {

    Effect.call(this, container);
    this.images = images;
    this.textures = [];
    this.planes = [];
    //        this.carousel = new THREE.Object3D();
    this.carousel = new THREE.Group();
    this.carousel.position.set(0, 0, 0);
    this.loadTextures();

};
CarouselEffect.prototype = Object.create(Effect.prototype);
CarouselEffect.prototype.constructor = CarouselEffect;

CarouselEffect.prototype.loadTextures = function () {

    var that = this;
    this.images.forEach(function (image) {
        var texture = THREE.ImageUtils.loadTexture(image, {}, function () {
            that.textures.push(texture);
            if (that.textures.length == that.images.length) {
                that.init();
            }
        });
    });

};

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

CarouselEffect.prototype.init = function () {
    // Assuming all image planes will have same width. 
    // So, calculating radius based on the width of the 1st image only
    this.scaleTextures();
    var imgplane = CarouselEffect.getImagePlane(this.textures[0]);
    

    var tlen = this.textures.length;
    

    var t = 0;
    var theta = 360 / tlen;

    for (var i = 0; i < tlen; i++) {
        var imgplane = CarouselEffect.getImagePlane(this.textures[i]);
        var w = imgplane.geometry.boundingBox.max.x - imgplane.geometry.boundingBox.min.x;
        var r = 100 +  w / (2 * Math.tan(toRadians(180 / tlen)));
        imgplane.position.x = r * Math.sin(t);
        imgplane.position.z = r * Math.cos(t);
        imgplane.rotation.y = i * toRadians(theta) + Math.PI;

        t += toRadians(theta);

        this.carousel.add(imgplane);
    }

    this.scene.add(this.carousel);
    this.apply();
    this.renderer.render(this.scene, this.camera);
    this.render();
};

CarouselEffect.prototype.render = function () {
    var that = this;
    var wrappedfuntion = function () {
        that.render();
    };
    requestAnimationFrame(wrappedfuntion);
    this.renderer.render(this.scene, this.camera);
    this.carousel.rotation.y = this.carousel.rotation.y + Math.PI / 500;
};

CarouselEffect.getImagePlane = function (texture) {

    var plane = new THREE.PlaneBufferGeometry(texture.image.width, texture.image.height, 1, 1); //image.width, image.height);
    plane.computeBoundingBox();

    var material = new THREE.MeshBasicMaterial({
        map: texture
    });
    material.side = THREE.DoubleSide;
    
    var mesh = new THREE.Mesh(plane, material);
    return mesh;
};

CarouselEffect.prototype.scaleTextures = function () {
//    console.log( this.textures[0].image.height / this.textures[0].image.width;  );
//    
//    var scalefactor = (-(0.2 * this.textures[0].image.height) / this.textures[0].image.width ) + 2; 
//    console.log(scalefactor);
//    this.textures.forEach(function (texture) {
//        texture.image.width *= scalefactor;
//        texture.image.height *= scalefactor;
//        
//    });
    
};