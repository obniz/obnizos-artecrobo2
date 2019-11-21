import {StuduinoBitI2C} from "../../stubit/bus/i2c";
import {StuduinoBitPin} from "../../stubit/terminal";

export class MotorPin {
    public terminalPin?: StuduinoBitPin;
    public i2c: StuduinoBitI2C;

    constructor(i2c: StuduinoBitI2C) {
        this.i2c = i2c;
    }
}
