import * as _ from 'lodash';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

var camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    transformControls: TransformControls,
    model: THREE.Group,
    orbitControls: OrbitControls;

var width: number = 800,
    height: number = 400;

var cameraX: number = 0, //
    cameraY: number = 2, // cuan alta estaba la cámara de unity al tomar el screenshot (en unidades de unity - metros)
    cameraZ: number = 25; //

var container = document.getElementById("three");

function init() {

    // renderer
    renderer = new THREE.WebGLRenderer({alpha: true, powerPreference: 'high-performance'},);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor( 0xffffff, 0);
    renderer.gammaFactor = 2.2;
    container?.appendChild(renderer.domElement);

    // camera
    camera = new THREE.PerspectiveCamera(50, width / height, 1, 3000);
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(0, 200, 0);

    // scene
    scene = new THREE.Scene();
    scene.add(new THREE.GridHelper(100, 100));

    // light
    var ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // orbit controls
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.update();
    orbitControls.addEventListener('change', render);

    //transform controls 
    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.showY = false;
    transformControls.setMode("translate");
    transformControls.addEventListener('change', render);
    transformControls.addEventListener('dragging-changed', function (event) {
        orbitControls.enabled = !event.value;
    });

    // model load
    new MTLLoader()
        .setPath('models/')
        .load('PiletaSketchup.mtl', function (materials) {
            materials.preload();
            new OBJLoader()
                .setMaterials(materials)
                .setPath('models/')
                .load('PiletaSketchup.obj',
                    (object) => onModelLoaded(object),
                    (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
                    (error) => console.log(error));
        });

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
            case 187:
            case 107: // +, =, num+
                transformControls.setSize(transformControls.size + 0.1);
                break;
            case 189:
            case 109: // -, _, num-
                transformControls.setSize(Math.max(transformControls.size - 0.1, 0.1));
                break;
            case 32: // Spacebar
                transformControls.enabled = !transformControls.enabled;
                break;
        }
    });
    window.addEventListener('keyup', function (event) {
        switch (event.keyCode) {
            case 17: // Ctrl
                transformControls.setTranslationSnap(null);
                transformControls.setRotationSnap(null);
                // transformControls.setScaleSnap(null);
                break;
        }
    });
}

function onWindowResize() {
    // camera.aspect = window.innerWidth / window.innerHeight;
    // camera.updateProjectionMatrix();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // render();
}

function onModelLoaded(object: THREE.Group) {
    model = object;
    scene.add(model);
    transformControls.attach(model);
    scene.add(transformControls);
    render();
}

function render() {
    renderer.render(scene, camera);
}

init();
render();