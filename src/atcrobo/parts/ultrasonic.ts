import { StuduinoBitAnalogPin, StuduinoBitDigitalPin } from "../../stubit/terminal";
import { ArtecRoboInputParts } from "./inputParts";
import { ArtecRobo, ArtecRoboPort } from "../index";
import { InPin } from "../pin/inPin";

export type InputPinString = "P0" | "P1" | "P2";

export class ArtecRoboUltrasonicSensor extends ArtecRoboInputParts {

  private _obnizLogicAnalyzer: any;
  private _obnizIoObj: any;
  private _obnizAdObj: any;

  constructor(artecRobo: ArtecRobo, inPin: InPin | InputPinString) {
    if (typeof inPin === "string") {
      if (!(inPin === "P0" || inPin === "P1")) {
        throw new Error(`This parts can connect only 'P0','P1'`)
      }
    }
    super(artecRobo, inPin);
    this._obnizLogicAnalyzer = artecRobo.studuinoBit.obniz.logicAnalyzer;
    this._obnizIoObj = artecRobo.studuinoBit.obniz.getIO(this._inPin.terminalPin.pin);
    this._obnizAdObj = artecRobo.studuinoBit.obniz.getAD(this._inPin.terminalPin.pin);
  }

  public async getDistance() {
    console.log("wip: UltrasonicSensor.getDistance")

    this._obnizAdObj.start(function (voltage: number) {
      console.log("voltage:", voltage)
    })

    this._obnizLogicAnalyzer.start({ io: this._inPin.terminalPin.pin, interval: 1, duration: 1000 })
    
    this._obnizIoObj.pull('pull-down')
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 100)
    })
    this._obnizIoObj.pull('3v')
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 100)
    })
    this._obnizIoObj.pull('pull-down')

    this._obnizLogicAnalyzer.onmeasured = function(arr: any) {
      console.log("logicAnalyzer onmeasured")
      console.log(arr)
    }
  }
}