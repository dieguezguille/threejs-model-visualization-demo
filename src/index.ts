// THREE JS LIBRARY IMPORTS
import { Vector3, Quaternion, TextureLoader, AmbientLight, PerspectiveCamera, Scene, WebGLRenderer, Group, Euler, GridHelper, Texture, BoxGeometry, MeshBasicMaterial, Mesh, Camera } from 'three';
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
    load();
}
else {
    alert("Couldn't initialize the App. Node with id='three' missing.")
}

function load() {
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

function onBackgroundImageLoad() {
    updateScreenSize();
    loadSceneData();
}

function updateScreenSize() {
    let aspect = (window.innerHeight / window.innerWidth);
    Globals.width = (Globals.backgroundImage.width * 0.2) / aspect;
    Globals.height = (Globals.backgroundImage.height * 0.2) / aspect;
}

function loadSceneData() {
    JsonLoader.load(Globals.jsonDataUrl, onJsonLoaded);
}

function onJsonLoaded(response: string) {
    Globals.unityData = JSON.parse(response);
    if (Globals.unityData) {
        console.log(Globals.unityData);
        init();
        render();
    }
    else {
        alert("Unable to load JSON data. unityData is undefined.");
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

function init() {
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
    Globals.camera = new PerspectiveCamera(50, Globals.unityData.CameraAspect, 0.1, 1000);

    console.log(Globals.camera.position);

    // var position = new Vector3(
    //     Globals.unityData.CameraPosition.x,
    //     Globals.unityData.CameraPosition.y,
    //     Globals.unityData.CameraPosition.z
    // )

    // valores de fspy
    var position = new Vector3(
        -1.3013652554017365,
        1.2191799727337025,
        -4.261721271971087
    )

    Globals.camera.position.copy(position);

    //valore de fspy
    var rotation = new Quaternion(
        -0.005837166756737747,
        -0.9881411214417758,
        -0.12056673218081797,
        0.09490371273707121
    )

    Globals.camera.setRotationFromQuaternion(rotation);
    console.log(Globals.camera.rotation);

    // Globals.camera.rotation.copy(new Euler(0,0,0));
    // Globals.camera.rotation.copy(new Euler(-0.008397811837527991, -0.9962047164675978, -0.08663509475988529));

    // scene
    Globals.scene = new Scene();
    Globals.gridHelper = new GridHelper(20, 10, 129090, 999999);
    Globals.scene.add(Globals.gridHelper);
    // Globals.scene.translateY(-50);
    Globals.sceneRotation = Globals.scene.rotation;
    Globals.verticalSceneSlope = Globals.scene.rotation.x;
    console.log("vertical scene slope (rotation in x) = " + Globals.verticalSceneSlope);
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

    // add the model of the pool
    // model.renderOrder = 3;

    var geometry = new BoxGeometry(1, 1, 1);
    var material = new MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new Mesh(geometry, material);
    cube.translateY(0.5);
    // Globals.scene.add(cube);

    Globals.models[0].add(cube);
    // Globals.camera.lookAt(cube.position);

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
    // Globals.models[0].position.copy(new Vector3(0, 0, -150));
    // Globals.models[0].translateZ(-1500);
    Globals.models[0].scale.set(1, 1, 1);
    // Globals.scene.scale.set(0.1, 0.1, 0.1);

    // Globals.camera.lookAt(cube.position);
    render();
}

export function render() {
    Globals.renderer.render(Globals.scene, Globals.camera);
}
