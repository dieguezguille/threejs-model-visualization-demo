import { render, helperControlsCheckbox } from "..";
import { Globals } from './variables';

export const SceneActions = {
    // scene events
    onTerrainSlopeChanged: (event: any) => {
        var value = event.target.value / 50;
        Globals.sceneRotation.x = Globals.verticalSceneSlope + value;
        render();
    },

    onTerrainTiltChanged: (event: any) => {
        var value = event.target.value / 50;
        Globals.sceneRotation.z = Globals.horizontalSceneTilt + value;
        render();
    },

    onPlusHeightButtonClicked: () => {
        Globals.scene.position.y += 0.5;
        render();
    },

    onMinusHeightButtonCLicked: () => {
        Globals.scene.position.y -= 0.5;
        render();
    },
    onHelperControlsCheckboxClicked: () => {
        if (helperControlsCheckbox) {
            let value = helperControlsCheckbox.checked;
            Globals.gridHelper.visible = value;
            render();
        }
    }
}