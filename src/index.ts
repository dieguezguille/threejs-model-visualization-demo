import * as _ from 'lodash';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
// import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { Vector3 } from 'three';


// SCENE
let camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    modelGroup: THREE.Group;

let cameraX: number = 0,
    cameraY: number = 1.7, // altura de la cámara (altura de una persona aprox)
    cameraZ: number = 12; // lejania de la cámara

let width: number,
    height: number;

let sceneRotation: THREE.Euler;

let verticalSceneAngle: number,
    horizontalSceneAngle: number;

let container: HTMLElement;
let gridHelper = new THREE.GridHelper(200, 100);
let timer: any;

// UI
let node = document.getElementById("three");
let terrainAngle = <HTMLInputElement>document.getElementById("terrainAngle");
let terrainSkew = <HTMLInputElement>document.getElementById("terrainSkew");
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
    console.log("Container div width is " + container.offsetWidth);
    width = 800;
    height = 400;
}
else {
    console.log('No container detected. Configuring default values.');
    width = 800;
    height = 400;
}

if (terrainAngle && terrainSkew && helperControlsCheckbox && upButton && downButton && leftButton && rightButton && rotateLeftButton && rotateRightButton) {
    
    terrainAngle.addEventListener("change", onTerrainAngleChanged);
    terrainSkew.addEventListener("change", onTerrainSkewChanged);
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
    verticalSceneAngle = scene.rotation.x;
    horizontalSceneAngle = scene.rotation.y;

    console.log("vertical & horizontal angles: " + verticalSceneAngle + " " + horizontalSceneAngle);

    // background
    let texture = new THREE.TextureLoader().load("textures/backyard.jpg");
    scene.background = texture;

    // light
    let ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

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
    modelGroup = new THREE.Group();
    modelGroup.name = 'group';
    scene.add(modelGroup);

    // the inside of pool
    loadedModel.renderOrder = 3;
    modelGroup.add(loadedModel);

    // the invisibility box with a hole
    let cloakGeometry = new THREE.BoxGeometry(6.5, 4.1, 3.1);
    cloakGeometry.faces.splice(4, 2); // make hole on top by removing top two triangles

    let cloakMaterial = new THREE.MeshBasicMaterial({
        colorWrite: false
    });

    let cloakMesh = new THREE.Mesh(cloakGeometry, cloakMaterial);
    cloakMesh.scale.set(1, 1, 1).multiplyScalar(1.01);
    cloakMesh.position.y = -0.7;
    cloakMesh.renderOrder = 0;
    modelGroup.add(cloakMesh);

    // final adjustments
    modelGroup.position.copy(new Vector3(modelGroup.position.x, modelGroup.position.y - 2.6, modelGroup.position.z)); // acomodo el modelo al nivel del suelo
    modelGroup.scale.set(2, 2, 2);
    // scene.add(transformControls);
    // transformControls.attach(modelGroup);
    // transformControls.translateOnAxis(new Vector3(0, 1, 0), 3.2);

    render();
}

function onTerrainAngleChanged(event: any) {
    var value = event.target.value / 50;
    sceneRotation.x = verticalSceneAngle + value;
    render();
}

function onTerrainSkewChanged(event: any) {
    var value = event.target.value / 50;
    sceneRotation.z = horizontalSceneAngle + value;
    render();
}

function onHelperControlsCheckboxClicked(event: any) {
    if (helperControlsCheckbox) {
        let value = helperControlsCheckbox.checked;
        gridHelper.visible = value;
        // transformControls.visible = value;
        render();
    }
}

// move actions
function moveModelDown() {
    modelGroup.position.z -= 0.01;
    render();
}

function moveModelUp() {
    modelGroup.position.z += 0.01;
    render();
}

function moveModelLeft() {
    modelGroup.position.x -= 0.01;
    render();
}

function moveModelRight() {
    modelGroup.position.x += 0.01;
    render();
}

function rotateModelLeft() {
    modelGroup.rotation.y -= 0.01;
    render();
}

function rotateModelRight() {
    modelGroup.rotation.y += 0.01;
    render();
}

// mouse down events
function onUpButtonMouseDown(event: any) {
    if (timer) return;
    timer = setInterval(moveModelDown, 10);
}

function onDownButtonMouseDown(event: any) {
    if (timer) return;
    timer = setInterval(moveModelUp, 10);
}

function onLeftButtonMouseDown(event: any) {
    if (timer) return;
    timer = setInterval(moveModelLeft, 10);
}

function onRightButtonMouseDown(event: any) {
    if (timer) return;
    timer = setInterval(moveModelRight, 10);
}

function onRotateLeftButtonMouseDown(event: any) {
    if (timer) return;
    timer = setInterval(rotateModelLeft, 10);
}

function onRotateRightButtonMouseDown(event: any) {
    if (timer) return;
    timer = setInterval(rotateModelRight, 10);
}

// mouse up events
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