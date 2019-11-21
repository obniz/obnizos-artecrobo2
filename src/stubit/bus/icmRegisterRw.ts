import {StuduinoBitI2C} from "./i2c";

export class ICMRegisterRW {
    private i2c: StuduinoBitI2C;
    private address: number;

    constructor(i2c: StuduinoBitI2C, address: number) {
        this.i2c = i2c;
        this.address = address;
    }

    public async registerShortWait(register: number,
                                   value: number | null = null,
                                   buf: [number, number] = [0, 0],
                                   endian: string = "b"): Promise<number | null> {

        if (value === null) {
            const data = await this.i2c.readFromMem(this.address, register, 2);
            if (endian === "b") {
                return data[0] << 8 | data[1];
            } else {
                return data[1] << 8 | data[0];
            }
        }
        if (endian === "b") {

            buf[0] = (( value >> 8) & 0xFF);
            buf[1] = (( value >> 0) & 0xFF);
        } else {
            buf[0] = (( value >> 0) & 0xFF);
            buf[1] = (( value >> 8) & 0xFF);
        }

        this.i2c.writeToMem(this.address, register, buf);
        return null;
    }

    public async registerThreeShortsWait(register: number,
                                         value: number[] | null = null,
                                         buf: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0],
                                         endian: string = "b"): Promise<[number, number, number] | null> {
        if (value === null) {
            const data: number[] = await this.i2c.readFromMem(this.address, register, 6);
            const results: [number, number, number] = [0, 0, 0];
            results[0] = (this.char2short(data.slice(0, 2) as [number, number], endian));
            results[1] = (this.char2short(data.slice(2, 4) as [number, number], endian));
            results[2] = (this.char2short(data.slice(4, 6) as [number, number], endian));
            return results;
        }

        this.i2c.writeToMem(this.address, register, buf);
        return null;
    }

    public async registerCharWait(register: number,
                                  value: number | null = null,
                                  buf: number[] = [0]): Promise<number | null> {
        if (value === null) {
            const data = await this.i2c.readFromMem(this.address, register, 1);
            return data[0];
        }
        this.i2c.writeToMem(this.address, register, [value]);
        return null;

    }

    private char2short(values: [number, number], endian = "b"): number {
        const buffer = new ArrayBuffer(2);
        const dv = new DataView(buffer);
        dv.setUint8(0, values[0]);
        dv.setUint8(1, values[1]);
        return dv.getInt16(0, endian !== "b" );
    }
}
