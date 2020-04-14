// THREE JS LIBRARY IMPORTS
import { Vector3, Quaternion, TextureLoader, AmbientLight, PerspectiveCamera, Scene, WebGLRenderer, Group, Euler, GridHelper, Texture, BoxGeometry, MeshBasicMaterial, Mesh, Camera } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
// CUSTOM IMPORTS
import { JsonLoader } from './helpers/json-loader';
import { MouseDownEvents, MouseUpEvents } from './utility/mouse-events';
import { SceneActions } from './utility/scene-actions';
import { Globals } from './utility/variables';
import * as dat from 'dat.gui';

const gui = new dat.GUI({
    name: 'MyGUI',
    autoPlace: false
});


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
    // terrainTilt,
    helperControlsCheckbox,
    upButton,
    downButton,
    leftButton,
    rightButton,
    // plusHeightButton,
    // minusHeightButton,
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
    //loadUi();
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
    Globals.width = (Globals.backgroundImage.width * 0.3) / aspect;
    Globals.height = (Globals.backgroundImage.height * 0.3) / aspect;
}

function loadSceneData() {
    JsonLoader.load(Globals.jsonDataUrl, onJsonLoaded);
}

function onJsonLoaded(response: string) {
    Globals.unityData = JSON.parse(response);
    if (Globals.unityData) {
        console.log(Globals.unityData);
        init();
        loadUi();
        render();
    }
    else {
        alert("Unable to load JSON data. unityData is undefined.");
        return;
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

    gui.add(Globals.camera.position, 'x', -50, 50, 0.01).name("Camera X").onChange((value) => {
        Globals.camera.position.x = value;
        render();
        console.log(Globals.camera.position.x);
    });
    gui.add(Globals.camera.position, 'y', -10, 20, 0.01).name("Camera Y").onChange((value) => {
        Globals.camera.position.y = value;
        render();
        console.log(Globals.camera.position.y);
    });
    gui.add(Globals.camera.position, 'z', -50, 50, 0.01).name("Camera Z").onChange((value) => {
        Globals.camera.position.z = value;
        render();
        console.log(Globals.camera.position.z);
    });
    gui.add(Globals.camera, 'fov', 10, 120, 0.01).name("Camera FOV").onChange((value) => {
        Globals.camera.fov = value;
        Globals.camera.updateProjectionMatrix();
        render();
        console.log(Globals.camera.fov);
    });

    node.appendChild(gui.domElement);
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
    Globals.camera = new PerspectiveCamera(Globals.unityData.CameraFov, Globals.unityData.CameraAspect, 0.1, 2000);

    var position = new Vector3(0, 4, -20);

    Globals.camera.position.copy(position);
    console.log(Globals.camera.position);

    var rotation = new Quaternion(
        -0.0012938638834527766,
        -0.992649985728078,
        -0.12090229066328192,
        0.005193059147722494
    )

    Globals.camera.setRotationFromQuaternion(rotation);
    console.log(Globals.camera.rotation);

    // scene
    Globals.scene = new Scene();
    Globals.gridHelper = new GridHelper(200, 100, 129090, 999999);
    Globals.scene.add(Globals.gridHelper);
    // Globals.scene.translateY(-50);
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
    Globals.models[0].scale.set(0.02, 0.02, 0.02);
    Globals.models[0].translateY(-0.1);

    // add the model of the pool
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
    render();
}

export function render() {
    Globals.renderer.render(Globals.scene, Globals.camera);
}