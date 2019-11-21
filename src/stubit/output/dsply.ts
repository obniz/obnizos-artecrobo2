import {IO} from "obniz/obniz/libs/io_peripherals/io";
import {WS2812B, WS2812BOptions} from "obniz/parts/Light/WS2812B";
import {Color} from "../common";
import {BuiltinColor} from "../const";
import {StuduinoBit} from "../index";

export class StuduinoBitDisplay {
    private _obnizWS2812B: WS2812B;
    private _pixcels: Color[];
    private _enable: boolean = false;
    private _enablePin: IO;
    private _studioBit: StuduinoBit;

    constructor(studioBit: StuduinoBit, options: WS2812BOptions) {
        this._studioBit = studioBit;
        this._enablePin = studioBit.obniz.io2;
        this.off();
        this._obnizWS2812B = studioBit.obniz.wired("WS2812B", options);
        this._pixcels = [];
        for (let i = 0; i < 25; i++) {
            this._pixcels.push(BuiltinColor.CLEAR);
        }

        // this.onWait();

    }

    public getPixel(x: number, y: number): Color {
        return this._pixcels[this._getIndex(x, y) ];
    }

    public setPixcel(x: number, y: number, color: Color | string ) {

        let  c: [number, number, number];
        if (typeof color === "string") {
            c = [0, 0, 0];
        } else if (Array.isArray(color)) {
            c = color;
        } else {
            throw new Error("color takes a [R,G,B] or #RGB");
        }

        this._pixcels[this._getIndex(x, y)] = c;
        this._update();

    }

    public on() {
        this._enable = true;
        this._enablePin.output(true);
        this._studioBit.obniz.wait(1);
        this._update();
    }

    public off() {
        this._enable = false;
        this._enablePin.output(false);
    }

    public show( iterable: [],
                 delay: number= 400,
                 wait: boolean= true,
                 loop: boolean= false,
                 clear: boolean= false,
                 color: Color | null = null) {

        // TODO
        throw new Error("TODO");

    }

    public scroll( str: string,
                   delay: number= 150,
                   wait: boolean= true,
                   loop: boolean= false,
                   monospace: boolean= false,
                   color: Color | null = null) {

        // TODO
        throw new Error("TODO");

    }

    public clear() {
        this._pixcels = [];
        for (let i = 0; i < 25; i++) {
            this._pixcels.push(BuiltinColor.CLEAR);
        }
        this._update();
    }

    public isOn() {
        return this._enable;
    }

    private _oneColor(color: Color) {
        this._pixcels = [];
        for (let i = 0; i < 25; i++) {
            this._pixcels.push(color);
        }
        this._update();
    }

    private _getIndex(x: number, y: number): number {
        return Math.abs(x - 4) * 5 + y;
    }

    private _update() {
        if (!this.isOn()) {
            return;
        }
        this._obnizWS2812B.rgbs(this._pixcels);
    }

}
