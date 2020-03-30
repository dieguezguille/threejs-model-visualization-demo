import * as _ from 'lodash';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { Vector3 } from 'three';

let camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    transformControls: TransformControls,
    model: THREE.Group;
// orbitControls: OrbitControls;

let cameraX: number = 0, // rotación de la cámara
    cameraY: number = 1.7, // altura de la cámara (altura de una persona aprox)
    cameraZ: number = 10; // lejania de la cámara

let width: number,
    height: number;

let sceneRotation: THREE.Euler;

let verticalSceneAngle: number,
    horizontalSceneAngle: number;

let container: HTMLElement;
let gridHelper = new THREE.GridHelper(20, 10);
let node = document.getElementById("three");
let gridHelperCheckbox = <HTMLInputElement>document.getElementById("gridHelperCheckbox");

let globalPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.9);

if (node) {
    container = node;
    console.log("Container div 'three' loaded succesfully");
    console.log("Container div width is " + container.offsetWidth);
    width = 800;
    height = 400;
}
else {
    console.log('No container detected. Configuring default values.');
    width = 800;
    height = 400;
}

var terrainAngle = document.getElementById("terrainAngle");

if (terrainAngle) {
    terrainAngle.addEventListener("change", onTerrainAngleChanged);
}

if (gridHelperCheckbox) {
    gridHelperCheckbox.addEventListener("click", onGridHelperCheckboxClicked);
}

init();
render();

function init() {

    // renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, powerPreference: 'high-performance', antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0xffffff, 0);
    renderer.gammaFactor = 2.2;
    container.appendChild(renderer.domElement);

    // ***** Clipping setup (renderer): *****
    var globalPlanes = [ globalPlane ];
    renderer.clippingPlanes = globalPlanes;
    renderer.localClippingEnabled = true;

    // camera
    camera = new THREE.PerspectiveCamera(55, (width / height), 1, 3000);
    camera.position.set(cameraX, cameraY, cameraZ);

    // scene
    scene = new THREE.Scene();
    scene.add(gridHelper);
    scene.translateY(-1.8);

    sceneRotation = scene.rotation;
    verticalSceneAngle = scene.rotation.x;
    horizontalSceneAngle = scene.rotation.y;

    console.log("vertical & horizontal angles: " + verticalSceneAngle + " " + horizontalSceneAngle);

    // background
    let texture = new THREE.TextureLoader().load("textures/room.jpg");
    scene.background = texture;

    // light
    let ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    //transform controls 
    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setMode("translate");
    transformControls.showY = false;
    transformControls.size = 2;
    transformControls.addEventListener('change', render);

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
                    (xhr) => console.log('Model is ' + (xhr.loaded / xhr.total * 100) + '% loaded'),
                    (error) => console.log(error));
        });

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
            case 87: // W
                transformControls.setMode("translate");
                transformControls.showY = false;
                transformControls.showX = true;
                transformControls.showZ = true;
                break;
            case 69: // E
                transformControls.setMode("rotate");
                transformControls.showY = true;
                transformControls.showX = false;
                transformControls.showZ = false;
                break;
            case 187:
            case 107: // +
                transformControls.setSize(transformControls.size + 0.1);
                break;
            case 189:
            case 109: // -
                transformControls.setSize(Math.max(transformControls.size - 0.1, 0.1));
                break;
            case 32: // Spacebar
                transformControls.enabled = !transformControls.enabled;
                break;
        }
    });
}

function onWindowResize() {
    width = container.offsetWidth; // new Width
    height = container.offsetHeight; // new Height
    camera.aspect = (width / height);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
}

function onModelLoaded(object: THREE.Group) {
    model = object;
    // model.scale.copy(new THREE.Vector3(1, 1, 1)); // model scaling
    model.position.copy(new Vector3(model.position.x, model.position.y - 1.3, model.position.z - 2)); // acomodo el modelo al nivel del suelo
    scene.add(model);
    render();
    scene.add(transformControls);
    transformControls.attach(model);
    render();
}

function onTerrainAngleChanged(event: any) {
    var value = event.target.value / 100;
    let axis = new Vector3(1, 0, 0).normalize();
    scene.setRotationFromAxisAngle(axis, verticalSceneAngle + value);
    console.log(sceneRotation);
    render();
}

function onGridHelperCheckboxClicked(event: any) {
    if (gridHelperCheckbox) {
        gridHelper.visible = gridHelperCheckbox.checked;
        render();
    }
}

function render() {
    renderer.render(scene, camera);
}