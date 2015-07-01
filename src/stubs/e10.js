/**
<!---
	If you are looking at this, you probably DO want to put these effects on your site. 
	To let you out on a secret... this site wasn't built with Flitwick. It was hand-coded.. So look around for all the messy code you can find. Use it, if you like.
	But if you really want to be ON the cutting edge of this stuff... Let us know by signing up.
-->
*/
var Effect = function (container, height, width) {

    this.container = container;
    this.width = width || 1000;
    this.height = height || 700;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.renderer = new THREE.WebGLRenderer({
        antialias: true,
    });

    this.ambientlights = new THREE.AmbientLight(0xFFFFFF);
    this.scene.add(this.ambientlights);
};

Effect.prototype.apply = function () {

    //    this.renderer.shadowMapEnabled = true;
    //    this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);

    this.camera.position.set(-1200, 250, 300);
//    this.camera.position.set(0, 2000, 0);

    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

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
CarouselEffect.prototype.init = function () {

    var tlen = this.textures.length;
    var inttheta = 2.0 * Math.PI / tlen;
    var tsint = 0.5 / Math.sin(inttheta * 0.5);
    var stheta = 1.5 * -inttheta;

    for (var i = 0; i < tlen; i++) {

        var imgplane = CarouselEffect.getImagePlane(this.textures[i]);
        var w = imgplane.geometry.boundingBox.max.x - imgplane.geometry.boundingBox.min.x;
        var r = w * tsint;
        imgplane.rotation.y = 0.5 * Math.PI - stheta;

        var x = r * Math.cos(stheta),
            z = r * Math.sin(stheta);

        imgplane.position.x = x - w / 2;
        imgplane.position.z = z;


        stheta += inttheta;

        this.planes.push(imgplane);
    }


    this.apply();
    this.align();
    this.scene.add(this.carousel);


    this.renderer.render(this.scene, this.camera);
    this.render();

};

CarouselEffect.prototype.align = function () {
    var maxTrans = {
        x: 0,
        y: 0,
        z: 0
    };
    var minTrans = {
        x: 0,
        y: 0,
        z: 0
    };
    var translate2Center = {
        x: 0,
        y: 0,
        z: 0
    };
    for (var i = 0; i < this.planes.length; i++) {
        var temp = this.planes[i].position;

        if (temp.x > maxTrans.x) maxTrans.x = temp.x;
        else if (temp.x < minTrans.x) minTrans.x = temp.x;
        if (temp.y > maxTrans.y) maxTrans.y = temp.y;
        else if (temp.y < minTrans.y) minTrans.y = temp.y;
        if (temp.z > maxTrans.z) maxTrans.z = temp.z;
        else if (temp.z < minTrans.z) minTrans.z = temp.z;
    }
    translate2Center.x = minTrans.x + (maxTrans.x - minTrans.x) / 2;
    translate2Center.y = minTrans.y + (maxTrans.y - minTrans.y) / 2;
    translate2Center.z = minTrans.z + (maxTrans.z - minTrans.z) / 2;

    for (var i = 0; i < this.planes.length; i++) {

        this.planes[i].position.x = this.planes[i].position.x - translate2Center.x;
        this.planes[i].position.y = this.planes[i].position.y - translate2Center.y;
        this.planes[i].position.z = this.planes[i].position.z - translate2Center.z;
        this.carousel.add(this.planes[i]);
    }
    this.carousel.applyMatrix(new THREE.Matrix4().makeTranslation(
        translate2Center.x, translate2Center.y, translate2Center.z));
};


CarouselEffect.prototype.render = function () {
    var that = this;
    var wrappedfuntion = function () {
        that.render();
    };
    requestAnimationFrame(wrappedfuntion);
    this.renderer.render(this.scene, this.camera);
    this.carousel.rotation.y = this.carousel.rotation.y + Math.PI / 180;
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