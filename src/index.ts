import * as _ from 'lodash';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
var loader = new OBJLoader();
var model: any;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
scene.add(ambientLight);

var pointLight = new THREE.PointLight(0xffffff, 0.8);
camera.add(pointLight);
scene.add(camera);

loader.load(
    // resource URL
    'models/PiletaSketchup.obj',
    // called when resource is loaded
    function (object) {
        model = object;
        scene.add(model);
        camera.position.set(0,100,5); camera.lookAt(model.position);
    },
    // called when loading progresses
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // called when loading has errors
    function (error) {
        console.log(error);
    }
);

// function animate() {
//     if (model != null) {
//         requestAnimationFrame(animate);
//         model.rotation.x += 0.01;
//         model.rotation.y += 0.01;
//         renderer.render(scene, camera);
//     }
// }

// animate();