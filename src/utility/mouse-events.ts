import { Direction } from "../enums/direction";
import { ModelActions } from '../utility/model-actions';
import { render } from "..";

// VARIABLES
let timer: any;

// model mouse down events
export const MouseDownEvents = {
    onUpButtonMouseDown: () => {
        if (timer) return;
        timer = setInterval(() => ModelActions.moveModel(Direction.Up), 10);
    },
    onDownButtonMouseDown: () => {
        if (timer) return;
        timer = setInterval(() => ModelActions.moveModel(Direction.Down), 10);
    },
    onLeftButtonMouseDown: () => {
        if (timer) return;
        timer = setInterval(() => ModelActions.moveModel(Direction.Left), 10);
    },
    onRightButtonMouseDown: () => {
        if (timer) return;
        timer = setInterval(() => ModelActions.moveModel(Direction.Right), 10);
    },
    onRotateLeftButtonMouseDown: () => {
        if (timer) return;
        timer = setInterval(ModelActions.rotateModelLeft, 10);
    },
    onRotateRightButtonMouseDown: () => {
        if (timer) return;
        timer = setInterval(ModelActions.rotateModelRight, 10);
    }
}

// model mouse up events
export const MouseUpEvents = {
    onMouseUp: () => {
        clearInterval(timer);
        timer = null;
        render();
    }
}