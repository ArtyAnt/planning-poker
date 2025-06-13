import {Coordinate} from "../models/coordinate"

export class CoordinateCalculator {
    calculateCoordinate(userAmount: number): Coordinate[] {
        const a = userAmount <= 4 ? 200 :
            userAmount >= 8 ? 400 :
                200 + (userAmount - 4) * 50;

        const b = 200;

        const result: Coordinate[] = [];

        const angleStep = 360 / userAmount;
        let currentAngle = 0;

        for (let i = 0; i < userAmount; i++) {
            result.push({
                x: a * Math.cos(this.angleToRadians(currentAngle)),
                y: b * Math.sin(this.angleToRadians(currentAngle))
            });

            currentAngle += angleStep;
        }

        return result;
    }

    private angleToRadians(angle: number) {
        return angle * Math.PI / 180
    }
}
