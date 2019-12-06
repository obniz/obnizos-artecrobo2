import { StuduinoBitICM20948 } from "./icm20948";
import { Cookies } from '../common'

export class StuduinoBitCompass {
  private _icm20948: StuduinoBitICM20948;

  constructor(icm20948: StuduinoBitICM20948, fs: string = "2g", sf: string = "ms2") {
    this._icm20948 = icm20948;
  }

  public async getXWait(ndigits: number = 2): Promise<number> {
    const d = Math.pow(10, ndigits);
    return Math.round((await this._icm20948.accelerationWait())[0] * d) / d;
  }

  public async getYWait(ndigits: number = 2): Promise<number> {
    const d = Math.pow(10, ndigits);
    return Math.round((await this._icm20948.accelerationWait())[1] * d) / d;
  }

  public async getZWait(ndigits: number = 2): Promise<number> {
    const d = Math.pow(10, ndigits);
    return Math.round((await this._icm20948.accelerationWait())[2] * d) / d;
  }

  public async getValuesWait(ndigits: number = 2): Promise<number[]> {
    const d = Math.pow(10, ndigits);
    const values = (await this._icm20948.accelerationWait());
    return values.map((e) => Math.round(e * d) / d);
  }

  public async calibrateWait(ndigits: number = 2) {
    Cookies.get('a')
    // https://www.aichi-mi.com/home/%E9%9B%BB%E5%AD%90%E3%82%B3%E3%83%B3%E3%83%91%E3%82%B9/%E3%82%B3%E3%83%B3%E3%83%91%E3%82%B9%E3%81%AE%E8%BC%83%E6%AD%A3%E3%82%BD%E3%83%95%E3%83%88%E3%81%AE%E5%8E%9F%E7%90%86/

//     global CONFIG_FILE, MAGNETIC_OFFSET, MAGNETIC_OFFSET


//     from.dsply import StuduinoBitDisplay
//     display = StuduinoBitDisplay()

//     self._offset = (0, 0, 0)
//     self._scale = (1, 1, 1)

//     reading = self.get_values()
//     minx = maxx = reading[0]
//     miny = maxy = reading[1]
//     minz = maxz = reading[2]

//     #display.scroll('Fill Dispry with Blue')

//     display.clear()
//     count = 0
//     x = 0
//     y = 0
//     while True:
//       if (display.get_pixel(x, y) == (0, 0, 10)):
//         display.set_pixel(x, y, 0)
//     ax, ay, az = self._icm20948.acceleration
//     x = (ax + 8) / 4 + 0.5
//     y = (ay + 8) / 4 + 0.5
//     x = int(min(max(x, 0), 4))
//     y = int(min(max(y, 0), 4))

//     if x == 0 or x == 4 or y == 0 or y == 4:
//     if display.get_pixel(x, y) == (0, 0, 0):
//       display.set_pixel(x, y, 0x0a000a)
//     reading = self.get_values()
//     minx = min(minx, reading[0])
//     maxx = max(maxx, reading[0])
//     miny = min(miny, reading[1])
//     maxy = max(maxy, reading[1])
//     minz = min(minz, reading[2])
//     maxz = max(maxz, reading[2])
//     display.set_pixel(x, y, 0x0a0000)
//     count += 1
//       else:
//     display.set_pixel(x, y, 0x00000a)


// if (count == 16):
//   break

// sleep_ms(100)

// # Hard iron correction
// offset_x = (maxx + minx) / 2
// offset_y = (maxy + miny) / 2
// offset_z = (maxz + minz) / 2

// self._offset = (offset_x, offset_y, offset_z)

// # Soft iron correction
// avg_delta_x = (maxx - minx) / 2
// avg_delta_y = (maxy - miny) / 2
// avg_delta_z = (maxz - minz) / 2

// avg_delta = (avg_delta_x + avg_delta_y + avg_delta_z) / 3

// scale_x = avg_delta / avg_delta_x
// scale_y = avg_delta / avg_delta_y
// scale_z = avg_delta / avg_delta_z

// self._scale = (scale_x, scale_y, scale_z)

// # Output config.json file
// self._set_configureValue(MAGNETIC_OFFSET, self._offset)
// self._set_configureValue(MAGNETIC_SCALE, self._scale)

// self._calibrated = True

// display.clear()

// return self._offset, self._scale
//   }

//   public async isCalibratedWait(): Promise<boolean> {
//     return false;
//   }

//   public async clearCalibrationWait(): Promise<boolean> {
//     return false;
//   }

//   public async headingWait(): Promise<number> {
//     return 0;
//   }

//   public async getFieldStrength(): Promise<number> {
//     return 0;
  }
}
