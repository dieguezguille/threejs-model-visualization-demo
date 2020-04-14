import { PerspectiveCamera, WebGLRenderer, Texture, Scene, Group, Euler, GridHelper } from "three";
import { UnityData } from "../models/unity-data";

// GLOBAL
export class Globals{
    static camera: PerspectiveCamera;
    static container: HTMLElement;
    static renderer: WebGLRenderer;
    static unityData: UnityData;
    static width: number;
    static height: number;
    static backgroundImageUrl: string = "textures/003/Screenshot_05-11-13_13-04-20.jpg";
    static jsonDataUrl: string = "json/003/data_04-13-2020-17-11-13.json";
    static backgroundImage: HTMLImageElement;
    static backgroundTexture: Texture;
    static scene: Scene;
    static models: Array<Group> = [];
    static sceneRotation: Euler;
    static verticalSceneSlope: number;
    static horizontalSceneTilt: number;
    static gridHelper: GridHelper;
}

// UI