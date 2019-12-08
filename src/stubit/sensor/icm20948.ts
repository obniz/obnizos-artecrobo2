import {StuduinoBitI2C} from "../bus/i2c";
import {ICMRegisterRW} from "../bus/icmRegisterRw";
import {StuduinoBit} from "../index";
import {StuduinoBitAK09916} from "./ak09916";

export class StuduinoBitICM20948 extends ICMRegisterRW {
    public g = 9.80665;
    private _studuinoI2C: StuduinoBitI2C;
    private _ADDR = 0x69;
    private _ak09916?: StuduinoBitAK09916;

    private _WHO_AM_I = (0x00);
    private _GYRO_CONFIG = (0x01);
    private _ACCEL_CONFIG = (0x14);
    private _ACCEL_CONFIG2 = (0x15);
    private _INT_PIN_CFG = (0x0f);
    private _ACCEL_XOUT_H = (0x2d);
    private _ACCEL_XOUT_L = (0x2e);
    private _ACCEL_YOUT_H = (0x2f);
    private _ACCEL_YOUT_L = (0x30);
    private _ACCEL_ZOUT_H = (0x31);
    private _ACCEL_ZOUT_L = (0x32);
    private _GYRO_XOUT_H = (0x33);
    private _GYRO_XOUT_L = (0x34);
    private _GYRO_YOUT_H = (0x35);
    private _GYRO_YOUT_L = (0x36);
    private _GYRO_ZOUT_H = (0x37);
    private _GYRO_ZOUT_L = (0x38);

// #_ACCEL_FS_MASK = const(0b00011000)
    private _ACCEL_FS_SEL_2G = (0b00000000);
    private _ACCEL_FS_SEL_4G = (0b00000010);
    private _ACCEL_FS_SEL_8G = (0b00000100);
    private _ACCEL_FS_SEL_16G = (0b00000110);

    private _ACCEL_SO_2G = 16384; // 1 / 16384 ie. 0.061 mg / digit
    private _ACCEL_SO_4G = 8192; // 1 / 8192 ie. 0.122 mg / digit
    private _ACCEL_SO_8G = 4096; // 1 / 4096 ie. 0.244 mg / digit
    private _ACCEL_SO_16G = 2048; // 1 / 2048 ie. 0.488 mg / digit

    private _GYRO_FS_MASK = (0b00000110);
    private _GYRO_FS_SEL_250DPS = (0b00110001);
    private _GYRO_FS_SEL_500DPS = (0b00110011);
    private _GYRO_FS_SEL_1000DPS = (0b00110101);
    private _GYRO_FS_SEL_2000DPS = (0b00110111);

    private _GYRO_SO_250DPS = 131;
    private _GYRO_SO_500DPS = 62.5;
    private _GYRO_SO_1000DPS = 32.8;
    private _GYRO_SO_2000DPS = 16.4;

// # Used for enablind and disabling the i2c bypass access
    private _I2C_BYPASS_MASK = (0b00000010);
    private _I2C_BYPASS_EN = (0b00000010);
    private _I2C_BYPASS_DIS = (0b00000000);

    private _SF_MG = 1000;  //    mg
    private _SF_M_S2 = 9.80665; // 1 g = 9.80665 m/s2 ie. standard gravity
    private _SF_DEG_S = 1; // deg / s
    private _SF_RAD_S = 57.295779578552; // 1 rad / s is 57.295779578552 deg / s;

    private _accel_sf: number;
    private _accel_so: number;
    private _gyro_sf: number;
    private _gyro_so: number;

    constructor(i2c: StuduinoBitI2C) {
        super(i2c, 0x69);
        this._studuinoI2C = i2c;

        this._accel_so = this._accelFs(this._ACCEL_FS_SEL_2G);
        this._accel_sf = this._SF_M_S2;

        this._gyro_so = this._gyroFs(this._GYRO_FS_SEL_250DPS);
        this._gyro_sf = this._SF_DEG_S;

    }

    public async initWait() {
        const data = await this._studuinoI2C.readFromMem(this._ADDR, 0x00, 1);

        if (data.length !== 1 || data[0] !== 0xea) {
            throw new Error("ICM20948 not found in I2C bus.");
        }

        this._studuinoI2C.writeToMem(this._ADDR, 0x06, [0x01]);  // wake;
        this._studuinoI2C.writeToMem(this._ADDR, 0x0f, [0x02]);  // passthrough;
        this._studuinoI2C.writeToMem(this._ADDR, 0x03, [0x00]);

        // await this.studuinoI2C.scanWait();

        this._studuinoI2C.writeToMem(12, 0x31, [0x00]);  // power down mode
        const buf3 = await this._studuinoI2C.readFromMem(12, 0x60, 3);

        this._ak09916 = new StuduinoBitAK09916(this._studuinoI2C);

    }

    public accelFs(value: string) {
        if (value === "2g") {
            this._accel_so = this._accelFs(this._ACCEL_FS_SEL_2G);
        } else if (value === "4g") {
            this._accel_so = this._accelFs(this._ACCEL_FS_SEL_4G);
        } else if (value === "8g") {
            this._accel_so = this._accelFs(this._ACCEL_FS_SEL_8G);
        } else if (value === "16g") {
            this._accel_so = this._accelFs(this._ACCEL_FS_SEL_16G);
        } else {
            throw new Error("must be '2g'/'4g'/'8g'/'16g'");
        }
    }

    public accelSf(value: string) {
        if (value === "mg") {
            this._accel_sf = this._SF_MG;
        } else if (value === "ms2") {
            this._accel_sf = this._SF_M_S2;
        } else {
            throw new Error("must be 'mg'/'ms2'");
        }
    }

    public async accelerationWait(): Promise<[number, number, number]> {
        /*
        Acceleration measured by the sensor. By default will return a
        3-tuple of X, Y, Z axis accelerationWait values in mG as integer.
        */
        const so = this._accel_so;
        const sf = this._accel_sf;

        const xyz: [number, number, number]
            = await this.registerThreeShortsWait(this._ACCEL_XOUT_H) as [number, number, number];

        return xyz.map((e) => e / so * sf) as [number, number, number] ;
    }

    public async gyroWait(): Promise<[number, number, number]> {
        // """
        // X, Y, Z radians per second as floats.
        // """
        const so = this._gyro_so;
        const sf = this._gyro_sf;

        const xyz = await this.registerThreeShortsWait(this._GYRO_XOUT_H) as [number, number, number];
        return xyz.map((e) => e / so * sf) as [number, number, number];
    }

    public async magneticWait(): Promise<[number, number, number]> {
        return this._ak09916!.magnetic();
    }

    public async calibrateWait(){
        return this._ak09916!.calibrateWait();
    }

    public whoamiWait(): Promise<number> {
        // Value of the whoamiWait register. """
        return this.registerCharWait(this._WHO_AM_I) as Promise<number>;
    }

    public gyroFs(value: string) {
        if (value === "250dps") {
            this._gyro_so = this._gyroFs(this._GYRO_FS_SEL_250DPS);
        } else if (value === "500dps") {
            this._gyro_so = this._gyroFs(this._GYRO_FS_SEL_500DPS);
        } else if (value === "1000dps") {
            this._gyro_so = this._gyroFs(this._GYRO_FS_SEL_1000DPS);
        } else if (value === "2000dps") {
            this._gyro_so = this._gyroFs(this._GYRO_FS_SEL_2000DPS);
        } else {
            throw new Error("must be '250dps'/'500dps'/'1000dps'/'2000dps'");
        }
    }

    public gyroSf(value: string) {
        if (value === "dps") {
            this._gyro_sf = this._SF_DEG_S;
        } else if (value === "rps") {
            this._gyro_sf = this._SF_RAD_S;
        } else {
            throw new Error("must be 'dps'/'rps'");
        }

    }

    private async _gyroDlpfWait( dlpfcfg: number = -1) {

        this.registerCharWait(0x7f, 0x20);
// # get ICM20948 gyroWait configuration.
        let char: number = (await this.registerCharWait(this._GYRO_CONFIG)) as number;
        char &= this._GYRO_FS_MASK; // clear DLDF bits

        if (dlpfcfg === -1) {
            char |= 0x00000000;
        } else if (dlpfcfg === 0) {
            char |= 0x00000001;
        } else if (dlpfcfg === 1) {
            char |= 0x00001001;
        } else if (dlpfcfg === 2) {
            char |= 0x00010001;
        } else if (dlpfcfg === 3) {
            char |= 0x00011001;
        } else if (dlpfcfg === 4) {
            char |= 0x00100001;
        } else if (dlpfcfg === 5) {
            char |= 0x00101001;
        } else if (dlpfcfg === 6) {
            char |= 0x00110001;
        } else if (dlpfcfg === 7) {
            char |= 0x00111001;
        } else {
            char |= 0x00000000;
        }
        this.registerCharWait(this._GYRO_CONFIG, char);
        this.registerCharWait(0x7f, 0x00);
    }

    private _accelFs(value: number): number {
        this.registerCharWait(0x7f, 0x20);
        this.registerCharWait(this._ACCEL_CONFIG, value);
        this.registerCharWait(0x7f, 0x00);

        // # Return the sensitivity divider
        if (this._ACCEL_FS_SEL_2G === value) {
            return this._ACCEL_SO_2G;
        } else if (this._ACCEL_FS_SEL_4G === value) {
            return this._ACCEL_SO_4G;
        } else if (this._ACCEL_FS_SEL_8G === value) {
            return this._ACCEL_SO_8G;
        } else if (this._ACCEL_FS_SEL_16G === value) {
            return this._ACCEL_SO_16G;
        }
        return 0;
    }

    private _gyroFs(value: number): number {

        this.registerCharWait(0x7f, 0x20);
        this.registerCharWait(this._GYRO_CONFIG, value);
        this.registerCharWait(0x7f, 0x00);

    // # Return the sensitivity divider
        if (this._GYRO_FS_SEL_250DPS === value) {
            return this._GYRO_SO_250DPS;
        } else if (this._GYRO_FS_SEL_500DPS === value) {
            return this._GYRO_SO_500DPS;
        } else if (this._GYRO_FS_SEL_1000DPS === value) {
            return this._GYRO_SO_1000DPS;
        } else if (this._GYRO_FS_SEL_2000DPS === value) {
            return this._GYRO_SO_2000DPS;
        }

        return 0;
    }
}
