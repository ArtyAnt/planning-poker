import {Coordinate} from "../models/coordinate"


export class CoordinateCalculator {
    constructor(
        private _radius: number) {
    }

    calculateCoordinate(angle: number): Coordinate {
        return {
            x: this._radius * Math.cos(this.angleToRadians(angle)),
            y: this._radius * Math.sin(this.angleToRadians(angle))
        }
    }

    angleToRadians(angle: number) {
        return angle * Math.PI / 180
    }
}