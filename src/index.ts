import * as _ from 'lodash';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

var camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    transformControls: TransformControls,
    model: THREE.Group,
    orbitControls: OrbitControls;

function init() {

    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.set(10, 5, 10);
    camera.lookAt(0, 200, 0);

    // scene
    scene = new THREE.Scene();
    scene.add(new THREE.GridHelper(100, 20));

    // lights
    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);

    var ambientLight = new THREE.AmbientLight(0xcccccc, 0.6);
    scene.add(ambientLight);

    // orbit controls
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.update();
    orbitControls.addEventListener('change', render);

    //transform controls 
    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('change', render);

    transformControls.addEventListener('dragging-changed', function (event) {
        orbitControls.enabled = !event.value;
    });

    // model load
    var loader = new OBJLoader();

    loader.load(
        'models/PiletaSketchup.obj',
        (object) => onModelLoaded(object),
        (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
        (error) => console.log(error)
    );

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', function (event) {

        switch (event.keyCode) {
            case 81: // Q
                transformControls.setSpace(transformControls.space === "local" ? "world" : "local");
                break;
            case 16: // Shift
                transformControls.setTranslationSnap(100);
                transformControls.setRotationSnap(THREE.MathUtils.degToRad(15));
                // transformControls.setScaleSnap(0.25);
                break;
            case 87: // W
                transformControls.setMode("translate");
                break;
            case 69: // E
                transformControls.setMode("rotate");
                break;
            case 82: // R
                transformControls.setMode("scale");
                break;
            case 187:
            case 107: // +, =, num+
                transformControls.setSize(transformControls.size + 0.1);
                break;
            case 189:
            case 109: // -, _, num-
                transformControls.setSize(Math.max(transformControls.size - 0.1, 0.1));
                break;
            case 88: // X
                transformControls.showX = !transformControls.showX;
                break;
            case 89: // Y
                transformControls.showY = !transformControls.showY;
                break;
            case 90: // Z
                transformControls.showZ = !transformControls.showZ;
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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function onModelLoaded(object:THREE.Group){
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