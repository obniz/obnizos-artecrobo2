import {SPI} from "obniz/obniz/libs/io_peripherals/spi";
import {StuduinoBit} from "../index";

export class StuduinoBitSPI {
    private obnizSpi: SPI;

    constructor(studuinoBit: StuduinoBit,
                baudrate: number = 1000000,
                bits: number = 8,
                mode: number = 0,
                sclk: number = 0,
                mosi: number = 0,
                miso: number = 0) {

        throw new Error("NotImplementedError");
        // this.obnizSpi = studuinoBit.obniz.getFreeSpi();
        // this.obnizSpi.start({
        //     mode: "master",
        //     clk: sclk,
        //     mosi,
        //     miso,
        //     frequency: baudrate,
        // });
    }

    public readWait(nbytes: number): Promise<number[]> {

        throw new Error("NotImplementedError");
    }

    public write(buf: number[]) {

        throw new Error("NotImplementedError");
    }

    public writeReadInto(buf: number[]) {

        throw new Error("NotImplementedError");
    }

}
