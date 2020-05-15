import { ArtecRoboI2CParts } from './i2cParts'
import { ArtecRobo, ArtecRoboPort } from "../index";

export class ArtecRoboColorSensor extends ArtecRoboI2CParts  {

  private ColorSensorConfig: { [key: string]: any } = {
    I2C_ADDR: 0x36,
    GET_COLOR_RGB: 0x63,
    LED_ENABLE_R: 0x52,
    LED_ENABLE_G: 0x47,
    LED_ENABLE_B: 0x42,
    LED_DISABLE: 0x44,

    // Color code
    COLOR_UNDEF: 0,
    COLOR_RED: 1,
    COLOR_GREEN: 2,
    COLOR_BLUE: 3,
    COLOR_WHITE: 4,
    COLOR_YELLOW: 5,
    COLOR_ORANGE: 6,
    COLOR_PURPLE: 7,

    // for Artec Block

    LOST_THRESHOLD: 25,  //  8bit
    MIN_X_RED: 0.37,
    MAX_X_RED: 0.48,
    MIN_Y_RED: 0.28,
    MAX_Y_RED: 0.36,
    MIN_X_GREEN: 0.23,
    MAX_X_GREEN: 0.33,
    MIN_Y_GREEN: 0.35,
    MAX_Y_GREEN: 0.46,
    MIN_X_BLUE: 0.20,
    MAX_X_BLUE: 0.31,
    MIN_Y_BLUE: 0.20,
    MAX_Y_BLUE: 0.28,
    MIN_X_WHITE: 0.30,
    MAX_X_WHITE: 0.37,

    MIN_Y_WHITE: 0.30,
    MAX_Y_WHITE: 0.35,
    MIN_X_YELLOW: 0.34,
    MAX_X_YELLOW: 0.47,
    MIN_Y_YELLOW: 0.36,
    MAX_Y_YELLOW: 0.45,
    MIN_X_ORANGE: 0.44,
    MAX_X_ORANGE: 0.55,
    MIN_Y_ORANGE: 0.33,
    MAX_Y_ORANGE: 0.38,
    MIN_X_PURPLE: 0.22,
    MAX_X_PURPLE: 0.31,
    MIN_Y_PURPLE: 0.28,
    MAX_Y_PURPLE: 0.32,
  };

  private __addr: number;
  private i2c0: any;

  private red: number = 0;
  private green: number = 0;
  private blue: number = 0;
  private luminance: number = 0;

  private x: number = 0;
  private y: number = 0;

  constructor(artecRobo: ArtecRobo) {
    super(artecRobo);
    this.__addr = this.ColorSensorConfig.I2C_ADDR;
    this.i2c0 = artecRobo.studuinoBit.obniz.i2c0;
    this.i2c0.start({mode: "master", sda: 21, scl: 22, clock: 400000});
  }

  public async getValuesWait() {
    this.i2c0.write(this.__addr, [this.ColorSensorConfig.GET_COLOR_RGB]);
    let readingdata = await this.i2c0.readWait(this.__addr, 4);

    if (readingdata.length) {
      this.red = readingdata[0];
      this.green = readingdata[1];
      this.blue = readingdata[2];
      this.luminance = readingdata[3];
      return readingdata;
    } else {
      throw new Error("ColorSensorConfig can't get valid values");
    }
  }

  public async getColorCodeWait() {
    await this.getValuesWait();
    await this.__calcXyCode();

    if (this.red <= this.ColorSensorConfig.LOST_THRESHOLD && this.green <= this.ColorSensorConfig.LOST_THRESHOLD && this.blue <= this.ColorSensorConfig.LOST_THRESHOLD) {
      return this.ColorSensorConfig.COLOR_UNDEF
    }
    if (this.x >= this.ColorSensorConfig.MIN_X_RED && this.x <= this.ColorSensorConfig.MAX_X_RED && this.y >= this.ColorSensorConfig.MIN_Y_RED && this.y <= this.ColorSensorConfig.MAX_Y_RED) {
      return this.ColorSensorConfig.COLOR_RED
    }
    if (this.x >= this.ColorSensorConfig.MIN_X_GREEN && this.x <= this.ColorSensorConfig.MAX_X_GREEN && this.y >= this.ColorSensorConfig.MIN_Y_GREEN && this.y <= this.ColorSensorConfig.MAX_Y_GREEN) {
      return this.ColorSensorConfig.COLOR_GREEN
    }
    if (this.x >= this.ColorSensorConfig.MIN_X_BLUE && this.x <= this.ColorSensorConfig.MAX_X_BLUE && this.y >= this.ColorSensorConfig.MIN_Y_BLUE && this.y <= this.ColorSensorConfig.MAX_Y_BLUE) {
      return this.ColorSensorConfig.COLOR_BLUE
    }
    if (this.x >= this.ColorSensorConfig.MIN_X_WHITE && this.x <= this.ColorSensorConfig.MAX_X_WHITE && this.y >= this.ColorSensorConfig.MIN_Y_WHITE && this.y <= this.ColorSensorConfig.MAX_Y_WHITE) {
      return this.ColorSensorConfig.COLOR_WHITE
    }
    if (this.x >= this.ColorSensorConfig.MIN_X_YELLOW && this.x <= this.ColorSensorConfig.MAX_X_YELLOW && this.y >= this.ColorSensorConfig.MIN_Y_YELLOW && this.y <= this.ColorSensorConfig.MAX_Y_YELLOW) {
      return this.ColorSensorConfig.COLOR_YELLOW
    }
    if (this.x >= this.ColorSensorConfig.MIN_X_ORANGE && this.x <= this.ColorSensorConfig.MAX_X_ORANGE && this.y >= this.ColorSensorConfig.MIN_Y_ORANGE && this.y <= this.ColorSensorConfig.MAX_Y_ORANGE) {
      return this.ColorSensorConfig.COLOR_ORANGE
    }
    if (this.x >= this.ColorSensorConfig.MIN_X_PURPLE && this.x <= this.ColorSensorConfig.MAX_X_PURPLE && this.y >= this.ColorSensorConfig.MIN_Y_PURPLE && this.y <= this.ColorSensorConfig.MAX_Y_PURPLE) {
      return this.ColorSensorConfig.COLOR_PURPLE
    }

    return this.ColorSensorConfig.COLOR_UNDEF
  }

  public async __calcXyCode() {
    const X = (0.576669) * this.red + (0.185558) * this.green + (0.188229) * this.blue;
    const Y = (0.297345) * this.red + (0.627364) * this.green + (0.075291) * this.blue;
    const Z = (0.027031) * this.red + (0.070689) * this.green + (0.991338) * this.blue;
    this.x = X / (X + Y + Z);
    this.y = Y / (X + Y + Z);
  }
}