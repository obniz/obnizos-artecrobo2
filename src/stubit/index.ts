import Obniz from "obniz";

// parts
import {StuduinoBitI2C} from "./bus/i2c";
import {StuduinoBitSPI} from "./bus/spi";
import { StuduinoBitImage } from "./image/image";
import {StuduinoBitBuzzer} from "./output/bzr";
import {StuduinoBitDisplay} from "./output/dsply";
import {StuduinoBitAccelerometer} from "./sensor/accelerometer";
import {StuduinoBitButton} from "./sensor/button";
import { StuduinoBitGyro } from "./sensor/gyro";
import { StuduinoBitCompass } from "./sensor/compass";
import {StuduinoBitICM20948} from "./sensor/icm20948";
import {StuduinoBitLightSensor} from "./sensor/light";
import {StuduinoBitTemperature} from "./sensor/temperature";
import {
    StuduinoBitAnalogDitialPin,
    StuduinoBitAnalogPin,
    StuduinoBitDigitalPin,
    StuduinoBitPin,
    StuduinoBitTerminal,
} from "./terminal";

interface Pin {
    gpio: number;
    type: "input" | "output" | "motor" | "i2c";
}

export class StuduinoBit {

    /* Classes */

    public static Image = StuduinoBitImage;

    /* parts */
    public button_a?: StuduinoBitButton;
    public button_b?: StuduinoBitButton;
    public display?: StuduinoBitDisplay;
    public buzzer?: StuduinoBitBuzzer;
    public i2c?: StuduinoBitI2C;
    public p0?: StuduinoBitAnalogDitialPin;
    public p1?: StuduinoBitAnalogDitialPin;
    public p2?: StuduinoBitAnalogPin;
    public p3?: StuduinoBitPin;
    public p4?: StuduinoBitPin;
    public p5?: StuduinoBitPin;
    public p6?: StuduinoBitPin;
    public p7?: StuduinoBitPin;
    public p8?: StuduinoBitPin;
    public p9?: StuduinoBitPin;
    public p10?: StuduinoBitPin;
    public p11?: StuduinoBitPin;
    public p12?: StuduinoBitPin;
    public p13?: StuduinoBitPin;
    public p14?: StuduinoBitPin;
    public p15?: StuduinoBitPin;
    public p16?: StuduinoBitPin;
    public p19?: StuduinoBitPin;
    public p20?: StuduinoBitPin;
    public lightsensor?: StuduinoBitLightSensor;
    public onconnect?: () => Promise<void>;
    public onclose?: () => Promise<void>;
    public obniz: Obniz;
    public terminal?: StuduinoBitTerminal;
    public temperature?: StuduinoBitTemperature;
    public accelerometer?: StuduinoBitAccelerometer;
    public gyro?: StuduinoBitGyro;
    public compass?: StuduinoBitCompass;
    public icm20948?: StuduinoBitICM20948;

    constructor(id: string, options?: any) {
        this.obniz = new Obniz(id, options);

        this.obniz.onconnect = async () => {
            await this._wire();
            if (this.onconnect) {
                const p = this.onconnect();
                if (p instanceof Promise) {
                    await p;
                }
            }
        };

        this.obniz.onclose = async () => {
            this._unWire();
            if (this.onclose) {
                const p = this.onclose();
                if (p instanceof Promise) {
                    await p;
                }
            }
        };
    }

    public wait(ms: number): Promise<void> {
        return this.obniz.wait(ms);
    }

    private async _wire() {
        this.terminal = new StuduinoBitTerminal(this);
        this.i2c = new StuduinoBitI2C(this);
        this.icm20948 = new StuduinoBitICM20948(this.i2c);
        await this.icm20948.initWait();
        this.accelerometer = new StuduinoBitAccelerometer(this.icm20948);
        this.gyro = new StuduinoBitGyro(this.icm20948);
        this.compass = new StuduinoBitCompass(this, this.icm20948);
        this.button_a = new StuduinoBitButton(this, {signal: 15});
        this.button_b = new StuduinoBitButton(this, {signal: 27});
        this.display = new StuduinoBitDisplay(this, {din: 4});
        this.buzzer = new StuduinoBitBuzzer(this, {signal: 25, gnd: 16}); // todo io16:NC gnd不要にする
        this.temperature = new StuduinoBitTemperature(this, {signal: 35});
        this.lightsensor = new StuduinoBitLightSensor(this, {signal: 34});
        this.p0 = this.terminal.getPin("P0");
        this.p1 = this.terminal.getPin("P1");
        this.p2 = this.terminal.getPin("P2");
        this.p3 = this.terminal.getPin("P3");
        this.p4 = this.terminal.getPin("P4");
        this.p5 = this.terminal.getPin("P5");
        this.p6 = this.terminal.getPin("P6");
        this.p7 = this.terminal.getPin("P7");
        this.p8 = this.terminal.getPin("P8");
        this.p9 = this.terminal.getPin("P9");
        this.p10 = this.terminal.getPin("P10");
        this.p11 = this.terminal.getPin("P11");
        this.p12 = this.terminal.getPin("P12");
        this.p13 = this.terminal.getPin("P13");
        this.p14 = this.terminal.getPin("P14");
        this.p15 = this.terminal.getPin("P15");
        this.p16 = this.terminal.getPin("P16");
        this.p19 = this.terminal.getPin("P19");
        this.p20 = this.terminal.getPin("P20");

    }

    private _unWire() {
        this.display = undefined;
        this.button_a = undefined;
        this.button_b = undefined;
        this.buzzer = undefined;
        this.terminal = undefined;
        this.temperature = undefined;
        this.lightsensor = undefined;
        this.i2c = undefined;
        this.icm20948 = undefined;
        this.accelerometer = undefined;
        this.gyro = undefined;
        this.compass = undefined;
        this.p0 = undefined;
        this.p1 = undefined;
        this.p2 = undefined;
        this.p3 = undefined;
        this.p4 = undefined;
        this.p5 = undefined;
        this.p6 = undefined;
        this.p7 = undefined;
        this.p8 = undefined;
        this.p9 = undefined;
        this.p10 = undefined;
        this.p11 = undefined;
        this.p12 = undefined;
        this.p13 = undefined;
        this.p14 = undefined;
        this.p15 = undefined;
        this.p16 = undefined;
        this.p19 = undefined;
        this.p20 = undefined;
    }

}
