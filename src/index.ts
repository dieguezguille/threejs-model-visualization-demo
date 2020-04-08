// THREE JS LIBRARY IMPORTS
import { Vector3, Quaternion, TextureLoader, AmbientLight, PerspectiveCamera, Scene, WebGLRenderer, Group, Euler, GridHelper, Texture } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
// CUSTOM IMPORTS
import { JsonLoader } from './helpers/json-loader';
import { MouseDownEvents, MouseUpEvents } from './utility/mouse-events';
import { SceneActions } from './utility/scene-actions';
import { Globals } from './utility/variables';

// UI ELEMENTS
let node = <HTMLInputElement>document.getElementById("three"),
    terrainSlope = <HTMLInputElement>document.getElementById("terrainSlope"),
    terrainTilt = <HTMLInputElement>document.getElementById("terrainTilt"),
    upButton = <HTMLInputElement>document.getElementById("upButton"),
    downButton = <HTMLInputElement>document.getElementById("downButton"),
    leftButton = <HTMLInputElement>document.getElementById("leftButton"),
    rightButton = <HTMLInputElement>document.getElementById("rightButton"),
    plusHeightButton = <HTMLInputElement>document.getElementById("plusHeightButton"),
    minusHeightButton = <HTMLInputElement>document.getElementById("minusHeightButton"),
    rotateLeftButton = <HTMLInputElement>document.getElementById("rotateLeftButton"),
    rotateRightButton = <HTMLInputElement>document.getElementById("rotateRightButton");

export let helperControlsCheckbox = <HTMLInputElement>document.getElementById("helperControlsCheckbox");

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
    Globals.container = node;
    initialize();
}
else {
    alert("Couldn't initialize the App. Main node is missing.")
}

function initialize() {
    loadBackgroundImage();
    loadUi();
}

function loadBackgroundImage() {
    Globals.backgroundImage = new Image();
    Globals.backgroundImage.src = Globals.backgroundImageUrl;
    Globals.backgroundImage.onload = () => {
        Globals.backgroundTexture = new TextureLoader().load(Globals.backgroundImageUrl, onBackgroundImageLoad);
    }
}

function onBackgroundImageLoad(){
    updateScreenSize();
    loadSceneData();
}

function updateScreenSize() {
    let aspect = (window.innerHeight / window.innerWidth);
    Globals.width = (Globals.backgroundImage.width * 0.2) / aspect;
    Globals.height = (Globals.backgroundImage.height * 0.2) / aspect;
}

function loadSceneData() {
    JsonLoader.load('json/002/SceneData.json', onJsonLoaded);
}

function onJsonLoaded(response: string) {
    Globals.unityData = JSON.parse(response);
    if (Globals.unityData) {
        console.log(Globals.unityData);
        createScene();
        render();
    }
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
    terrainSlope.addEventListener("change", SceneActions.onTerrainSlopeChanged);
    terrainTilt.addEventListener("change", SceneActions.onTerrainTiltChanged);
    // clicked
    plusHeightButton.addEventListener("click", SceneActions.onPlusHeightButtonClicked);
    minusHeightButton.addEventListener("click", SceneActions.onMinusHeightButtonCLicked);
    helperControlsCheckbox.addEventListener("click", SceneActions.onHelperControlsCheckboxClicked);
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

function createScene() {

    // window
    window.addEventListener('resize', onWindowResize, false);

    // renderer
    Globals.renderer = new WebGLRenderer({ alpha: true, powerPreference: 'high-performance', antialias: true });
    let renderer = Globals.renderer;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(Globals.width, Globals.height);
    renderer.setClearColor(0xffffff, 0);
    renderer.gammaFactor = 2;

    Globals.container.appendChild(renderer.domElement);

    // camera
    Globals.camera = new PerspectiveCamera(Globals.unityData.CameraFov, Globals.unityData.CameraAspect, 1, 2000);

    var position = new Vector3(
        Globals.unityData.CameraPosition.x,
        Globals.unityData.CameraPosition.y,
        Globals.unityData.CameraPosition.z
    )

    Globals.camera.position.copy(position);

    var rotation = new Quaternion(
        -Globals.unityData.CameraRotation.x,
        Globals.unityData.CameraRotation.y,
        Globals.unityData.CameraRotation.z,
        Globals.unityData.CameraRotation.w
    )

    Globals.camera.setRotationFromQuaternion(rotation);

    // scene
    Globals.scene = new Scene();
    Globals.gridHelper = new GridHelper(200, 100);
    Globals.scene.add(Globals.gridHelper);
    Globals.scene.translateY(-50);
    Globals.sceneRotation = Globals.scene.rotation;
    Globals.verticalSceneSlope = Globals.scene.rotation.x;
    Globals.horizontalSceneTilt = Globals.scene.rotation.y;

    // background image
    Globals.scene.background = Globals.backgroundTexture;

    // light
    let ambientLight = new AmbientLight(0xffffff, 0.5);
    Globals.scene.add(ambientLight);

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
    Globals.camera.aspect = (Globals.width / Globals.height);
    Globals.camera.updateProjectionMatrix();
    Globals.renderer.setSize(Globals.width, Globals.height);
    render();
}

function onModelLoad(model: Group) {
    // create group
    Globals.models[0] = new Group();
    Globals.models[0].name = 'group';
    Globals.scene.add(Globals.models[0]);

    // the model of pool
    model.renderOrder = 3;
    Globals.models[0].add(model);

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
    Globals.models[0].position.copy(new Vector3(0, -2.3, Globals.models[0].position.z - 10));
    Globals.models[0].scale.set(0.2, 0.2, 0.2);
    render();
}

export function render() {
    Globals.renderer.render(Globals.scene, Globals.camera);
}