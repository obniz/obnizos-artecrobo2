import {ArtecRobo, ArtecRoboPort} from "../index";
import {MotorPin} from "../pin/motorPin";
export type  MotorPinString = "M1" | "M2";

export class ArtecRoboMotorParts {
    protected _motorPin: MotorPin;

    constructor(artecRobo: ArtecRobo, motorPin: MotorPin | MotorPinString) {
        if (typeof motorPin === "string") {
            if (motorPin === "M1") {
                motorPin = artecRobo.m1!;
            } else if (motorPin === "M2") {
                motorPin = artecRobo.m2!;
            } else {
                throw new Error("This parts can connect only 'M1','M2'");
            }
        }
        this._motorPin = motorPin;
    }

}
