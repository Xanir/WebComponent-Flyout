/**
 * Graham's Scan Convex Hull Algorithm
 * @desc An implementation of the Graham's Scan Convex Hull algorithm in JavaScript.
 * @author Brian Barnett, brian@3kb.co.uk, http://brianbar.net/ || http://3kb.co.uk/
 * @version 1.0.5
 */

export interface Point {
	x: number;
	y: number;
}

class ConvexHullGrahamScan {
	private anchorPoint: Point | undefined = undefined;
	private reverse: boolean = false;
	private points: Point[] = [];

	private static createPoint(x: number, y: number): Point {
		return { x, y };
	}

	private _findPolarAngle(a: Point | undefined, b: Point | undefined): number {
		const ONE_RADIAN = 57.295779513082;

		if (!a || !b) return 0;

		const deltaX = b.x - a.x;
		const deltaY = b.y - a.y;

		if (deltaX === 0 && deltaY === 0) return 0;

		let angle = Math.atan2(deltaY, deltaX) * ONE_RADIAN;

		if (this.reverse) {
			if (angle <= 0) angle += 360;
		} else {
			if (angle >= 0) angle += 360;
		}

		return angle;
	}

	addPoint(x: number, y: number): void {
		const newAnchor =
			this.anchorPoint === undefined ||
			this.anchorPoint.y > y ||
			(this.anchorPoint.y === y && this.anchorPoint.x > x);

		if (newAnchor) {
			if (this.anchorPoint !== undefined) {
				this.points.push(ConvexHullGrahamScan.createPoint(this.anchorPoint.x, this.anchorPoint.y));
			}
			this.anchorPoint = ConvexHullGrahamScan.createPoint(x, y);
		} else {
			this.points.push(ConvexHullGrahamScan.createPoint(x, y));
		}
	}

	private _sortPoints(): Point[] {
		return this.points.sort((a, b) => {
			const polarA = this._findPolarAngle(this.anchorPoint, a);
			const polarB = this._findPolarAngle(this.anchorPoint, b);

			if (polarA < polarB) return -1;
			if (polarA > polarB) return 1;
			return 0;
		});
	}

	private _checkPoints(p0: Point, p1: Point, p2: Point): boolean {
		const cwAngle  = this._findPolarAngle(p0, p1);
		const ccwAngle = this._findPolarAngle(p0, p2);

		if (cwAngle > ccwAngle) {
			return !((cwAngle - ccwAngle) > 180);
		} else if (cwAngle < ccwAngle) {
			return (ccwAngle - cwAngle) > 180;
		}

		return true;
	}

	getHull(): Point[] {
		this.reverse = this.points.every(point => point.x < 0 && point.y < 0);

		let points = this._sortPoints();
		let pointsLength = points.length;

		if (pointsLength < 3) {
			points.unshift(this.anchorPoint!);
			return points;
		}

		let hullPoints: Point[] = [];
		hullPoints.push(points.shift()!, points.shift()!);

		while (true) {
			hullPoints.push(points.shift()!);

			const p0 = hullPoints[hullPoints.length - 3];
			const p1 = hullPoints[hullPoints.length - 2];
			const p2 = hullPoints[hullPoints.length - 1];

			if (this._checkPoints(p0, p1, p2)) {
				hullPoints.splice(hullPoints.length - 2, 1);
			}

			if (points.length === 0) {
				if (pointsLength === hullPoints.length) {
					const ap = this.anchorPoint!;
					hullPoints = hullPoints.filter(p => !!p);
					if (!hullPoints.some(p => p.x === ap.x && p.y === ap.y)) {
						hullPoints.unshift(this.anchorPoint!);
					}
					return hullPoints;
				}
				points = hullPoints;
				pointsLength = points.length;
				hullPoints = [];
				hullPoints.push(points.shift()!, points.shift()!);
			}
		}
	}
}

export default ConvexHullGrahamScan;
