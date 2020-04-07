// THREE JS LIBRARY IMPORTS
import { Vector3, Quaternion, TextureLoader, AmbientLight, PerspectiveCamera, Scene, WebGLRenderer, Group, Euler, GridHelper } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
// CUSTOM IMPORTS
import { UnityData } from './models/unity-data';
import { JsonLoader } from './helpers/json-loader';
import { MouseDownEvents, MouseUpEvents } from './utility/mouse-events';

// VARIABLES
let camera: PerspectiveCamera,
    renderer: WebGLRenderer,
    unityData: UnityData,
    sceneRotation: Euler,
    verticalSceneSlope: number,
    horizontalSceneTilt: number,
    width: number,
    height: number,
    container: HTMLElement,
    gridHelper = new GridHelper(200, 100);

export let scene: Scene;
export let models: Array<Group> = [];

// UI ELEMENTS
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
    var image = new Image();
    image.src = 'textures/screenshot.jpg';
    image.onload = () => {
        updateScreenSize();
        loadUi();
        loadSceneData();
    }
}

function loadSceneData() {
    JsonLoader.load('json/SceneData.json', onJsonLoaded);
}

function loadUi() {

    // check if UI elements exist
    uiElementsArray.forEach(element => {
        if (!element) {
            alert("Loading UI failed. Check that all the UI elements exist and are named correctly.");
            return;
        }
    });

        // changed
    terrainSlope.addEventListener("change", onTerrainSlopeChanged);
    terrainTilt.addEventListener("change", onTerrainTiltChanged);
        // clicked
    plusHeightButton.addEventListener("click", onPlusHeightButtonClicked);
    minusHeightButton.addEventListener("click", onMinusHeightButtonCLicked);
    helperControlsCheckbox.addEventListener("click", onHelperControlsCheckboxClicked);
        // mousedown
    upButton.addEventListener("mousedown", MouseDownEvents.onUpButtonMouseDown);
    downButton.addEventListener("mousedown", MouseDownEvents.onDownButtonMouseDown);
    leftButton.addEventListener("mousedown", MouseDownEvents.onLeftButtonMouseDown);
    rightButton.addEventListener("mousedown", MouseDownEvents.onRightButtonMouseDown);
    rotateLeftButton.addEventListener("mousedown", MouseDownEvents.onRotateLeftButtonMouseDown);
    rotateRightButton.addEventListener("mousedown", MouseDownEvents.onRotateRightButtonMouseDown);
        // mouseup
    upButton.addEventListener("mouseup", MouseUpEvents.onMouseUp);
    downButton.addEventListener("mouseup", MouseUpEvents.onMouseUp);
    leftButton.addEventListener("mouseup", MouseUpEvents.onMouseUp);
    rightButton.addEventListener("mouseup", MouseUpEvents.onMouseUp);
    rotateLeftButton.addEventListener("mouseup", MouseUpEvents.onMouseUp);
    rotateRightButton.addEventListener("mouseup", MouseUpEvents.onMouseUp);
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
    renderer = new WebGLRenderer({ alpha: true, powerPreference: 'high-performance', antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0xffffff, 0);
    renderer.gammaFactor = 2;
    container.appendChild(renderer.domElement);

    // camera
    camera = new PerspectiveCamera(unityData.CameraFov, unityData.CameraAspect, 1, 2000);

    var position = new Vector3(
        unityData.CameraPosition.x,
        unityData.CameraPosition.y,
        unityData.CameraPosition.z
    )

    camera.position.copy(position);

    var rotation = new Quaternion(
        -unityData.CameraRotation.x,
        unityData.CameraRotation.y,
        unityData.CameraRotation.z,
        unityData.CameraRotation.w
    )

    camera.setRotationFromQuaternion(rotation);

    // scene
    scene = new Scene();
    scene.add(gridHelper);
    scene.translateY(-50);

    sceneRotation = scene.rotation;
    verticalSceneSlope = scene.rotation.x;
    horizontalSceneTilt = scene.rotation.y;

    // background image
    let texture = new TextureLoader().load("textures/screenshot.jpg");
    scene.background = texture;

    // light
    let ambientLight = new AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // model load
    new FBXLoader()
        .setPath('models/OnGroundPoolExample/')
        .load('KayakPool_004.fbx',
            (model) => onModelLoad(model),
            (xhr) => console.log('Model is ' + (xhr.loaded / xhr.total * 100) + '% loaded'),
            (error) => console.log(error));
};

function onWindowResize() {
    updateScreenSize();
    camera.aspect = (width / height);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
}

function updateScreenSize() {
    var aspect = (window.innerHeight / window.innerWidth);
    width = (image.width * 0.2) / aspect;
    height = (image.height * 0.2) / aspect;
}

function onModelLoad(model: Group) {
    // create group
    models[0] = new Group();
    models[0].name = 'group';
    scene.add(models[0]);

    // the model of pool
    model.renderOrder = 3;
    models[0].add(model);

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

function onPlusHeightButtonClicked() {
    scene.position.y += 0.5;
    render();
}

function onMinusHeightButtonCLicked() {
    scene.position.y -= 0.5;
    render();
}

// grid helper events
function onHelperControlsCheckboxClicked() {
    if (helperControlsCheckbox) {
        let value = helperControlsCheckbox.checked;
        gridHelper.visible = value;
        render();
    }
}

export function render() {
    renderer.render(scene, camera);
}