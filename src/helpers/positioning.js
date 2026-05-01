// Position to Anchor Element

import getBoxData from './bounding-box.js';

/**
	@param alignMyAttr [string] String to parse to get anchor point for flyout element.
	@param alignToAttr [string] String to parse to get anchor point for anchor element.
	Extracts the text predicate used for positioning.
	@return {
		horizontal: {
			my: myHorizontalPredicate,
			its: itsHorizontalPredicate
		},
		vertical: {
			my: myVerticalPredicate,
			its: itsVerticalPredicate
		}
	}
**/
const extractElemPostion = function(alignMyAttr, alignToAttr) {
	var result = null;
	if (alignMyAttr) {
		if (alignToAttr) {
			var alignMyArray = alignMyAttr.split(' ');
			if (alignMyArray.length !== 2) {return;}

			var myVerticalPredicate   = alignMyArray[0];
			var myHorizontalPredicate = alignMyArray[1];

			var alignToArray = alignToAttr.split(' ');
			if (alignToArray.length !== 2) {return;}

			var itsVerticalPredicate   = alignToArray[0];
			var itsHorizontalPredicate = alignToArray[1];

			result = {
				horizontal: {
					my: myHorizontalPredicate,
					its: itsHorizontalPredicate
				},
				vertical: {
					my: myVerticalPredicate,
					its: itsVerticalPredicate
				}
			};
		}
	}

	return result;
};


/**
	@param hPos [obj] Horizontal predicates
	@param flyoutContainerPos [BoxData]
	@param flyoutAnchorElemPos [BoxData]
	@return [int] pixels the container element should be left of the window edge
**/
const getLeftPos = function(hPos, flyoutContainerPos, flyoutAnchorElemPos) {
	var elemLeft = 0;
	if (hPos.my === 'center') {
		if (hPos.its === 'center') {
			elemLeft = (flyoutAnchorElemPos.left + (flyoutAnchorElemPos.width / 2) - (flyoutContainerPos.width / 2)) + 'px'
		} else if (hPos.its === 'left') {
			elemLeft = (flyoutAnchorElemPos.left + flyoutAnchorElemPos.width / 2) + 'px';
		} else if (hPos.its === 'right') {
			elemLeft = (flyoutAnchorElemPos.left + flyoutAnchorElemPos.width / 2) + 'px';
		}
	} else if (hPos.my === 'left') {
		if (hPos.its === 'center') {
			elemLeft = (flyoutAnchorElemPos.left + flyoutAnchorElemPos.width / 2) + 'px';
		} else if (hPos.its === 'left') {
			elemLeft = (flyoutAnchorElemPos.left) + 'px';
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

	return elemLeft;
};

/**
	@param hPos [obj] Vertical predicates
	@param flyoutContainerPos [BoxData]
	@param flyoutAnchorElemPos [BoxData]
	@return [int] pixels the container element should be below the window edge
**/
const getTopPos = function(vPos, flyoutContainerPos, flyoutAnchorElemPos) {
	var elemTop = 0;
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
			elemTop = (flyoutAnchorElemPos.top) + 'px';
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

	return elemTop;
};

const flyoutPositionUpdates = [];
let isAwaitingUpdate = false;

const updateLivePositions = function() {
	isAwaitingUpdate = false;
	while (flyoutPositionUpdates.length) {
		const flyoutUpdate = flyoutPositionUpdates.pop();

		flyoutUpdate.element.style.left = flyoutUpdate.left;
		flyoutUpdate.element.style.top = flyoutUpdate.top;
		flyoutUpdate.element.style.visibility = 'visible';
	}
}

const processUpdates = function() {
	isAwaitingUpdate = true;
	window.requestAnimationFrame(updateLivePositions);
}

const positionUpdate = function(flyoutElem, anchorElem, predicates) {
	var positioning = extractElemPostion(predicates.alignMy, predicates.alignTo);
	if (positioning) {
		var anchorElemPos = getBoxData(anchorElem);
		var flyoutElemPos = getBoxData(flyoutElem);

		var elemLeft = getLeftPos(positioning.horizontal, flyoutElemPos, anchorElemPos);
		var elemTop = getTopPos(positioning.vertical, flyoutElemPos, anchorElemPos);

		flyoutPositionUpdates.push({
			element: flyoutElem,
			top: elemTop,
			left: elemLeft,
		})
		if ( !isAwaitingUpdate && flyoutPositionUpdates.length ) {
			processUpdates()
		}
	}

};

export default positionUpdate;
