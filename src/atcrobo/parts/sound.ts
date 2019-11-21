import {StuduinoBitAnalogPin, StuduinoBitDigitalPin} from "../../stubit/terminal";
import {ArtecRoboInputParts} from "./inputParts";

export class ArtecRoboSoundSensor extends ArtecRoboInputParts {

    public async getValueWait(): Promise<number>  {
        return (this._inPin.terminalPin as StuduinoBitAnalogPin).readAnalogWait();
    }
}
