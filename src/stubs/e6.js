var SwimmingText = (function() {

    var container, stats, hex, color,camera, cameraTarget, scene, renderer, tm = 0,
        group, textMesh1, textGeo, material, positions = {x:[], y:[], z:[]}, 
        firstLetter = true,
        text = "Font Mesh !",
        height = 20,
        size = 70,
        hover = 30,
        curveSegments = 4,
        bevelThickness = 1,
        bevelSize = 1.5,
        bevelSegments = 15,
        bevelEnabled = true,
        font = "comic", 
        weight = "normal", 
        style = "normal", 
        mirror = true;

    function _init(parentContainer) {

        var jqParent = $(parentContainer),
         w = Math.max(jqParent.innerWidth(), 500),
         h = Math.max(jqParent.innerHeight(), 200);

        camera = new THREE.PerspectiveCamera(60, w / h, 0.001, 15000);
        camera.position.set(0, 0, 340);
        cameraTarget = new THREE.Vector3(0, 0, 100);

        scene = new THREE.Scene();
        
        var dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
        dirLight.position.set(0, 0, 1).normalize();
        scene.add(dirLight);
        
        var pointLight = new THREE.PointLight(0xffffff, 1.5);
        pointLight.position.set(0, 100, 90);
        scene.add(pointLight);
        
        material = new THREE.MeshPhongMaterial({
            color: 0x505050,
            shading: THREE.FlatShading
        }); 
    
        _createText();
        renderer = new THREE.WebGLRenderer({antialias: false});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(w, h);
        parentContainer.appendChild(renderer.domElement);
    }

    function _createText() {

            textGeo = new THREE.TextGeometry(text, {
                size: size,
                height: height,
                curveSegments: curveSegments,
                font: font,
                weight: weight,
                style: style,
                bevelThickness: bevelThickness,
                bevelSize: bevelSize,
                bevelEnabled: bevelEnabled,
                material: 0,
                extrudeMaterial: 1
            });

            textGeo.computeBoundingBox();
            textGeo.mergeVertices();
            textGeo.computeVertexNormals();
            
            var centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
            textMesh1 = new THREE.Mesh(textGeo, material);
            textMesh1.position.x = centerOffset;
            textMesh1.position.y = 0;//hover;
            textMesh1.position.z = 0;
            
            cameraTarget = new THREE.Vector3(0, 0, 0);
        
            textMesh1.rotation.x = 0;
            textMesh1.rotation.y = 0; //Math.PI / 4 ;
            
            scene.add(textMesh1);
        
            for (var j = 0, je = textGeo.vertices.length; j < je; ++j) {
                positions.x.push(textGeo.vertices[j].x);
                positions.y.push(textGeo.vertices[j].y);
                positions.z.push(textGeo.vertices[j].z);
            }
        }
        //

    function _animate() {

        requestAnimationFrame(_animate);

        _render();

    }

    function _render() {

        camera.lookAt(cameraTarget);

        tm += 0.001;
        
        var geo = textMesh1.geometry;
        var i = 0, e = geo.vertices.length;
        var xx = (geo.boundingBox.max.x - geo.boundingBox.min.x);
        var yy = (geo.boundingBox.max.y - geo.boundingBox.min.y);
        
        for (; i < e; ++i) {
            geo.vertices[i].x = positions.x[i] +  10.0 * Math.sin(tm * 50.0) * (positions.x[i] / xx) * (Math.sin(positions.y[i]/10.0)) ;
            geo.vertices[i].y = positions.y[i] +  10.0 * Math.sin(tm * 50.0) * (positions.y[i] / yy) * (Math.sin(positions.x[i]/10.0)) ;
        }
        
        textGeo.verticesNeedUpdate = true;
        renderer.render(scene, camera);
    }

    function _SwimmingTextEffect() {
    }

    _SwimmingTextEffect.prototype.init = function(cont) {
        _init(cont)
        return this;
    };

    _SwimmingTextEffect.prototype.start = function(cont) {
        setTimeout(_animate, 0);
    };

    return {
        effect: _SwimmingTextEffect
    };

})();