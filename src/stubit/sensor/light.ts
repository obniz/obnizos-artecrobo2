import {AD} from "obniz/obniz/libs/io_peripherals/ad";
import {StuduinoBit} from "../index";

export interface StuduinoBitLightSensorOptions {
    signal: number;
}

export class StuduinoBitLightSensor {
    private obnizAnalog: AD;

    constructor(studuinoBit: StuduinoBit, options: StuduinoBitLightSensorOptions) {

        // @ts-ignore
        this.obnizAnalog = studuinoBit.obniz.getAD(options.signal);

    }

    public async getValueWait(): Promise<number> {
        let value = await this.obnizAnalog.getWait();
        // console.log(value);
        value =  Math.round(value / 3.3 * 4095);
        return value;
    }

}
