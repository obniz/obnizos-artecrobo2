import {StuduinoBit} from "../stubit/index";
import {ArtecRoboBuzzer} from "./parts/bzr";
import { ArtecRoboAccelerometer } from "./parts/acc";
import {ArtecRoboIrPhotoRefrector} from "./parts/irPhtoRefrector";
import {ArtecRoboLed} from "./parts/led";
import {ArtecRoboMotor} from "./parts/motor";
import {ArtecRoboServoMotor} from "./parts/servomotor";
import {ArtecRoboSoundSensor} from "./parts/sound";
import {ArtecRoboTemperature} from "./parts/temperature";
import {ArtecRoboTouchSensor} from "./parts/touch";
import {I2CPin} from "./pin/i2cPin";
import {InPin} from "./pin/inPin";
import {MotorPin} from "./pin/motorPin";
import {OutPin} from "./pin/outPin";
import {Pin} from "./pin/pin";

export type ArtecRoboI2CPort = "I2C"  ;
export type ArtecRoboMotorPort = "M1" | "M2" ;
export type ArtecRoboInputPort = "P0" | "P1" | "P2" ;
export type ArtecRoboOutputPort = "P13" | "P14" | "P15" | "P16" ;
export type ArtecRoboPort = ArtecRoboI2CPort | ArtecRoboMotorPort | ArtecRoboInputPort | ArtecRoboOutputPort ;

export class ArtecRobo {
    public static Led = ArtecRoboLed;
    public static TouchSensor = ArtecRoboTouchSensor;
    public static Motor = ArtecRoboMotor;
    public static Buzzer = ArtecRoboBuzzer;
    public static Accelerometer = ArtecRoboAccelerometer;
    public static ServoMotor = ArtecRoboServoMotor;
    public static IrPhotoRefrector = ArtecRoboIrPhotoRefrector;
    public static Temperature = ArtecRoboTemperature;
    public static SoundSensor = ArtecRoboSoundSensor;
    public p0?: InPin;
    public p1?: InPin;
    public p2?: InPin;
    public p13?: OutPin;
    public p14?: OutPin;
    public p15?: OutPin;
    public p16?: OutPin;
    public m1?: MotorPin;
    public m2?: MotorPin;
    public i2c?: I2CPin;
    public studuinoBit: StuduinoBit;
    public onconnect?: () => Promise<void>;
    public onclose?: () => Promise<void>;

    constructor(studuinoBit: StuduinoBit | string, options?: any) {
        if (typeof studuinoBit === "string") {
            studuinoBit = new StuduinoBit(studuinoBit, options);
        }
        this.studuinoBit = studuinoBit;

        this.studuinoBit.onconnect = async () => {
            await this._wire();
            if (this.onconnect) {
                const p = this.onconnect();
                if (p instanceof Promise) {
                    await p;
                }
            }
        };

        this.studuinoBit.onclose = async () => {
            this._unWire();
            if (this.onclose) {
                const p = this.onclose();
                if (p instanceof Promise) {
                    await p;
                }
            }
        };
    }

    public getPin(port: ArtecRoboPort): Pin | undefined {
        if (port === "P0") {
            return this.p0;
        } else if (port === "P1") {
            return this.p1;
        } else if (port === "P2") {
            return this.p2;
        } else if (port === "P13") {
            return this.p13;
        } else if (port === "P14") {
            return this.p14;
        } else if (port === "P15") {
            return this.p15;
        } else if (port === "P16") {
            return this.p16;
        } else if (port === "I2C") {
            return this.i2c;
        }
    }

    private _wire() {
        this.p0 = new InPin(this.studuinoBit.terminal!.getPin("P0"));
        this.p1 = new InPin(this.studuinoBit.terminal!.getPin("P1"));
        this.p2 = new InPin(this.studuinoBit.terminal!.getPin("P2"));
        this.p13 = new OutPin(this.studuinoBit.terminal!.getPin("P13"));
        this.p14 = new OutPin(this.studuinoBit.terminal!.getPin("P14"));
        this.p15 = new OutPin(this.studuinoBit.terminal!.getPin("P15"));
        this.p16 = new OutPin(this.studuinoBit.terminal!.getPin("P16"));
        this.m1 = new MotorPin(this.studuinoBit.i2c!);
        this.m2 = new MotorPin(this.studuinoBit.i2c!);
        this.i2c = new I2CPin(this.studuinoBit.i2c!);
    }

    private _unWire() {
        this.p0 = undefined;
        this.p1 = undefined;
        this.p2 = undefined;
        this.p13 = undefined;
        this.p14 = undefined;
        this.p15 = undefined;
        this.p16 = undefined;
        this.m1 = undefined;
        this.m2 = undefined;
        this.i2c = undefined;
    }

}
