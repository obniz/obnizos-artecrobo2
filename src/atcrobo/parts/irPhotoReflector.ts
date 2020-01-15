import {StuduinoBitAnalogPin, StuduinoBitDigitalPin} from "../../stubit/terminal";
import {ArtecRobo, ArtecRoboPort} from "../index";
import {InPin} from "../pin/inPin";
import {ArtecRoboInputParts} from "./inputParts";

export class ArtecRoboIrPhotoReflector extends ArtecRoboInputParts {

    public async getValueWait(): Promise<number>  {
        return (this._inPin.terminalPin as StuduinoBitAnalogPin).readAnalogWait();
    }
}
