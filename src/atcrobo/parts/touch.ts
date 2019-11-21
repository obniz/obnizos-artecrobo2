import {StuduinoBitDigitalPin} from "../../stubit/terminal";
import {ArtecRoboInputParts} from "./inputParts";

export class ArtecRoboTouchSensor extends ArtecRoboInputParts {

    public async getValueWait(): Promise<number> {
        return (this._inPin.terminalPin as StuduinoBitDigitalPin).readDigitalWait();
    }
}
