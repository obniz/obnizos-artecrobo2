import {LED, LEDOptions} from "obniz/parts/Light/LED";
import {StuduinoBit} from "../../stubit";
import {ArtecRobo, ArtecRoboPort} from "../index";
import {OutPin} from "../pin/outPin";
import {ArtecRoboOutputParts, OutPinString} from "./outputParts";

export class ArtecRoboLed extends ArtecRoboOutputParts {

    private _obnizLED: LED;

    constructor(artecRobo: ArtecRobo, outPin: OutPin | OutPinString) {
        super(artecRobo, outPin);

        const options = {anode: this._outPin.terminalPin.pin};
        this._obnizLED = artecRobo.studuinoBit.obniz.wired("LED", options);
    }

    public on() {
        this._obnizLED.on();
    }

    public off() {
        this._obnizLED.off();
    }

}
