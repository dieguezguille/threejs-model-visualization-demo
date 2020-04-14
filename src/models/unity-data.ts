import { Color } from "three"

export class UnityData {
    //Fields 
    CameraPosition: THREE.Vector3;
    CameraRotation: THREE.Quaternion;
    CameraFov: number;
    CameraAspect: number;
    CameraPixelWidth: number;
    CameraPixelHeight: number;
    // LightColor: Color;
    // LightIntensity: number;
    // LightPosition: THREE.Vector3;
    // LightRotation: THREE.Quaternion;

    constructor(cameraPosition: THREE.Vector3, cameraRotation: THREE.Quaternion, cameraFov: number, cameraAspect: number, cameraPixelWidth: number,
        cameraPixelHeight: number,) {
        this.CameraPosition = cameraPosition;
        this.CameraRotation = cameraRotation;
        this.CameraFov = cameraFov;
        this.CameraAspect = cameraAspect;
        this.CameraPixelWidth = cameraPixelWidth;
        this.CameraPixelHeight = cameraPixelHeight;
        // this.LightColor = lightColor;
        // this.LightIntensity = lightIntensity;
        // this.LightPosition = lightPosition;
        // this.LightRotation = lightRotation;
    }
}