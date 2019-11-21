import {ServoMotor} from "obniz/parts/Moving/ServoMotor";
import {ArtecRobo, ArtecRoboPort} from "../index";
import {OutPin} from "../pin/outPin";
import {ArtecRoboOutputParts, OutPinString} from "./outputParts";

export class ArtecRoboServoMotor extends ArtecRoboOutputParts {

    private _obnizServo: ServoMotor;

    constructor(artecRobo: ArtecRobo, outPin: OutPin | OutPinString) {
        super(artecRobo, outPin);
        this._obnizServo = artecRobo.studuinoBit.obniz.wired("ServoMotor", {signal: this._outPin.terminalPin.pin});
        this._obnizServo.range = {
            min: 0.6,
            max: 2.5,
        };
    }

    public setAngle(degree: number) {
        this._obnizServo.angle(degree);
    }

}
