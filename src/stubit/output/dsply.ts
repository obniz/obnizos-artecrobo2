import {IO} from "obniz/obniz/libs/io_peripherals/io";
import {WS2812B, WS2812BOptions} from "obniz/parts/Light/WS2812B";
import { Color, ColorToHex} from "../common";
import {BuiltinColor} from "../const";
import {StuduinoBit} from "../index";
import {StuduinoBitImage as Image} from '../image/image'

export class StuduinoBitDisplay {
    private _obnizWS2812B: WS2812B;
    private _pixcels: Color[];
    private _paintColor: Color = Image.defaultColor;
    private _enable: boolean = false;
    private _enablePin: IO;
    private _studioBit: StuduinoBit;
    private _canvas: HTMLCanvasElement | null = null;
    protected width = 5;
    protected height = 5;

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

        this._preparedCanvas();

    }

    private _preparedCanvas() {
        if (this._canvas) {
            return this._canvas;
        }
        const isNode = typeof window === 'undefined';
        if (isNode) {

        } else {
            const identifier = 'obnizcanvas-';
            let canvas = document.getElementById(identifier) as HTMLCanvasElement;
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.setAttribute('id', identifier);
                canvas.style.visibility = 'hidden';
                canvas.width = this.width;
                canvas.height = this.height;
                canvas.style['-webkit-font-smoothing' as any] = 'none';
                let body = document.getElementsByTagName('body')[0];
                body.appendChild(canvas);
            }
            const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.fillStyle = '#FFF';
            ctx.strokeStyle = '#FFF';
            ctx.font = `7px sans-serif`;
            this._canvas = canvas;
        }
        return
    }

    protected _ctx(): CanvasRenderingContext2D  {
        this._preparedCanvas();
        return this._canvas!.getContext('2d') as CanvasRenderingContext2D;
    }

    public getPixel(x: number, y: number): Color {
        return this._pixcels[this._getIndex(x, y) ];
    }

    public setPixel(x: number, y: number, color: Color | string ) {

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

    private draw(ctx: CanvasRenderingContext2D) {
        let width = this.width;
        let height = this.height;
        //1pxずつデータ通信をしないために一度offにする
        this.off();

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const index = Math.floor(i/4);
            const line = Math.floor(index / width);
            const col = Math.floor(index - line * width);
            this.setPixel(col, line, [data[i], data[i + 1], data[i + 2]]);
        }
        this.on();
    }

    public async showWait(iterable: Image[] | string[] | number[],
        delay: number = 400,
        wait: boolean = true,
        loop: boolean = false,
        clear: boolean = false,
        color: Color | null = null) {

        this._paintColor = color || Image.defaultColor;


        while (true) {
            for (const item of iterable) {
                if (item instanceof Image) {
                    this.showImage(item)
                } else if (typeof item === 'string') {
                    this.showText(item);
                } else if (typeof item === 'number') {
                    this.showNumber(item);
                } else {
                    throw new Error(`It can't be shown`)
                }
                if (wait) {
                    await this._studioBit.wait(delay)
                } else {
                    if (loop) {
                        throw new Error(`You can't loop with no wait`)
                    }
                    this._studioBit.wait(delay)
                }
            }
            if (!loop) {
                break;
            }
        }
        if (clear) {
            this.clear();
        }
    }
    
    public async scrollWait(text: string,
        delay: number = 150,
        wait: boolean = true,
        loop: boolean = false,
        monospace: boolean = false,
        color: Color | null = null) {

        this._paintColor = color || Image.defaultColor;

        const ctx = this._ctx();
        var metrics = ctx.measureText(text);

        for (let i = 0; i < metrics.width; i++) {
            while (true) {
                this.showText(text, -i, monospace);
                if (wait) {
                    await this._studioBit.wait(delay)
                } else {
                    if (loop) {
                        throw new Error(`You can't loop with no wait`)
                    }
                    this._studioBit.wait(delay)
                }
                if (!loop) {
                    break;
                }
            }
        }
    }

    protected showImage(image :Image) {
        this.off();
        //const color: Color = this._paintColor || Image.defaultColor;
        for (let y=0; y<image.height(); y++) {
            for (let x = 0; x < image.width(); x++) {
                // const value = image.getPixel(x, y);
                // this.setPixel(x, y, value ? color : [0, 0, 0]);
                this.setPixel(x, y, image.getPixelColor(x, y));
            }
        }
        this.on();
    }

    protected showText(text: string, x:number = 0, monospace = false) {
        const ctx = this._ctx();
        const color: Color = this._paintColor;
        const hex = ColorToHex(color);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.font = monospace ? `7px monospace` : `7px sans-serif`;
        ctx.fillStyle = hex;
        ctx.fillText(text, x, 5);

        this.draw(ctx);
        this._update();
    }

    protected showNumber(number: number) {
        this.showText(''+number);
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
