var SwimmingText = (function() {

    var container, stats, hex, color,camera, cameraTarget, scene, renderer, tm = 0,
        group, textMesh1, textGeo, material, positions = {x:[], y:[], z:[]}, 
        firstLetter = true,
        text = "Shapes",
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
         w = 375, // Math.max(jqParent.innerWidth(), 375),
         h = 250; //Math.max(jqParent.innerHeight(), 250);

        camera = new THREE.PerspectiveCamera(60, w / h, 0.001, 15000);
        camera.position.set(0, 0, 400);
        cameraTarget = new THREE.Vector3(0, 0, 100);

        scene = new THREE.Scene();
        
     
        
        var pointLight = new THREE.PointLight(0xffffff, 100);
        pointLight.position.set(0, 100, 90);
        scene.add(pointLight);
        
        // material = new THREE.MeshPhongMaterial({
        //     color: 0x505050,
        //     shading: THREE.FlatShading,
        //     size: 10 
        // }); 
        material = new THREE.PointCloudMaterial({
            size: 2,
            color: 0xffffff,
            vertexColors: THREE.VertexColors
        });
    
        _createText();
        renderer = new THREE.WebGLRenderer({antialias: false, alpha: true});
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

            // set initial colors
            var i = 0, e = textGeo.vertices.length;
            for (; i < e; ++i) {
                textGeo.colors[i] = new THREE.Color(0.5, 0.5, 0.5)
            }
            
            var centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
            textMesh1 = new THREE.PointCloud(textGeo, material);
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
        var cx = geo.boundingBox.min.x + 0.5 * xx;
        var tmSin = 600.0 * Math.sin(tm * 10.0);
        var t = 0, sint = 0, cost = 0;
        var trand  = 0, gr = 0;

        if (Math.abs(tmSin) > 70) {
            t = (tmSin > 0) ? tmSin - 70 : tmSin + 70;
            for (; i < e; ++i) {
                geo.vertices[i].x = positions.x[i] +  t * ((positions.x[i] - cx) / xx) * (Math.sin(positions.y[i]/10.0)) ;
                geo.vertices[i].z = positions.z[i] +  0.5 * t * Math.cos((positions.x[i] / xx) * 510.0) ;
                sint = Math.abs(Math.sin(geo.vertices[i].y));
                cost = Math.abs(Math.cos(geo.vertices[i].x));
                trand = Math.abs(Math.cos(geo.vertices[i].z)); 
                gr = Math.min( 0.3 * sint + 0.59 * cost + 0.11 * trand, 1.0 );

                geo.colors[i] = new THREE.Color(gr, gr, gr); // new THREE.Color(sint*sint + 0.5, cost*cost + 0.5, sint*cost + 0.5);
            }
        }
        // textMesh1.material.size +=  0.05 * Math.sin(tm * 10.0);
        
        textGeo.colorsNeedUpdate = true;
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
        renderer.domElement.style.display = "none";
        setTimeout(_animate, 0);
    };

    function _show() {
        $(renderer.domElement).show();
    }

    function _hide() {
        $(renderer.domElement).hide();
    }

    return {
        effect: _SwimmingTextEffect,
        mkawesome: {
            start: _show,
            show: _show,
            hide: _hide
        } 
    };

})();