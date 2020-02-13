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

    protected PIX_MAXCOLOR_FACTOR = Image.PIX_MAXCOLOR_FACTOR;
    
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
            if (BuiltinColor[color]) {
                c = BuiltinColor[color]
            } else {
                console.log("Invailed color")
                c = [0, 0, 0];
            }
        } else if (Array.isArray(color)) {
            c = color;
        } else {
            throw new Error("color takes a [R,G,B] or #RGB");
        }

        if (y < 0 || x < 0 || y >= this.height || x >= this.width) {
            throw new Error('index out of bounds')
        }
        
        if (c[0] < 0 || c[0] > this.PIX_MAXCOLOR_FACTOR ||
            c[1] < 0 || c[1] > this.PIX_MAXCOLOR_FACTOR ||
            c[2] < 0 || c[2] > this.PIX_MAXCOLOR_FACTOR) {
            throw new Error(`color factor must be 0-${this.PIX_MAXCOLOR_FACTOR}`)
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

        if (wait) {
            await this.showDraw(iterable, delay, wait, loop, clear, color)
        } else {
            if (loop) {
                throw new Error(`You can't loop with no wait`)
            }
            this.showDraw(iterable, delay, wait, loop, clear, color)
        }
    }



    public async showDraw(iterable: Image[] | string[] | number[],
        delay: number = 400,
        wait: boolean = true,
        loop: boolean = false,
        clear: boolean = false,
        color: Color | null = null) {

        this._paintColor = color || Image.defaultColor;

        while(true) {
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
                await this._studioBit.wait(delay)
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

        if (wait) {
            await this.scrollDraw(text, delay, wait, loop, monospace, color)
        } else {
            if (loop) {
                throw new Error(`You can't loop with no wait`)
            }
            this.scrollDraw(text, delay, wait, loop, monospace, color)
        }
    }

    public async scrollDraw(text: string, delay: number, wait: boolean, loop: boolean, monospace: boolean, color: Color | null = null) {

        this._paintColor = color || Image.defaultColor;

        const disp_string: string = ' ' + text + ' ';

        while (true) {
            for (let i = 0; i < text.length; i++) {
                const curr: any = Image.CHARACTER_MAP[disp_string[i]] ? Image.CHARACTER_MAP[disp_string[i]] : Image.CHARACTER_MAP["?"]
                const next: any = Image.CHARACTER_MAP[disp_string[i + 1]] ? Image.CHARACTER_MAP[disp_string[i + 1]] : Image.CHARACTER_MAP["?"]
                const currArr: any = curr.split(":")
                const nextArr: any = next.split(":")
                for (let j = 0; j < 5; j++) {
                    let img: any = []
                    for (let x = 0; x < 5; x++) {
                        img.push((currArr[x].slice(j)).concat(nextArr[x].slice(0, j)))
                    }
                    const image: any = new Image(img.join(":"), this._paintColor, null)

                    this.showImage(image)
                    await this._studioBit.wait(delay)
                }
            }
            if (!loop) {
                break;
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
        let curr: any = Image.CHARACTER_MAP[text] ? Image.CHARACTER_MAP[text] : Image.CHARACTER_MAP["?"]
        let image = new Image(curr, this._paintColor, null)
        this.showImage(image)
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
