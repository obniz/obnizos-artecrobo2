import {StuduinoBitAnalogPin, StuduinoBitDigitalPin} from "../../stubit/terminal";
import {ArtecRoboInputParts} from "./inputParts";

export class ArtecRoboTemperature extends ArtecRoboInputParts {

    public async getValueWait(): Promise<number>  {
        return (this._inPin.terminalPin as StuduinoBitAnalogPin).readAnalogWait();
    }
    public async getCelsiusWait(): Promise<number>  {
        const value = await (this._inPin.terminalPin as StuduinoBitAnalogPin).readAnalogWait(true);
        return (value - 500 ) / 10;
    }

}
