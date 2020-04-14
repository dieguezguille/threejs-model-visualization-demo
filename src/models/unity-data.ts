
export class UnityData {

    //Fields 
    CameraFov: number;
    CameraAspect: number;
    PerimeterDistance: number;
    SurfaceArea: number;

    constructor(cameraFov: number, cameraAspect: number, perimeterDistance: number, surfaceArea: number) {
        this.CameraFov = cameraFov;
        this.CameraAspect = cameraAspect;
        this.PerimeterDistance = perimeterDistance;
        this.SurfaceArea = surfaceArea;
    }
}