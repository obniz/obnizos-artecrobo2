import {I2CPin} from "./i2cPin";
import {InPin} from "./inPin";
import {MotorPin} from "./motorPin";
import {OutPin} from "./outPin";

export type Pin = OutPin | InPin | MotorPin | I2CPin;
