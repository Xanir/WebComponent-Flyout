import getBoxData from './bounding-box';
import ConvexHullFN from './convex-hull-algorithm';
import type { Point } from './convex-hull-algorithm';

export interface HullResult {
	isBetweenElements: (event: MouseEvent) => boolean;
	isInsideElements:  (event: MouseEvent) => boolean;
}

const createClockwiseHullFromElements = function(...elements: HTMLElement[]): Point[] {
	const convexHull = new ConvexHullFN();
	let i = elements.length;
	while (i--) {
		const elem = elements[i];
		const boxData = getBoxData(elem);
		convexHull.addPoint(boxData.right, boxData.top);
		convexHull.addPoint(boxData.right, boxData.bottom);
		convexHull.addPoint(boxData.left,  boxData.top);
		convexHull.addPoint(boxData.left,  boxData.bottom);
	}

	const linesInClockwiseOrder = convexHull.getHull();
	linesInClockwiseOrder.push(linesInClockwiseOrder[0]);

	return linesInClockwiseOrder;
};

const isLeftSideOfLine = function(linePointA: Point, linePointB: Point, point: Point): boolean {
	const lineSide = Math.sign(
		(linePointB.x - linePointA.x) * (point.y - linePointA.y) -
		(linePointB.y - linePointA.y) * (point.x - linePointA.x)
	);
	return lineSide >= 0;
};

const isInsideElement = function(elem: HTMLElement, event: MouseEvent): boolean {
	const mX = event.x;
	const mY = event.y;
	const boxData = getBoxData(elem);

	const aL = boxData.left;
	const aR = aL + boxData.width;
	const aT = boxData.top;
	const aB = aT + boxData.height;

	return !(mX < aL || mX > aR || mY < aT || mY > aB);
};

const buildHull = function(...elements: HTMLElement[]): HullResult {
	const hullElements = elements;
	const conjoinedHull = createClockwiseHullFromElements(...hullElements);

	const isInsideHull = function(hull: Point[], event: MouseEvent): boolean {
		let isInside = false;
		let i = hull.length - 1;
		while (i--) {
			isInside = isLeftSideOfLine(hull[i], hull[i + 1], event as unknown as Point);
			if (!isInside) break;
		}
		return isInside;
	};

	const isInsideElements = function(event: MouseEvent): boolean {
		return isInsideHull(conjoinedHull, event);
	};

	const isBetweenElements = function(event: MouseEvent): boolean {
		let isBetweenAll = false;
		if (isInsideElements(event)) {
			isBetweenAll = true;
			let i = hullElements.length;
			while (i--) {
				isBetweenAll = !isInsideElement(hullElements[i], event);
				if (!isBetweenAll) break;
			}
		}
		return isBetweenAll;
	};

	return {
		isBetweenElements,
		isInsideElements,
	};
};

export default {
	isInsideElement,
	buildHull,
};
