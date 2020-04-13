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
    static backgroundImageUrl: string = "textures/002/screenshot.jpg";
    static jsonDataUrl: string = "json/002/SceneData.json";
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