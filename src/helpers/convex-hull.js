import getBoxData from './bounding-box.js';
import ConvexHullFN from './convex-hull-algorithm.js';

var createClockwiseHullFromElements = function (/*dom elements*/) {
	var convexHull = new ConvexHullFN();
	var i = arguments.length
	while (i--) {
		var elem = arguments[i]
		if (!(elem instanceof HTMLElement)) {
			if (console && console.warn) {
				console.warn('Only HTMLElements can be used a points not:')
				console.warn(elem)
			}
			continue
		}
		var boxData = getBoxData(elem)
		convexHull.addPoint(boxData.right, boxData.top)
		convexHull.addPoint(boxData.right, boxData.bottom)
		convexHull.addPoint(boxData.left,  boxData.top)
		convexHull.addPoint(boxData.left,  boxData.bottom)
	}

	var linesInClockwiseOrder = convexHull.getHull();
	linesInClockwiseOrder.push(linesInClockwiseOrder[0])

	return linesInClockwiseOrder
}

var isLeftSideOfLine = function (linePointA, linePointB, point) {
	// position = sign((Bx - Ax) * (Y - Ay) - (By - Ay) * (X - Ax))
	var lineSide = Math.sign((linePointB.x - linePointA.x) * (point.y - linePointA.y) - (linePointB.y - linePointA.y) * (point.x - linePointA.x))
	return lineSide >= 0;
}

var isInsideElement = function (elem, event) {
	var mX = event.x;
	var mY = event.y;
	var boxData = getBoxData(elem);

	var aL = boxData.left;
	var aR = aL + boxData.width;
	var aT = boxData.top;
	var aB = aT + boxData.height;

	var isOutside = false;
	if (
		(mX < aL || mX > aR || mY < aT || mY > aB)
	) {
		isOutside = true;
	}

	return !isOutside
}

var buildHull = function (/*dom elements*/) {
	var hullElements = arguments;
	var conjoinedHull = createClockwiseHullFromElements.apply(this, hullElements)

	var isInsideHull = function (hull, event) {
		var isInside = false;

		var i = hull.length-1
		while (i--) {
			isInside = isLeftSideOfLine(hull[i], hull[i+1], event)
			if (!isInside) {
				break
			}
		}

		return isInside
	}

	var isInsideElements = function (event) {
		return isInsideHull(conjoinedHull, event)
	}

	var isBetweenElements = function (event) {
		var isBetweenAll = false;
		if (isInsideElements(event)) {
			isBetweenAll = true;
			var i = hullElements.length
			while (i--) {
				isBetweenAll = !isInsideElement(hullElements[i], event)
				if (!isBetweenAll) break
			}
		}

		return isBetweenAll
	}

	return {
		isBetweenElements: isBetweenElements,
		isInsideElements:  isInsideElements
	}
}

export default {
	isInsideElement: isInsideElement,
	buildHull: buildHull
};
