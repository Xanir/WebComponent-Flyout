import getBoxData from './bounding-box';
import type { BoxData } from './bounding-box';

interface AxisPredicates {
	my: string;
	its: string;
}

interface PositionPredicates {
	horizontal: AxisPredicates;
	vertical:   AxisPredicates;
}

interface FlyoutPositionOptions {
	alignMy?: string | null;
	alignTo?: string | null;
}

interface PositionUpdate {
	element: HTMLElement;
	top:  string;
	left: string;
}

const extractElemPostion = function(
	alignMyAttr: string | null | undefined,
	alignToAttr: string | null | undefined
): PositionPredicates | null {
	if (!alignMyAttr || !alignToAttr) return null;

	const alignMyArray = alignMyAttr.split(' ');
	if (alignMyArray.length !== 2) return null;

	const alignToArray = alignToAttr.split(' ');
	if (alignToArray.length !== 2) return null;

	return {
		horizontal: {
			my:  alignMyArray[1],
			its: alignToArray[1],
		},
		vertical: {
			my:  alignMyArray[0],
			its: alignToArray[0],
		},
	};
};

const getLeftPos = function(hPos: AxisPredicates, flyoutContainerPos: BoxData, flyoutAnchorElemPos: BoxData): string {
	let elemLeft: string | number = 0;
	if (hPos.my === 'center') {
		if (hPos.its === 'center') {
			elemLeft = (flyoutAnchorElemPos.left + (flyoutAnchorElemPos.width / 2) - (flyoutContainerPos.width / 2)) + 'px';
		} else if (hPos.its === 'left') {
			elemLeft = (flyoutAnchorElemPos.left + flyoutAnchorElemPos.width / 2) + 'px';
		} else if (hPos.its === 'right') {
			elemLeft = (flyoutAnchorElemPos.left + flyoutAnchorElemPos.width / 2) + 'px';
		}
	} else if (hPos.my === 'left') {
		if (hPos.its === 'center') {
			elemLeft = (flyoutAnchorElemPos.left + flyoutAnchorElemPos.width / 2) + 'px';
		} else if (hPos.its === 'left') {
			elemLeft = flyoutAnchorElemPos.left + 'px';
		} else if (hPos.its === 'right') {
			elemLeft = (flyoutAnchorElemPos.left + flyoutAnchorElemPos.width) + 'px';
		}
	} else if (hPos.my === 'right') {
		if (hPos.its === 'center') {
			elemLeft = (flyoutAnchorElemPos.left - flyoutAnchorElemPos.width / 2) + 'px';
		} else if (hPos.its === 'left') {
			elemLeft = (flyoutAnchorElemPos.left - flyoutContainerPos.width) + 'px';
		} else if (hPos.its === 'right') {
			elemLeft = (flyoutAnchorElemPos.left - flyoutContainerPos.width + flyoutAnchorElemPos.width) + 'px';
		}
	}
	return String(elemLeft);
};

const getTopPos = function(vPos: AxisPredicates, flyoutContainerPos: BoxData, flyoutAnchorElemPos: BoxData): string {
	let elemTop: string | number = 0;
	if (vPos.my === 'center') {
		if (vPos.its === 'center') {
			elemTop = (flyoutAnchorElemPos.top + flyoutAnchorElemPos.height / 2 - flyoutContainerPos.height / 2) + 'px';
		} else if (vPos.its === 'top') {
			elemTop = (flyoutAnchorElemPos.top - flyoutContainerPos.height) + 'px';
		} else if (vPos.its === 'bottom') {
			elemTop = (flyoutAnchorElemPos.top + flyoutAnchorElemPos.height - flyoutContainerPos.height / 2) + 'px';
		}
	} else if (vPos.my === 'top') {
		if (vPos.its === 'center') {
			elemTop = (flyoutAnchorElemPos.top + flyoutAnchorElemPos.height / 2) + 'px';
		} else if (vPos.its === 'top') {
			elemTop = flyoutAnchorElemPos.top + 'px';
		} else if (vPos.its === 'bottom') {
			elemTop = (flyoutAnchorElemPos.top + flyoutAnchorElemPos.height) + 'px';
		}
	} else if (vPos.my === 'bottom') {
		if (vPos.its === 'center') {
			elemTop = (flyoutAnchorElemPos.top + flyoutAnchorElemPos.height / 2 - flyoutContainerPos.height / 2) + 'px';
		} else if (vPos.its === 'top') {
			elemTop = (flyoutAnchorElemPos.top - flyoutContainerPos.height) + 'px';
		} else if (vPos.its === 'bottom') {
			elemTop = (flyoutAnchorElemPos.top - flyoutContainerPos.height + flyoutAnchorElemPos.height) + 'px';
		}
	}
	return String(elemTop);
};

const flyoutPositionUpdates: PositionUpdate[] = [];
let isAwaitingUpdate = false;

const updateLivePositions = function(): void {
	isAwaitingUpdate = false;
	while (flyoutPositionUpdates.length) {
		const flyoutUpdate = flyoutPositionUpdates.pop()!;
		flyoutUpdate.element.style.left = flyoutUpdate.left;
		flyoutUpdate.element.style.top  = flyoutUpdate.top;
		flyoutUpdate.element.style.visibility = 'visible';
	}
};

const processUpdates = function(): void {
	isAwaitingUpdate = true;
	window.requestAnimationFrame(updateLivePositions);
};

const positionUpdate = function(flyoutElem: HTMLElement, anchorElem: HTMLElement, predicates: FlyoutPositionOptions): void {
	const positioning = extractElemPostion(predicates.alignMy, predicates.alignTo);
	if (positioning) {
		const anchorElemPos  = getBoxData(anchorElem);
		const flyoutElemPos  = getBoxData(flyoutElem);

		const elemLeft = getLeftPos(positioning.horizontal, flyoutElemPos, anchorElemPos);
		const elemTop  = getTopPos(positioning.vertical,   flyoutElemPos, anchorElemPos);

		flyoutPositionUpdates.push({
			element: flyoutElem,
			top:  elemTop,
			left: elemLeft,
		});
		if (!isAwaitingUpdate && flyoutPositionUpdates.length) {
			processUpdates();
		}
	}
};

export default positionUpdate;
