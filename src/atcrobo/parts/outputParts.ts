import {ArtecRobo, ArtecRoboPort} from "../index";
import {InPin} from "../pin/inPin";
import {OutPin} from "../pin/outPin";

export type  OutPinString = "P13" | "P14" | "P15" | "P16";

export class ArtecRoboOutputParts {

    protected _outPin: OutPin;

    constructor(artecRobo: ArtecRobo, outPin: OutPin | OutPinString) {

        if (typeof outPin === "string") {
            if (outPin === "P13") {
                outPin = artecRobo.p13!;
            } else if (outPin === "P14") {
                outPin = artecRobo.p14!;
            } else if (outPin === "P15") {
                outPin = artecRobo.p15!;
            } else if (outPin === "P16") {
                outPin = artecRobo.p16!;
            } else {
                throw new Error("This parts can connect only 'P13','P14','P15','P16'");
            }
        }

        this._outPin = outPin;
    }

}
