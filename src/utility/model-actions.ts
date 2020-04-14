import { Direction } from '../enums/direction';
import { render } from '..';
import { Globals } from './variables';

// VARIABLES
const movAmount = 0.1;

// model actions
export const ModelActions = {
    moveModel: (direction: Direction) => {
        switch (direction) {
            case Direction.Up: {
                Globals.models[0].position.z += movAmount;
                break;
            }
            case Direction.Down: {
                Globals.models[0].position.z -= movAmount;
                break;
            }
            case Direction.Left: {
                Globals.models[0].position.x += movAmount;
                break;
            }
            case Direction.Right: {
                Globals.models[0].position.x -= movAmount;
                break;
            }
        }

        // console.log(Globals.models[0].position);
        render();
    },

    rotateModelLeft: () => {
        Globals.models[0].rotation.y -= 0.01;
        render();
    },

    rotateModelRight: () => {
        Globals.models[0].rotation.y += 0.01;
        render();
    }
}