import { ArtecRobo } from "../index";
import { ArtecRoboI2CParts } from './i2cParts'

export class ArtecRoboAccelerometer extends ArtecRoboI2CParts {

  private addr = 0x1d;
  private artecRobo: ArtecRobo

  private CTRL_REG1 = 0x2A
  private CTRL_REG1_VALUE_ACTIVE = 0x01
  private CTRL_REG1_VALUE_F_READ = 0x02

  private CTRL_REG2 = 0x2B
  private CTRL_REG2_RESET = 0x40

  private PL_STATUS = 0x10
  private PL_CFG = 0x11
  private PL_EN = 0x40

  private XYZ_DATA_CFG = 0x0E
  private MODE_2G = 0x00 //# Set Sensitivity to 2g
  private MODE_4G = 0x01 //# Set Sensitivity to 4g
  private MODE_8G = 0x02 // # Set Sensitivity to 8g

  private FF_MT_CFG = 0x15
  private FF_MT_CFG_ELE = 0x80
  private FF_MT_CFG_OAE = 0x40

  private FF_MT_SRC = 0x16
  private FF_MT_SRC_EA = 0x80

  private PULSE_CFG = 0x21
  private PULSE_CFG_ELE = 0x80

  private PULSE_SRC = 0x22
  private PULSE_SRC_EA = 0x80

  // Sample rate
  private ODR_800 = 0x00
  private ODR_400 = 0x08
  private ODR_200 = 0x10
  private ODR_100 = 0x18
  private ODR_50 = 0x20
  private ODR_12_5 = 0x28
  private ODR_6_25 = 0x30
  private ODR_1_56 = 0x38

  private highres = false
  private stepFactor = 0.0156

  private values = [0, 0, 0]

  constructor(artecRobo: ArtecRobo) {
    super(artecRobo);
    this.artecRobo = artecRobo;
  }

  private async standby() {
    let arr = await this._i2cPin.i2c.readFromMem(this.addr, this.CTRL_REG1, 1);
    this._i2cPin.i2c.writeToMem(this.addr, this.CTRL_REG1, [ arr[0] & ~this.CTRL_REG1_VALUE_ACTIVE]);
  }

  private async activate() {
    let arr = await this._i2cPin.i2c.readFromMem(this.addr, this.CTRL_REG1, 1);
    let fRead = this.CTRL_REG1_VALUE_F_READ;
    if (this.highres) {
      fRead = 0;
    }
    this._i2cPin.i2c.writeToMem(this.addr, this.CTRL_REG1, [arr[0] | this.CTRL_REG1_VALUE_ACTIVE | fRead | this.ODR_100]);
  }

  private async _begin(highres: boolean = false, scale: number = 2) { 
    this.highres = highres;
    if (this.highres) {
      this.stepFactor = 0.0039
    } else {
      this.stepFactor = 0.0156
    }
    if (scale == 4) {
      this.stepFactor *= 2;
    } else if (scale == 8) {
      this.stepFactor *= 4;
    }
    const _ = this._i2cPin.i2c.write(this.addr, [0x0D]);
    // self.wai = self._read_register(0x0D) // used in not used 
    this._i2cPin.i2c.writeToMem(this.addr, this.CTRL_REG2, [this.CTRL_REG2_RESET]);

    // リセット後しばらくは時間が必要。単純に待つ以外にはNAKをかえさなくなるまでloopで待つ方法もある。
    await this.artecRobo.studuinoBit.wait(10);

    await this.standby();

    // # Set Portrait/Landscape mode

    this._i2cPin.i2c.writeToMem(this.addr, this.PL_CFG, [0x80 | this.PL_EN]);
    let mode = [this.MODE_2G];
    if (scale == 4) {
      mode[0] = this.MODE_4G;
    } else if (scale == 8) {
      mode[0] = this.MODE_8G;
    }
    this._i2cPin.i2c.writeToMem(this.addr, this.XYZ_DATA_CFG, mode);
    await this.activate();

  }

  public async configurationWait(highres: boolean = false, scale: number = 2) {
    return this._begin(highres, scale)
  }

  public async getXWait(): Promise<number> {
    await this.update();
    return this.values[0];
  }

  public async getYWait(): Promise<number> {
    await this.update();
    return this.values[1];
  }

  public async getZWait(): Promise<number> {
    await this.update();
    return this.values[2];
  }

  public async getValuesWait(): Promise<number[]> {
    await this.update();
    return this.values;
  }

  private async update() {
   const arr = await this._i2cPin.i2c.readFromMem(this.addr, 0x00, this.highres ? 7 : 4);

   // 0 byte = status
   if (this.highres) { 
     const x = this.si16(arr[1] << 8 + arr[2]);
     const y = this.si16(arr[3] << 8 + arr[4]);
     const z = this.si16(arr[5] << 8 + arr[6]);
     this.values = [
       x / 64 * this.stepFactor,
       y / 64 * this.stepFactor,
       z / 64 * this.stepFactor,
     ]
   } else {
     const x = this.si16(arr[1] << 8);
     const y = this.si16(arr[2] << 8);
     const z = this.si16(arr[3] << 8);
     this.values = [
       x / 256 * this.stepFactor,
       y / 256 * this.stepFactor,
       z / 256 * this.stepFactor,
     ]
   }
  }

  private si16(value: number) : number {
    return -(value & 0x8000) | (value & 0x7fff)
  }

}
