import { StuduinoBitAnalogPin, StuduinoBitDigitalPin } from "../../stubit/terminal";
import { ArtecRoboInputParts } from "./inputParts";
import { ArtecRobo, ArtecRoboPort } from "../index";
import { InPin } from "../pin/inPin";

export type InputPinString = "P0" | "P1" | "P2";

export class ArtecRoboTouchSensor extends ArtecRoboInputParts {

    protected _artecRobo: ArtecRobo;

    constructor(artecRobo: ArtecRobo, inPin: InPin | InputPinString) {
        super(artecRobo, inPin)
        this._artecRobo = artecRobo
    }

    public async getValueWait(): Promise<number> {
        if (this._inPin === this._artecRobo.p2!) {
            let bool: number = await (this._inPin.terminalPin as StuduinoBitAnalogPin).readAnalogWait()
            return Math.min(Number(bool), 1);
        } else {
            let bool: number = await (this._inPin.terminalPin as StuduinoBitDigitalPin).readDigitalWait()
            return Number(bool);
        }
    }

    public async isPressedWait(): Promise<boolean> {
        if (this._inPin === this._artecRobo.p2!) {
            let bool: number = await (this._inPin.terminalPin as StuduinoBitAnalogPin).readAnalogWait()
            return !bool;
        } else {
            let bool: number = await (this._inPin.terminalPin as StuduinoBitDigitalPin).readDigitalWait();
            return !bool;
        }
    }
}
