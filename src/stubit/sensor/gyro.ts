import {StuduinoBitICM20948} from "./icm20948";

export class StuduinoBitGyro {
    private icm20948: StuduinoBitICM20948;

    constructor( icm20948: StuduinoBitICM20948, fs: string= "250dps", sf: string= "dps") {
        this.icm20948 = icm20948;
    }

    public async getXWait(ndigits: number = 2): Promise<number> {
        const d = Math.pow(10, ndigits);
        return Math.round( (await this.icm20948.gyroWait())[0] * d) / d;
    }
    public async getYWait(ndigits: number = 2): Promise<number> {
        const d = Math.pow(10, ndigits);
        return Math.round( (await this.icm20948.gyroWait())[1] * d) / d;
    }
    public async getZWait(ndigits: number = 2): Promise<number> {
        const d = Math.pow(10, ndigits);
        return Math.round( (await this.icm20948.gyroWait())[2] * d) / d;
    }

    public async getValuesWait(ndigits: number = 2): Promise<number[]> {
        const d = Math.pow(10, ndigits);
        const values = (await this.icm20948.gyroWait());
        return values.map((e) => Math.round( e * d) / d);

    }
    public setFs(value: string) {
        this.icm20948.gyroFs(value);
    }
    public setSf(value: string) {
        this.icm20948.gyroSf(value);
    }
}
