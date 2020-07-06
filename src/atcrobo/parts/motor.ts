import {ArtecRobo, ArtecRoboPort} from "../index";
import {MotorPin} from "../pin/motorPin";
import {ArtecRoboMotorParts, MotorPinString} from "./motorParts";

type  ArtecRoboMotorMotion = "cw" | "ccw" | "brake" | "stop";

export class ArtecRoboMotor extends ArtecRoboMotorParts {
    private _currentMotion: ArtecRoboMotorMotion = "stop";
    private _currentPower: number = 0;
    private _ADDRESS = 0x3e;
    private _COMMAND = [
        [0x00, 0x01, 0x02, 0x03, 0x04], // m1のときのコマンド
        [0x08, 0x09, 0x0A, 0x0B, 0x0C], // m2のときのコマンド
    ];
    private _p: number;

    public CW = "cw";
    public CCW = "ccw";
    public BRAKE = "brake";
    public STOP = "stop";

    constructor(artecRobo: ArtecRobo, motorPin: MotorPin | MotorPinString) {
        super(artecRobo, motorPin);

        if (this._motorPin === artecRobo.m1) {
            this._p = 0;
        } else {
            this._p = 1;
        }

    }

    public cw() {
        this._action("cw");
    }

    public ccw() {
        this._action("ccw");
    }

    public stop() {
        this._action("stop");
    }

    public brake() {
        this._action("brake");
    }

    public power(power: number) {
        if (power > 255 || power < 0 || !Number.isInteger(power)) {
            throw new Error("power is in range 0-255");
        }
        const command = [this._COMMAND[this._p][4], power];
        this._motorPin.i2c.write(this._ADDRESS, command);
        this._currentPower = power;
    }

    private _action(motion: ArtecRoboMotorMotion) {
        let index = 0;
        if (motion === "cw") {
            index = 0;
        } else if (motion === "ccw") {
            index = 1;
        } else if (motion === "stop") {
            index = 2;
        } else if (motion === "brake") {
            index = 3;
        } else {
            throw new Error("motion: DCMotor.CW/CCW/STOP/BRAKE");
        }
        const command = [this._COMMAND[this._p][index]];
        if (this._currentMotion === "cw" && motion === "ccw"
            || this._currentMotion === "ccw" && motion === "cw") {

            // brake
            this._motorPin.i2c.write(this._ADDRESS, [this._COMMAND[this._p][3]]);
            // @ts-ignore
            this._motorPin.i2c.obnizI2c.Obniz.wait(100);

            const power = this._currentPower;
            this.power(Math.round(power * 0.5));
            // small power
            this._motorPin.i2c.write(this._ADDRESS, command);
            // @ts-ignore
            this._motorPin.i2c.obnizI2c.Obniz.wait(100);
            this.power(power);
        } else {
            this._motorPin.i2c.write(this._ADDRESS, command);
        }
        this._currentMotion = motion;
    }

    public action(action: ArtecRoboMotorMotion) {
        this._action(action);
    }
}
