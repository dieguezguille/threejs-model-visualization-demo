import { Direction } from '../enums/direction';
import { render, models, scene } from '..';

// VARIABLES
const movAmount = 0.4;

// model actions
export const ModelActions = {
    moveModel: (direction: Direction) => {
        switch (direction) {
            case Direction.Up: {
                models[0].position.z -= movAmount;
                break;
            }
            case Direction.Down: {
                models[0].position.z += movAmount;
                break;
            }
            case Direction.Left: {
                models[0].position.x -= movAmount;
                break;
            }
            case Direction.Right: {
                models[0].position.x += movAmount;
                break;
            }
        }

        render();
    },

    rotateModelLeft: () => {
        scene.rotation.y -= 0.01;
        render();
    },

    rotateModelRight: () => {
        scene.rotation.y += 0.01;
        render();
    }
}