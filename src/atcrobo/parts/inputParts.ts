import {ArtecRobo, ArtecRoboPort} from "../index";
import {InPin} from "../pin/inPin";

export type  InputPinString = "P0" | "P1" | "P2";

export class ArtecRoboInputParts {

    protected _inPin: InPin;

    constructor(artecRobo: ArtecRobo, inPin: InPin | InputPinString) {
        if (typeof inPin === "string") {
            if (inPin === "P0") {
                inPin = artecRobo.p0!;
            } else if (inPin === "P1") {
                inPin = artecRobo.p1!;
            } else {
                inPin = artecRobo.p2!;
            }
        }

        this._inPin = inPin;

    }

}
