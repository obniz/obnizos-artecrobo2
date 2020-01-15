import { StuduinoBitICM20948 } from "./icm20948";
import { Cookies } from '../common'
import { StuduinoBit } from '../index'

export class StuduinoBitCompass {
  private studuinoBit: StuduinoBit
  private _icm20948: StuduinoBitICM20948;
  private calibrated = false;
  private offset = [0, 0, 0]
  private scale = [1, 1, 1]

  private OFFSET_COOKIE_KEY = 'STUDUINO_MAGNETIC_OFFSET';
  private STUDUINO_MAGNETIC_SCALE = 'STUDUINO_MAGNETIC_SCALE';

  constructor(studuinoBit: StuduinoBit, icm20948: StuduinoBitICM20948, fs: string = "2g", sf: string = "ms2") {
    this.studuinoBit = studuinoBit
    this._icm20948 = icm20948;

    const offset: string | null = Cookies.get(this.OFFSET_COOKIE_KEY)
    const scale: string | null = Cookies.get(this.STUDUINO_MAGNETIC_SCALE)
    if (offset && scale) {
      try {
        const savedOffset = JSON.parse(offset)
        const savedScale = JSON.parse(scale)
        this.offset = savedOffset
        this.scale = savedScale
        this.calibrated = true;
      } catch(e) {

      }
    }
  }

  public async getXWait(): Promise<number> {
    return (await this.getValuesWait())[0]
  }

  public async getYWait(): Promise<number> {
    return (await this.getValuesWait())[1]
  }

  public async getZWait(): Promise<number> {
    return (await this.getValuesWait())[2]
  }

  public async getValuesWait(): Promise<number[]> {
    const mag = await this._icm20948.magneticWait();
    if (mag.length !== 3) {
      throw new Error('Invalid format of magnetic');
    }
    let ret = [0, 0, 0];
    for (let i = 0; i < mag.length; i++) {
      ret[i] = (mag[i] - this.offset[i]) * this.scale[i];
    }
    return ret;
  }

  public async calibrateWait() {
    // const ret = await this._icm20948.calibrateWait(); // want to use display
  
    this.offset = [0, 0, 0];
    this.scale = [1, 1, 1];

    let reading = await this._icm20948.magneticWait();
    let minx = reading[0]; let maxx = reading[0];
    let miny = reading[1]; let maxy = reading[1];
    let minz = reading[2]; let maxz = reading[2];

    const display = this.studuinoBit.display!
    display.on();
    display.clear();
    let count = 0;
    let x = 0;
    let y = 0;
    let z = 0;

    while (count < 16) {
      if (display.getPixel(0, 0) === [0, 0, 10]) {
        display.setPixel(x, y, [0, 0, 0])
      }
      display.off();
      await this.studuinoBit.wait(10);
      const [ax, ay, az] = await this.studuinoBit.accelerometer!.getValuesWait();
      x = (ax + 8) / 4
      y = (ay + 8) / 4
      x = Math.round(Math.min(Math.max(x, 0), 4))
      y = Math.round(Math.min(Math.max(y, 0), 4))

      if (x==0 || x==4 || y==0 || y==4) {
        if (display.getPixel(x, y)[0] + display.getPixel(x, y)[1] + display.getPixel(x, y)[2] === 0) {
          display.setPixel(x, y, [0x0a, 0, 0x0a]);
          reading = await this._icm20948.magneticWait();
          minx = Math.min(minx, reading[0]);
          maxx = Math.max(maxx, reading[0]);
          miny = Math.min(miny, reading[1]);
          maxy = Math.max(maxy, reading[1]);
          minz = Math.min(minz, reading[2]);
          maxz = Math.max(maxz, reading[2]);
          display.setPixel(x, y, [0x0a, 0, 0]);
          count++;
        }
      } else {
        display.setPixel(x, y, [0, 0, 0x0a]);
      }
      display.on();
      await this.studuinoBit.wait(100);
    }

    // Hard iron correction
    const offset_x = (maxx + minx) / 2;
    const offset_y = (maxy + miny) / 2;
    const offset_z = (maxz + minz) / 2;

    this.offset = [offset_x, offset_y, offset_z];

    // Soft iron correction
    const avg_delta_x = (maxx - minx) / 2;
    const avg_delta_y = (maxy - miny) / 2;
    const avg_delta_z = (maxz - minz) / 2;

    const avg_delta = (avg_delta_x + avg_delta_y + avg_delta_z) / 3;

    const scale_x = avg_delta / avg_delta_x;
    const scale_y = avg_delta / avg_delta_y;
    const scale_z = avg_delta / avg_delta_z;

    this.scale = [scale_x, scale_y, scale_z];

    Cookies.set(this.OFFSET_COOKIE_KEY, JSON.stringify(this.offset))
    Cookies.set(this.STUDUINO_MAGNETIC_SCALE, JSON.stringify(this.scale))

    this.calibrated = true;

    display.clear()
    display.off();

    return [this.offset, this.scale];
  }

  public isCalibrated() {
    return this.calibrated;
  }

  public clearCalibration() {
    this.offset = [0, 0, 0]
    this.scale = [1, 1, 1]
    Cookies.clear(this.OFFSET_COOKIE_KEY);
    Cookies.clear(this.STUDUINO_MAGNETIC_SCALE);
  }

  public async headingWait() {
    if (!this.calibrated) {
      await this.calibrateWait();
    }

    const [ax, ay, az] = await this.studuinoBit.accelerometer!.getValuesWait();
    let [mx, my, mz] = await this.getValuesWait();

    my *= -1;
    mz *= -1;

    const phi = Math.atan(ay/az);
    const psi = Math.atan(-1 * ax / (ay * Math.sin(phi) + az * Math.cos(phi)));
    const theta = Math.atan((mz * Math.sin(phi) - my * Math.cos(phi)) / (mx * Math.cos(psi) + my * Math.sin(psi) * Math.sin(phi) + mz * Math.sin(psi) * Math.cos(phi)))
    const deg = theta * 180 / Math.PI;
    let offset;
    if (mx < 0) {
      offset = -90;
    } else {
      offset = +90;
    }
    return (deg + offset + 360) % 360;
  }
}
