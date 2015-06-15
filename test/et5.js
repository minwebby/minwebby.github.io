var container, stats, hex, color;

var camera, cameraTarget, scene, renderer;

var group, textMesh1, textGeo, material, positions = {x:[], y:[], z:[]};

var firstLetter = true;

var text = "Font Mesh !",

    height = 20,
    size = 70,
    hover = 30,

    curveSegments = 4,

    bevelThickness = 1,
    bevelSize = 1.5,
    bevelSegments = 15,
    bevelEnabled = true,

    font = "comic", // helvetiker, bauhaus93, agencyfb, verdana, comic
    weight = "normal", // normal bold
    style = "normal", // normal italic
    glUniforms = {};


var mirror = true;

init();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);


    // CAMERA

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 15000);
    camera.position.set(0, 0, 1000);

    cameraTarget = new THREE.Vector3(0, 0, 100);

    // SCENE

    scene = new THREE.Scene();
   // scene.fog = new THREE.Fog(0x000000, 250, 1400);

    // LIGHTS

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
    dirLight.position.set(0, 0, 1).normalize();
    scene.add(dirLight);

    var pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(0, 100, 90);
    scene.add(pointLight);
    glUniforms = {
        tm: {
            type: 'f',
            value: 1.0
        },
        resolution: {
            type: "v2",
            value: new THREE.Vector2()
        },
        posX: {
            type: 'f',
            value: 0.4
        },
        posY: {
            type: 'f',
            value: 0.5
        },
        radius: {
            type: 'f',
            value: 0.25
        },
        clr: {
            type: 'c',
            value: new THREE.Color(.1, .1, .1)
        }
    };

    material = new THREE.ShaderMaterial({
        uniforms: glUniforms,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent

    });
////    
        material = new THREE.MeshPhongMaterial({
            color: 0x505050,
            shading: THREE.FlatShading
        }); 
//    , // front // new THREE.MeshFaceMaterial([
//     
//     new THREE.MeshPhongMaterial({
//            color: 0xffffff,
//            shading: THREE.SmoothShading
//        }) // side
//    ]);

//    group = new THREE.Group();
//    group.position.y = 100;
//
//    scene.add(group);

    createText();

//    var plane = new THREE.Mesh(
//        new THREE.PlaneBufferGeometry(10000, 10000),
//        new THREE.MeshBasicMaterial({
//            color: 0xffffff,
//            opacity: 0.5,
//            transparent: true
//        })
//    );
//    plane.position.y = 100;
//    plane.rotation.x = -Math.PI / 2;
//    scene.add(plane);
    //
    // RENDERER

    renderer = new THREE.WebGLRenderer({
        antialias: false
    });
    // renderer.setClearColor(scene.fog.color);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);


}

function createText() {

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
        
        // "fix" side normals by removing z-component of normals for side faces
        // (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

        if (!bevelEnabled) {

            var triangleAreaHeuristics = 0.1 * (height * size);

            for (var i = 0; i < textGeo.faces.length; i++) {

                var face = textGeo.faces[i];

                if (face.materialIndex == 1) {

                    for (var j = 0; j < face.vertexNormals.length; j++) {

                        face.vertexNormals[j].z = 0;
                        face.vertexNormals[j].normalize();

                    }

                    var va = textGeo.vertices[face.a];
                    var vb = textGeo.vertices[face.b];
                    var vc = textGeo.vertices[face.c];

                    var s = THREE.GeometryUtils.triangleArea(va, vb, vc);

                    if (s > triangleAreaHeuristics) {

                        for (var j = 0; j < face.vertexNormals.length; j++) {

                            face.vertexNormals[j].copy(face.normal);

                        }

                    }

                }

            }

        }

        var centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

        textMesh1 = new THREE.Mesh(textGeo, material);

        textMesh1.position.x = centerOffset;
        textMesh1.position.y = 0;//hover;
        textMesh1.position.z = 0;
        //textMesh1.scale.set(0.25, 0.25, 0.25);
    
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

function animate() {

    requestAnimationFrame(animate);

    render();

}

function render() {

    camera.lookAt(cameraTarget);

    // renderer.clear();
    
    
    
    glUniforms.tm.value += 0.001;
    
    var geo = textMesh1.geometry;
    var i = 0, e = geo.vertices.length;
    var xx = (geo.boundingBox.max.x - geo.boundingBox.min.x);
    var yy = (geo.boundingBox.max.y - geo.boundingBox.min.y);
    
    var tm = glUniforms.tm.value;
    for (; i < e; ++i) {
        geo.vertices[i].x = positions.x[i] +  10.0 * Math.sin(tm * 50.0) * (positions.x[i] / xx) * (Math.sin(positions.y[i]/10.0)) ;
        geo.vertices[i].y = positions.y[i] +  10.0 * Math.sin(tm * 50.0) * (positions.y[i] / yy) * (Math.sin(positions.x[i]/10.0)) ;
    }
    
    textGeo.verticesNeedUpdate = true;
    
    
//    camera.position.x += Math.cos(glUniforms.tm.value) * 2;
//    camera.position.z += Math.sin(glUniforms.tm.value) * 2;

    renderer.render(scene, camera);

}