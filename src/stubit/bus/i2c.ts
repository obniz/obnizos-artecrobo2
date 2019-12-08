import {I2C} from "obniz/obniz/libs/io_peripherals/i2c";
import {StuduinoBit} from "../index";

export interface StuduinoBitICM20948Options {
    sda: number;
    scl: number;
}

export class StuduinoBitI2C {
    public obnizI2c: I2C;

    constructor(studuinoBit: StuduinoBit, freq: number = 100000, scl: number = 22, sda: number = 21) {
        this.obnizI2c = studuinoBit.obniz.getFreeI2C();
        this.obnizI2c.start({
            mode: "master",
            sda,
            scl,
            clock: freq,
        });
        studuinoBit.obniz.wait(5);
    }

    public async read(addr: number, n: number): Promise<number[]> {
        return await this.obnizI2c.readWait(addr, n);
    }

    public write(addr: number, buf: number[], repeat: boolean = false) {
        this.obnizI2c.write(addr, buf);
    }

    public async readFromMem(addr: number, memAddr: number, length: number): Promise<number[]> {
        this.obnizI2c.write(addr, [memAddr]);
        return await this.obnizI2c.readWait(addr, length);
    }

    public writeToMem(addr: number, memAddr: number, data: number[]) {
        this.obnizI2c.write(addr, [memAddr, ...data]);
    }

    public async scanWait(): Promise<number[]> {
        const addr: number[] = [];

        const tmpFunc = this.obnizI2c.onerror;

        for (let i = 0x08; i <= 0x77; i++) {

            await new Promise((resolve, reject) => {
                this.obnizI2c.onerror = reject;
                this.obnizI2c.write(i, [0x00]);

                setTimeout(() => {
                    resolve();
                }, 500);
            }).then(() => {
                addr.push(i);
            }).catch((e) => {
                console.log("not found " + i);
            });

        }
        this.obnizI2c.onerror = tmpFunc;
        return addr;
    }
}
