import {StuduinoBitICM20948} from "./icm20948";

export class StuduinoBitAccelerometer {
    private _icm20948: StuduinoBitICM20948;

    constructor( icm20948: StuduinoBitICM20948, fs: string= "2g", sf: string= "ms2") {
        this._icm20948 = icm20948;
    }

    public async getXWait(ndigits: number = 2): Promise<number> {
        const d = Math.pow(10, ndigits);
        return Math.round( (await this._icm20948.accelerationWait())[0] * d) / d;
    }
    public async getYWait(ndigits: number = 2): Promise<number> {
        const d = Math.pow(10, ndigits);
        return Math.round( (await this._icm20948.accelerationWait())[1] * d) / d;
    }
    public async getZWait(ndigits: number = 2): Promise<number> {
        const d = Math.pow(10, ndigits);
        return Math.round( (await this._icm20948.accelerationWait())[2] * d) / d;
    }

    public async getValuesWait(ndigits: number = 2): Promise<number[]> {
        const d = Math.pow(10, ndigits);
        const values = (await this._icm20948.accelerationWait());
        return values.map((e) => Math.round( e * d) / d);

    }
    public setFs(value: string) {
        this._icm20948.accelFs(value);
    }
    public setSf(value: string) {
        this._icm20948.accelSf(value);
    }
}
