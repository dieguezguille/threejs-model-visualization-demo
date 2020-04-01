import * as _ from 'lodash';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { Vector3 } from 'three';


// SCENE
let camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    transformControls: TransformControls,
    modelGroup: THREE.Group;

let cameraX: number = 0,
    cameraY: number = 1.7, // altura de la cámara (altura de una persona aprox)
    cameraZ: number = 10; // lejania de la cámara

let width: number,
    height: number;

let sceneRotation: THREE.Euler;

let verticalSceneAngle: number,
    horizontalSceneAngle: number;

let container: HTMLElement;
let gridHelper = new THREE.GridHelper(20, 10);

// UI
let node = document.getElementById("three");
let terrainAngle = <HTMLInputElement>document.getElementById("terrainAngle");
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

if (terrainAngle && helperControlsCheckbox && upButton && downButton && leftButton && rightButton && rotateLeftButton && rotateRightButton) {
    terrainAngle.addEventListener("change", onTerrainAngleChanged);
    helperControlsCheckbox.addEventListener("click", onHelperControlsCheckboxClicked);
    upButton.addEventListener("click", onUpButtonClicked);
    downButton.addEventListener("click", onDownButtonClicked);
    leftButton.addEventListener("click", onLeftButonClicked);
    rightButton.addEventListener("click", onRightButtonClicked);
    rotateLeftButton.addEventListener("click", onRotateLeftButtonClicked);
    rotateRightButton.addEventListener("click", onRotateRightButtonClicked);
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
    let texture = new THREE.TextureLoader().load("textures/backyard.jpg");
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

function onModelLoaded(loadedModel: THREE.Group) {
    // create group
    modelGroup = new THREE.Group();
    modelGroup.name = 'group';
    scene.add(modelGroup);

    // the inside of pool
    loadedModel.renderOrder = 3;
    modelGroup.add(loadedModel);

    // the invisibility box with a hole
    let cloakGeometry = new THREE.BoxGeometry(6.6, 4, 3.1);
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
    modelGroup.position.copy(new Vector3(modelGroup.position.x, modelGroup.position.y - 1.3, modelGroup.position.z)); // acomodo el modelo al nivel del suelo
    scene.add(transformControls);
    transformControls.attach(modelGroup);
    transformControls.translateOnAxis(new Vector3(0, 1, 0), 3.2);

    render();
}

function onTerrainAngleChanged(event: any) {
    var value = event.target.value / 100;
    sceneRotation.x = verticalSceneAngle + value;
    render();
}

function onHelperControlsCheckboxClicked(event: any) {
    if (helperControlsCheckbox) {
        let value = helperControlsCheckbox.checked;
        gridHelper.visible = value;
        transformControls.visible = value;
        render();
    }
}

function onUpButtonClicked(event: any) {
    modelGroup.position.z -= 0.1;
    render();
}

function onDownButtonClicked(event: any) {
    modelGroup.position.z += 0.1;
    render();
}

function onLeftButonClicked(event: any) {
    modelGroup.position.x -= 0.1;
    render();
}

function onRightButtonClicked(event: any) {
    modelGroup.position.x += 0.1;
    render();
}

function onRotateLeftButtonClicked(event: any) {
    modelGroup.rotation.y -= 0.1;
    render();
}

function onRotateRightButtonClicked(event: any) {
    modelGroup.rotation.y += 0.1;
    render();
}

function render() {
    renderer.render(scene, camera);
}