import {AD} from "obniz/obniz/libs/io_peripherals/ad";
import {StuduinoBit} from "../index";

export interface StuduinoBitTemperatureOptions {
    signal: number;
}

export class StuduinoBitTemperature {
    private obnizAnalog: AD;

    // resistance at 25 degrees C
    private __THERMISTORNOMINAL__ = 10000;
    // temp. for nominal resistance (almost always 25 C)
    private __TEMPERATURENOMINAL__ = 25;
    // The beta coefficient of the thermistor (usually 3000-4000)
    private __BCOEFFICIENT__ = 3950;
    // the value of the 'other' resistor
    private __SERIESRESISTOR__ = 10000;

    constructor(studuinoBit: StuduinoBit, options: StuduinoBitTemperatureOptions) {

        // @ts-ignore
        this.obnizAnalog = studuinoBit.obniz.getAD(options.signal);

    }

    public async getValueWait(): Promise<number> {
        let value = await this.obnizAnalog.getWait();
        // console.log(value);
        value =  Math.round(value / 3.3 * 4095);
        return value;
    }

    public async getCelsiusWait(ndigits: number = 2): Promise<number> {
        let val = await this.getValueWait();
        val = 4095 / val - 1;
        val = this.__SERIESRESISTOR__ * val;

        let steinhart = val / this.__THERMISTORNOMINAL__;              // (R / Ro);
        steinhart = Math.log(steinhart);                           // ln(R / Ro);
        steinhart /=  this.__BCOEFFICIENT__;                        // 1 / B * ln(R / Ro);
        steinhart += 1.0 / ( this.__TEMPERATURENOMINAL__ + 273.15); // + (1 / To);
        steinhart = 1.0 / steinhart;                       // Invert;
        steinhart -= 273.15;                               // convert to C;
        steinhart = Math.round(steinhart * Math.pow(10, ndigits)) / Math.pow(10, ndigits);

        return steinhart;

    }

}
