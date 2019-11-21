
import {LED, LEDOptions} from "obniz/parts/Light/LED";
import {StuduinoBit} from "../index";

export class StuduinoBitLed {

    private _obnizLED: LED;

    constructor(studuinoBit: StuduinoBit, options: LEDOptions) {
        this._obnizLED = studuinoBit.obniz.wired("LED", options);

    }

    public  on() {
        this._obnizLED.on();
    }

    public off() {
        this._obnizLED.off();
    }

}
