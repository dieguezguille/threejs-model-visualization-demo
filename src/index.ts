import * as _ from 'lodash';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { Vector3 } from 'three';

// SCENE
let camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer;
// modelGroup: THREE.Group;

enum Direction {
    Up,
    Down,
    Left,
    Right,
}

let movAmount = 0.01; // less is more precise but slower

let models: Array<THREE.Group> = [];

let cameraX: number = 0,
    cameraY: number = 1.7, // altura de la cámara (altura de una persona aprox)
    cameraZ: number = 2; // lejania de la cámara

let width: number,
    height: number;

let sceneRotation: THREE.Euler;

let verticalSceneSlope: number,
    horizontalSceneTilt: number;

let container: HTMLElement;
let gridHelper = new THREE.GridHelper(200, 100);
let timer: any;

// UI
let node = document.getElementById("three");
let terrainSlope = <HTMLInputElement>document.getElementById("terrainSlope");
let terrainTilt = <HTMLInputElement>document.getElementById("terrainTilt");
let helperControlsCheckbox = <HTMLInputElement>document.getElementById("helperControlsCheckbox");
let upButton = <HTMLInputElement>document.getElementById("upButton");
let downButton = <HTMLInputElement>document.getElementById("downButton");
let leftButton = <HTMLInputElement>document.getElementById("leftButton");
let rightButton = <HTMLInputElement>document.getElementById("rightButton");
let rotateLeftButton = <HTMLInputElement>document.getElementById("rotateLeftButton");
let rotateRightButton = <HTMLInputElement>document.getElementById("rotateRightButton");

if (node) {
    container = node;
    console.log("Container div 'three' loaded succesfully");
    console.log("Container div width is " + container.offsetWidth); // TODO: find containers width and height
    width = 800;
    height = 400;
}
else {
    console.log('No container detected. Configuring default values.');
    width = 800;
    height = 400;
}

if (terrainSlope && terrainTilt && helperControlsCheckbox && upButton && downButton && leftButton && rightButton && rotateLeftButton && rotateRightButton) {

    terrainSlope.addEventListener("change", onTerrainSlopeChanged);
    terrainTilt.addEventListener("change", onTerrainTiltChanged);
    helperControlsCheckbox.addEventListener("click", onHelperControlsCheckboxClicked);

    // mouse down events
    upButton.addEventListener("mousedown", onUpButtonMouseDown);
    downButton.addEventListener("mousedown", onDownButtonMouseDown);
    leftButton.addEventListener("mousedown", onLeftButtonMouseDown);
    rightButton.addEventListener("mousedown", onRightButtonMouseDown);
    rotateLeftButton.addEventListener("mousedown", onRotateLeftButtonMouseDown);
    rotateRightButton.addEventListener("mousedown", onRotateRightButtonMouseDown);

    // mouse up events
    upButton.addEventListener("mouseup", onUpButtonMouseUp);
    downButton.addEventListener("mouseup", onDownButtonMouseUp);
    leftButton.addEventListener("mouseup", onLeftButtonMouseUp);
    rightButton.addEventListener("mouseup", onRightButtonMouseUp);
    rotateLeftButton.addEventListener("mouseup", onRotateLeftButtonMouseUp);
    rotateRightButton.addEventListener("mouseup", onRotateRightButtonMouseUp);
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
    camera = new THREE.PerspectiveCamera(50, (width / height), 1, 2000);
    camera.position.set(cameraX, cameraY, cameraZ);

    // scene
    scene = new THREE.Scene();
    scene.add(gridHelper);
    scene.translateY(-1.6);

    sceneRotation = scene.rotation;
    verticalSceneSlope = scene.rotation.x;
    horizontalSceneTilt = scene.rotation.y;

    // background
    let texture = new THREE.TextureLoader().load("textures/backyard.jpg");
    scene.background = texture;

    // light
    let ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // model load
    new MTLLoader()
        .setPath('models/RecessedPool_002/')
        .load('KayakPool_002.mtl', function (materials) {
            materials.preload();
            new OBJLoader()
                .setMaterials(materials)
                .setPath('models/RecessedPool_002/')
                .load('KayakPool_002.obj',
                    (object) => onModelLoaded(object),
                    (xhr) => console.log('Model is ' + (xhr.loaded / xhr.total * 100) + '% loaded'),
                    (error) => console.log(error));
        });

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    width = container.offsetWidth; // new Width
    height = container.offsetHeight; // new Height
    camera.aspect = (width / height);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
}

function onModelLoaded(loadedModel: THREE.Group) {
    // create group
    models[0] = new THREE.Group();
    models[0].name = 'group';
    scene.add(models[0]);

    // the inside of pool
    loadedModel.renderOrder = 3;
    models[0].add(loadedModel);

    // the invisibility box with a hole
    // let cloakGeometry = new THREE.BoxGeometry(6.5, 3.5, 3);
    // cloakGeometry.faces.splice(4, 2); // make hole on top by removing top two triangles

    // let cloakMaterial = new THREE.MeshBasicMaterial({
    //     colorWrite: false
    // });

    // let cloakMesh = new THREE.Mesh(cloakGeometry, cloakMaterial);
    // cloakMesh.scale.set(1, 1, 1).multiplyScalar(1.01);
    // cloakMesh.position.y = -0.4;
    // cloakMesh.position.z = 0.05;
    // cloakMesh.position.x = 0.04;
    // cloakMesh.renderOrder = 0;
    // models[0].add(cloakMesh);

    // // final adjustments
    // models[0].position.copy(new Vector3(models[0].position.x, models[0].position.y - 2.6, models[0].position.z - 10)); // acomodo el modelo al nivel del suelo
    // models[0].scale.set(2, 2, 2);
    models[0].position.copy(new Vector3(models[0].position.x, models[0].position.y + 4, models[0].position.z - 10));
    models[0].scale.set(0.05, 0.05, 0.05);

    render();
}

// terrain events
function onTerrainSlopeChanged(event: any) {
    var value = event.target.value / 50;
    sceneRotation.x = verticalSceneSlope + value;
    render();
}

function onTerrainTiltChanged(event: any) {
    var value = event.target.value / 50;
    sceneRotation.z = horizontalSceneTilt + value;
    render();
}

// grid helper events
function onHelperControlsCheckboxClicked(event: any) {
    if (helperControlsCheckbox) {
        let value = helperControlsCheckbox.checked;
        gridHelper.visible = value;
        render();
    }
}

// move actions
function moveModel(direction: Direction){
    switch (direction){
        case Direction.Up: {
            models[0].position.z -= movAmount;
            break;
        }
        case Direction.Down: {
            models[0].position.z += movAmount;
            break;
        }
        case Direction.Left: {
            models[0].position.x -= movAmount;
            break;
        }
        case Direction.Right: {
            models[0].position.x += movAmount;
            break;
        }
    }

    render();
}

function rotateModelLeft() {
    models[0].rotation.y -= 0.01;
    render();
}

function rotateModelRight() {
    models[0].rotation.y += 0.01;
    render();
}

// model mouse down events
function onUpButtonMouseDown(event: any) {
    if (timer) return;
    timer = setInterval(() => moveModel(Direction.Up), 10);
}

function onDownButtonMouseDown(event: any) {
    if (timer) return;
    timer = setInterval(() => moveModel(Direction.Down), 10);
}

function onLeftButtonMouseDown(event: any) {
    if (timer) return;
    timer = setInterval(() => moveModel(Direction.Left), 10);
}

function onRightButtonMouseDown(event: any) {
    if (timer) return;
    timer = setInterval(() => moveModel(Direction.Right), 10);
}

function onRotateLeftButtonMouseDown(event: any) {
    if (timer) return;
    timer = setInterval(rotateModelLeft, 10);
}

function onRotateRightButtonMouseDown(event: any) {
    if (timer) return;
    timer = setInterval(rotateModelRight, 10);
}

// model mouse up events
function resetTimer() {
    clearInterval(timer);
    timer = null;
    render();
}

function onUpButtonMouseUp(event: any) {
    resetTimer();
}

function onDownButtonMouseUp(event: any) {
    resetTimer();
}

function onLeftButtonMouseUp(event: any) {
    resetTimer();
}

function onRightButtonMouseUp(event: any) {
    resetTimer();
}

function onRotateLeftButtonMouseUp(event: any) {
    resetTimer();
}

function onRotateRightButtonMouseUp(event: any) {
    resetTimer();
}

function render() {
    renderer.render(scene, camera);
}