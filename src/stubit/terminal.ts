// tslint:disable:max-classes-per-file
import { PWM } from "obniz/obniz/libs/io_peripherals/pwm";
import {StuduinoBit} from "./index";

class StuduinoBitDigitalPinMixin {
    public pin: number;
    private studuinoBit: StuduinoBit;
    protected pwm: PWM | null = null

    constructor(studuinoBit: StuduinoBit, pin: number) {
        this.pin = pin;
        this.studuinoBit = studuinoBit;
    }

    public writeDigital(value: boolean | number) {
        // @ts-ignore
        this.studuinoBit.obniz.getIO(this.pin).output(value);
    }

    public readDigitalWait(): Promise<number> {
        // @ts-ignore
        return this.studuinoBit.obniz.getIO(this.pin).inputWait();
    }

    private preparedPwm(): PWM {
        if (!this.pwm) {
            this.pwm = this.studuinoBit.obniz.getFreePwm();
            this.pwm.start({io: this.pin})
        }
        return this.pwm;
    }

    public writeAnalog(value: number) {
        // 0 to 1023
        const pwm = this.preparedPwm();
        pwm.duty(value / 1023 * 100)
    }

    public setAnalogPeriod(period: number) {
        // msec
        const pwm = this.preparedPwm();
        pwm.pulse(period)
    }

    public setAnalogPeriodMicroseconds(period: number) {
        // usec
        const pwm = this.preparedPwm();
        pwm.pulse(period * 1000)
    }

    public setAnalogHz(hz: number) {
        const pwm = this.preparedPwm();
        pwm.freq(hz);
    }
}

class StuduinoBitAnalogPinMixin {
    public pin: number;
    private studuinoBit: StuduinoBit;

    constructor(studuinoBit: StuduinoBit, pin: number) {
        this.pin = pin;
        this.studuinoBit = studuinoBit;

    }

    public async readAnalogWait(mv = false): Promise<number> {

        // @ts-ignore
        const voltage = await this.studuinoBit.obniz.getAD(this.pin).getWait();
        if (mv) {
            return Math.round(voltage * 1000);
        }
        return Math.round(voltage * 4095 / 5);
    }
}

export class StuduinoBitDigitalPin extends StuduinoBitDigitalPinMixin {
    constructor(studuinoBit: StuduinoBit, pin: number) {
        super(studuinoBit, pin);
    }
}

export class StuduinoBitAnalogPin extends StuduinoBitAnalogPinMixin {
    constructor(studuinoBit: StuduinoBit, pin: number) {
        super(studuinoBit, pin);
    }

}

// @ts-ignore
export class StuduinoBitAnalogDitialPin implements StuduinoBitDigitalPinMixin, StuduinoBitAnalogPinMixin {
    public pin: number;
    private studuinoBit: StuduinoBit;
    protected pwm: PWM | null = null;

    constructor(studuinoBit: StuduinoBit, pin: number) {
        this.pin = pin;
        this.studuinoBit = studuinoBit;
    }

    public readAnalogWait(): Promise<number> {
        // will replace by applyMixins
        throw new Error("abstcact function");
    }

    public readDigitalWait(): Promise<number> {
        // will replace by applyMixins
        throw new Error("abstcact function");
    }

    public writeDigital(value: boolean | number): void {
        // will replace by applyMixins
        throw new Error("abstcact function");
    }

    private preparedPwm(): PWM {
        if (!this.pwm) {
            this.pwm = this.studuinoBit.obniz.getFreePwm();
            this.pwm.start({ io: this.pin })
        }
        return this.pwm;
    }

    public writeAnalog(value: number) {
        // 0 to 1023
        const pwm = this.preparedPwm();
        pwm.duty(value / 1023 * 100)
    }

    public setAnalogPeriod(period: number) {
        // msec
        const pwm = this.preparedPwm();
        pwm.pulse(period)
    }

    public setAnalogPeriodMicroseconds(period: number) {
        // usec
        const pwm = this.preparedPwm();
        pwm.pulse(period * 1000)
    }

    public setAnalogHz(hz: number) {
        const pwm = this.preparedPwm();
        pwm.freq(hz);
    }
}

applyMixins(StuduinoBitAnalogDitialPin, [StuduinoBitDigitalPinMixin, StuduinoBitAnalogPinMixin]);

function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {

            Object.defineProperty(derivedCtor.prototype,
                name,
                // @ts-ignore
                Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
        });
    });
}

export type StuduinoBitPin = StuduinoBitAnalogDitialPin | StuduinoBitAnalogPin | StuduinoBitDigitalPin;

// tslint:disable:object-literal-sort-keys
interface TerminnalTypeMap {
    P0: StuduinoBitAnalogDitialPin;
    P1: StuduinoBitAnalogDitialPin;
    P2: StuduinoBitAnalogPin;
    P3: StuduinoBitAnalogPin;
    P4: StuduinoBitDigitalPin;
    P5: StuduinoBitAnalogDitialPin;
    P6: StuduinoBitDigitalPin;
    P7: StuduinoBitDigitalPin;
    P8: StuduinoBitAnalogDitialPin;
    P9: StuduinoBitAnalogDitialPin;
    P10: StuduinoBitDigitalPin;
    P11: StuduinoBitDigitalPin;
    P12: StuduinoBitDigitalPin;
    P13: StuduinoBitDigitalPin;
    P14: StuduinoBitDigitalPin;
    P15: StuduinoBitDigitalPin;
    P16: StuduinoBitAnalogDitialPin;
    P19: StuduinoBitDigitalPin;
    P20: StuduinoBitDigitalPin;
}

export class StuduinoBitTerminal {
    private studuinoBit: StuduinoBit;
    private terminalValues: { [K: string]: StuduinoBitPin; };

    constructor(studuinoBit: StuduinoBit) {
        this.studuinoBit = studuinoBit;

        this.terminalValues = {
            P0: new StuduinoBitAnalogDitialPin(this.studuinoBit, 32),
            P1: new StuduinoBitAnalogDitialPin(this.studuinoBit, 33),
            P2: new StuduinoBitAnalogPin(this.studuinoBit, 36),
            P3: new StuduinoBitAnalogPin(this.studuinoBit, 39),
            P4: new StuduinoBitDigitalPin(this.studuinoBit, 25),
            P5: new StuduinoBitAnalogDitialPin(this.studuinoBit, 15),
            P6: new StuduinoBitDigitalPin(this.studuinoBit, 26),
            P7: new StuduinoBitDigitalPin(this.studuinoBit, 5),
            P8: new StuduinoBitAnalogDitialPin(this.studuinoBit, 14),
            P9: new StuduinoBitAnalogDitialPin(this.studuinoBit, 12),
            P10: new StuduinoBitDigitalPin(this.studuinoBit, 0),
            P11: new StuduinoBitDigitalPin(this.studuinoBit, 27),
            P12: new StuduinoBitDigitalPin(this.studuinoBit, 4),
            P13: new StuduinoBitDigitalPin(this.studuinoBit, 18),
            P14: new StuduinoBitDigitalPin(this.studuinoBit, 19),
            P15: new StuduinoBitDigitalPin(this.studuinoBit, 23),
            P16: new StuduinoBitAnalogDitialPin(this.studuinoBit, 13),
            P19: new StuduinoBitDigitalPin(this.studuinoBit, 22),
            P20: new StuduinoBitDigitalPin(this.studuinoBit, 21),
        };
    }

    public getPin<K extends keyof TerminnalTypeMap>(pin: K): TerminnalTypeMap[K] {
        // @ts-ignore
        return this.terminalValues[pin];
    }
}
