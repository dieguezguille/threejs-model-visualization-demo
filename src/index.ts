import * as _ from 'lodash';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { Vector3 } from 'three';

let camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    transformControls: TransformControls,
    model: THREE.Group,
    orbitControls: OrbitControls;

let cameraX: number = 0, // rotación de la cámara
    cameraY: number = 1.7, // altura de la cámara (altura de una persona aprox)
    cameraZ: number = 8; // lejania de la cámara

let width: number,
    height: number;

let container: HTMLElement;

var node = document.getElementById("three");

if (node){
    container = node;
    console.log("Container div 'three' loaded succesfully");

    console.log("Container div width is 0 = " + (container.offsetWidth == 0));
    // width = container.offsetWidth;
    // height = container.offsetHeight;

    width = 800;
    height = 400;
}
else{
    console.log('No container detected. Configuring default values.');
    width = 800;
    height = 600;
}

var terrainAngle = document.getElementById("terrainAngle");
var terrainSkew = document.getElementById("terrainSkew");

if(terrainAngle && terrainSkew){
    terrainAngle.addEventListener("change", onTerrainAngleChanged);
    terrainSkew.addEventListener("change", onTerrainSkewChanged)
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

    // camera
    camera = new THREE.PerspectiveCamera(70, (width / height), 1, 3000);
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(0, 0, 0);

    // scene
    scene = new THREE.Scene();
    scene.add(new THREE.GridHelper(30, 10));
    scene.translateY(-1.7);
    scene.rotateX(0);

    // background
    let texture = new THREE.TextureLoader().load("textures/backyard.jpg");
    scene.background = texture;

    // light
    let ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // orbit controls
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enabled = false;
    // orbitControls.update();
    // orbitControls.addEventListener('change', render);

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
    model.position.copy(new Vector3(model.position.x, model.position.y - 1.3, model.position.z)); // acomodo el modelo al nivel del suelo
    scene.add(model);
    transformControls.attach(model);
    scene.add(transformControls);
    render();
}

function onTerrainAngleChanged(event: any){
    var newHeight = event.target.value;
    scene.setRotationFromAxisAngle(new Vector3(1,0,0), newHeight / 100);
    render();
}

function onTerrainSkewChanged(event: any){
    var newHeight = event.target.value;
    scene.setRotationFromAxisAngle(new Vector3(0,0,1), newHeight / 100);
    render();
}

function render() {
    transformControls.attach(model);
    renderer.render(scene, camera);
}