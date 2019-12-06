import Obniz from "obniz";
import {Button, ButtonOptions} from "obniz/parts/MovementSensor/Button";
import {StuduinoBit} from "../index";

export class StuduinoBitButton {

    private _obnizButton: Button;
    private _count: number = 0;
    private _alreadyPressed = false;

    constructor(studuinoBit: StuduinoBit, options: ButtonOptions) {
        this._obnizButton = studuinoBit.obniz.wired("Button", options);
        this._obnizButton.onchange = (pressed) => {
            if (pressed) {
                this._alreadyPressed = true;
                this._count++;
            } else {}
        };
    }

    public isPressedWait(): Promise<boolean> {
        return this._obnizButton.isPressedWait();
    }

    public wasPressed(): boolean {
        const tmp = this._alreadyPressed;
        this._alreadyPressed = false;
        return tmp;
    }

    public getPresses(): number {
        const tmp = this._count;
        this._count = 0;
        return tmp;
    }

}
