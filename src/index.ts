import * as _ from 'lodash';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// SCENE
let camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    orbitControls: OrbitControls

let unityData: any;

enum Direction {
    Up,
    Down,
    Left,
    Right,
}

let movAmount = 0.5; // less is more precise but slower

let models: Array<THREE.Group> = [];

let width: number,
    height: number;

let sceneRotation: THREE.Euler;

let verticalSceneSlope: number,
    horizontalSceneTilt: number;

let container: HTMLElement;
let gridHelper = new THREE.GridHelper(200, 100);
let timer: any;

// UI

let node = <HTMLInputElement>document.getElementById("three"),
    terrainSlope = <HTMLInputElement>document.getElementById("terrainSlope"),
    terrainTilt = <HTMLInputElement>document.getElementById("terrainTilt"),
    helperControlsCheckbox = <HTMLInputElement>document.getElementById("helperControlsCheckbox"),
    upButton = <HTMLInputElement>document.getElementById("upButton"),
    downButton = <HTMLInputElement>document.getElementById("downButton"),
    leftButton = <HTMLInputElement>document.getElementById("leftButton"),
    rightButton = <HTMLInputElement>document.getElementById("rightButton"),
    plusHeightButton = <HTMLInputElement>document.getElementById("plusHeightButton"),
    minusHeightButton = <HTMLInputElement>document.getElementById("minusHeightButton"),
    rotateLeftButton = <HTMLInputElement>document.getElementById("rotateLeftButton"),
    rotateRightButton = <HTMLInputElement>document.getElementById("rotateRightButton");

let uiElementsArray: Array<HTMLInputElement> = [
    node,
    terrainSlope,
    terrainTilt,
    helperControlsCheckbox,
    upButton,
    downButton,
    leftButton,
    rightButton,
    plusHeightButton,
    minusHeightButton,
    rotateLeftButton,
    rotateRightButton
];

if (node) {
    container = node;
    console.log("Container div 'three' loaded succesfully");

    var image = new Image();
    image.src = 'textures/screenshot.jpg';

    image.onload = () => {
        console.log(image.width);
        console.log(image.height);

        width = 2340 / 4;
        height = 1080 / 4;

        loadUi();
        loadJSON(onJsonLoaded);
    }
}

function loadUi() {

        uiElementsArray.forEach(element => {
            if (!element){
                alert("Loading UI failed. Check that all the UI elements exist and are named correctly.");
                return;
            }
        });

        terrainSlope.addEventListener("change", onTerrainSlopeChanged);
        terrainTilt.addEventListener("change", onTerrainTiltChanged);
        plusHeightButton.addEventListener("click", onPlusHeightButtonClicked);
        minusHeightButton.addEventListener("click", onMinusHeightButtonCLicked);
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

function loadJSON(callback: Function) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'json/SceneData.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == 200) {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function onJsonLoaded(response: string) {
    unityData = JSON.parse(response);
    console.log(unityData);
    init();
    render();
}

function init() {

    // window
    window.addEventListener('resize', onWindowResize, false);

    // renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, powerPreference: 'high-performance', antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0xffffff, 0);
    renderer.gammaFactor = 2;
    container.appendChild(renderer.domElement);

    // camera
    camera = new THREE.PerspectiveCamera(unityData.CameraFov, unityData.CameraAspect, 1, 2000);

    var position = new Vector3(
        unityData.CameraPosition.x,
        unityData.CameraPosition.y,
        unityData.CameraPosition.z
    )

    camera.position.copy(position);

    var rotation = new THREE.Quaternion(
        -unityData.CameraRotation.x,
        unityData.CameraRotation.y,
        unityData.CameraRotation.z,
        unityData.CameraRotation.w
    )

    camera.setRotationFromQuaternion(rotation);

    // scene
    scene = new THREE.Scene();
    scene.add(gridHelper);
    scene.translateY(-50);

    sceneRotation = scene.rotation;
    verticalSceneSlope = scene.rotation.x;
    horizontalSceneTilt = scene.rotation.y;

    // sceneRotation.x = verticalSceneSlope + 50;

    // background
    let texture = new THREE.TextureLoader().load("textures/screenshot.jpg");
    scene.background = texture;

    // light
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // model load
    new FBXLoader()
        .setPath('models/OnGroundPoolExample/')
        .load('KayakPool_004.fbx',
            (object) => onModelLoaded(object),
            (xhr) => console.log('Model is ' + (xhr.loaded / xhr.total * 100) + '% loaded'),
            (error) => console.log(error));
};

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

    // the model of pool
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
    models[0].position.copy(new Vector3(0, -2.3, models[0].position.z - 10));
    models[0].scale.set(0.02, 0.02, 0.02);
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

function onPlusHeightButtonClicked(event: any) {
    scene.position.y += 0.5;
    render();
}

function onMinusHeightButtonCLicked(event: any) {
    scene.position.y -= 0.5;
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
function moveModel(direction: Direction) {
    switch (direction) {
        case Direction.Up: {
            scene.position.z -= movAmount;
            break;
        }
        case Direction.Down: {
            scene.position.z += movAmount;
            break;
        }
        case Direction.Left: {
            scene.position.x -= movAmount;
            break;
        }
        case Direction.Right: {
            scene.position.x += movAmount;
            break;
        }
    }

    render();
}

function rotateModelLeft() {
    scene.rotation.y -= 0.01;
    render();
}

function rotateModelRight() {
    scene.rotation.y += 0.01;
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