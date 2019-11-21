import {SpeakerOptions} from "obniz/parts/Sound/Speaker";
import {StuduinoBit} from "../../stubit";
import {StuduinoBitBuzzer} from "../../stubit/output/bzr";
import {ArtecRobo, ArtecRoboPort} from "../index";

export class ArtecRoboBuzzer extends StuduinoBitBuzzer {

    constructor(artecRobo: ArtecRobo, port: ArtecRoboPort) {
        const options = {signal: artecRobo.getPin(port)!.terminalPin!.pin, gnd: 16}; // todo gndどうにかする
        const studuinoBit = artecRobo.studuinoBit;
        super(studuinoBit, options);
    }

}
