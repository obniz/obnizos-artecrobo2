import { Color, ColorToHex, hexToColor } from "../common";
import { CHARACTER_MAP } from "./imageConst3";

export class StuduinoBitImage {

  private _pixels: Color[][];
  private _color: Color;
  public static defaultColor: Color = [31, 0, 0];
  public static CHARACTER_MAP: { [key: string]: string } = CHARACTER_MAP;
  public static PIX_MAXCOLOR_FACTOR = 31;

  constructor(param0: string | number, param1: Color | number | null, buffer: Array<number> | null, color: Color = [31, 0, 0]) {
    if (typeof param0 === 'string') {
      if (typeof param1 === 'number') {
        throw new Error(`Invalid format of color`)
      }
      if (!param1) {
        param1 = StuduinoBitImage.defaultColor;
      }
      this._color = param1;
      this._pixels = this.pixelsFrom(param0, param1);
    } else {
      if (0 < param0 && param0 <= 5 && typeof param1 == 'number' && 0 < param1 && param0 <= 5) {
        this._color = color;
        this._pixels = this.pixelsFromBuffer(param0, param1, buffer, color);
      } else {
        throw new Error(`Invalid Format`);
      }
    }
  }

  private pixelsFrom(str: string, color: Color) : Color[][] {
    const arrays: Color[][] = []

    const rowBuf = str.split(':');
    for (const rowString of rowBuf) {
      if (rowString.length == 0) continue;
      const row: Color[] = [];
      for (let index = 0; index < rowString.length; index++) {
        if (rowString.charAt(index) === '0') {
          row.push([0, 0, 0])
        } else {
          row.push(color)
        }
      }
      arrays.push(row);
    }

    return arrays;
  }

  private pixelsFromBuffer(w: number, h: number, buffer: Array<number> | null, color: Color): Color[][] {
    const arrays: Color[][] = []

    if (buffer) {
      if (buffer.length != w * h) {
        throw new Error(`buffer size does not match to w*h`)
      }
      for (let y=0; y<h; y++) {
        let row: Color[] = [];
        for (let x = 0; x < w; x++) {
          row.push(buffer[y*w+x] ? color : [0, 0, 0])
        }
        arrays.push(row);
      }
    } else {
      for (let y = 0; y < h; y++) {
        let row = [];
        for (let x = 0; x < w; x++) {
          row.push(color) /* [0, 0, 0]？ */
        }
        arrays.push(row);
      }
    }

    return arrays;
  }

  public toPixels() {

    const pixels = [];
    for (const row of this._pixels) {
      for (const one of row) {
        pixels.push(one);
      }
    }

    return pixels;
  }

  public width() :number {
    return this._pixels[0].length;
  }

  public height(): number {
    return this._pixels.length;
  }

  public setPixel(x: number, y: number, value: number) {
    if ( x < 0 || x >= this.width() || y < 0 || y >= this.height() ) {
      throw new Error(`It exceed image size`)
    }
    this.setPixelColor(x, y, (value) ? this._color : [0, 0, 0]);
  }

  public setPixelColor(x: number, y: number, color: Color) {
    if (x < 0 || x >= this.width() || y < 0 || y >= this.height()) {
      throw new Error(`It exceed image size`)
    }
    this._pixels[y][x] = color;
  }

  public getPixel(x: number, y: number): number {
    if (x < 0 || x >= this.width() || y < 0 || y >= this.height()) {
      throw new Error(`It exceed image size`)
    }
    return this._pixels[y][x][0] + this._pixels[y][x][1] + this._pixels[y][x][2] !== 0 ? 1 : 0;
  }

  public getPixelColor(x: number, y: number, hex: boolean = false): Color | string {
    if (x < 0 || x >= this.width() || y < 0 || y >= this.height()) {
      throw new Error(`It exceed image size`)
    }
    const pixel = this._pixels[y][x];
    if(hex) {
      return ColorToHex(pixel);
    }
    return this._pixels[y][x];
  }

  public setBaseColor(param0: Color | string | number, param1: number = 0, param2: number = 0) {
    let color: Color = [0,0,0];
    if (typeof param0 === "string") {
      color = hexToColor(param0);
    } else if (typeof param0 === "number") {
      color = [param0 as number, param1, param2]
    } else {
      color = param0 as Color;
    }
    this._color = color;
  }

  public shiftLeft(shift: number) {
    for (let i = 0; i<shift; i++) {
      for (const row of this._pixels) {
        for (let index=0; index<row.length-1; index++) {
          row[index] = row[index+1];
        }
        row[row.length-1] = [0, 0, 0];
      }
    }
  }

  public shiftRight(shift: number) {
    for (let i = 0; i < shift; i++) {
      for (const row of this._pixels) {
        for (let index = row.length - 1; index > 0; index--) {
          row[index] = row[index-1];
        }
        row[0] = [0, 0, 0];
      }
    }
  }

  public shiftUp(shift: number) {
    for (let count=0; count<shift; count++) {
      let row: Color[] = [];
      for (let i = 0; i < this.width(); i++) {
        row.push([0, 0, 0]);
      }
      this._pixels.splice(0, 1);
      this._pixels.push(row);
    }
  }

  public shiftDown(shift: number) {
    for (let count = 0; count < shift; count++) {
      let row: Color[] = [];
      for (let i = 0; i < this.width(); i++) {
        row.push([0, 0, 0]);
      }
      this._pixels.unshift(row);
      this._pixels.splice(this._pixels.length-1, 1);
    }
  }

  public crop(src_x: number, src_y: number, w:number , h: number): StuduinoBitImage {
    if (src_x < 0 || src_x + w > this.width() || src_y < 0 || src_y + h > this.height() || w == 0 || h == 0) {
      throw new Error(`Invalid crop`)
    }
    const buf = [];
    for (let y=0; y<h; y++) {
      for (let x=0; x<w; x++) {
        buf.push(this.getPixel(src_x + x, src_y + y));
      }
    }
    return new StuduinoBitImage(w, h, buf, this._color);
  }

  public copy(): StuduinoBitImage {
    return this.crop(0, 0, this.width(), this.height());
  }

  public invert() {
    for (let y = 0; y < this.height(); y++) {
      for (let x = 0; x < this.width(); x++) {
        this.setPixel(x, y, this.getPixel(x, y) ? 0 : 1);
      }
    }
  }

  public fill(value: number) {
    if (value < 0 || 9 < value) {
      throw new Error(`value must be within 0 to 9`)
    }
    let v = Math.floor(StuduinoBitImage.PIX_MAXCOLOR_FACTOR * value / 9);
    let color: Color = [v, v, v]
    for (let y = 0; y < this.height(); y++) {
      for (let x = 0; x < this.width(); x++) {
        this.setPixelColor(x, y, this.getPixel(x, y) ? color : [0, 0, 0]);
      }
    }
  }

  protected paste(src: StuduinoBitImage, x: number , y:number) {
    for (let indexy = 0; indexy < src.height() && (indexy + y) < this.height(); indexy++) {
      for (let indexx = 0; indexx < src.width() && (indexx + x) < this.width(); indexx++) {
        this.setPixelColor((indexx + x), (indexy + y), src.getPixelColor(indexx, indexy) as Color);
      }
    }
  }

  public blit(src: StuduinoBitImage, src_x: number, src_y: number, w: number, h: number, xdest: number = 0, ydest: number = 0) {
    const cropped = src.crop(src_x, src_y, w, h);
    this.paste(cropped, xdest, ydest);
  }

  public repr(): string {
    let result = "";
    for (let y=0; y<this.height(); y++) {
      for (let x = 0; x < this.width(); x++) {
        result += (this.getPixel(x, y)) ? '1' : '0';
      }
      result += ':';
    }

    return result;
  }

  public str(): string {
    let result = "";
    for (let y = 0; y < this.height(); y++) {
      for (let x = 0; x < this.width(); x++) {
        result += (this.getPixel(x, y)) ? '1' : '0';
      }
      if (y + 1 == this.height()) {
        result += ':';
      } else {
        result += ':\n';
      }
    }

    return result;
  }
}