import { ArtecRobo } from "../index";
import { I2CPin } from "../pin/i2cPin";

export class ArtecRoboI2CParts {

  protected _i2cPin: I2CPin;

  constructor(artecRobo: ArtecRobo) {
    this._i2cPin = artecRobo.i2c!;
  }

}
