
var throttle = function(fn, wait) {
	var lastCall = 0;
	return function() {
		var now = Date.now();
		if (now - lastCall >= wait) {
			lastCall = now;
			fn.apply(this, arguments);
		}
	};
};

var flyouts = new Set();

var getRoots = function(map) {
	var roots = [];

	var allParents = new Set();
	var allChildren = new Set();

	map.forEach(function(childSet, parentObj) {
		allParents.add(parentObj);
		childSet.forEach(allChildren.add.bind(allChildren));
	});
	allParents.forEach(function(parentObj) {
		if (!allChildren.has(parentObj)) {
			roots.push( parentObj );
		}
	});

	return roots;
};

var register = function(flyout) {
	flyouts.add(flyout);
};

var getParentToChildren = function() {
	var containerToFlyout = new Map();

	flyouts.forEach(function(flyout) {
		if (flyout.isActive) {
			if (flyout.flyoutContainer) {
				containerToFlyout.set(flyout.flyoutContainer, flyout);
			}
		}
	});

	var windowHtml = window.document.children[0];
	var flyoutParentToChildren = new Map();
	flyouts.forEach(function(flyout) {
		var domElem = flyout.flyoutElem;
		while (domElem) {
			var parentFlyout = containerToFlyout.get(domElem);
			if (parentFlyout) {
				var children = flyoutParentToChildren.get(parentFlyout);
				if (!children) {
					children = new Set();
					flyoutParentToChildren.set(parentFlyout, children);
				}
				children.add(flyout);
				break;
			}
			var domParent = domElem.parentElement;
			if (!domParent && domElem !== windowHtml) {
				// This Flyout is no longer in the DOM
				flyouts.delete(flyout);
			} else {
				flyoutParentToChildren.set(flyout, new Set());
			}
			domElem = domParent;
		}
	});

	return flyoutParentToChildren;
};

var isFlyoutStillActive = function(flyout, parentToChildren, eventInfo) {
	// Check if this flyout has Children and process
	//    them for Leaf first recurrsion.
	var children = parentToChildren.get(flyout);
	var isActive = false;
	if (children) {
		children.forEach(function(childFlyout) {
			// Once TRUE stay true.
			// Ensures the parent stays active since at least one child is still active.
			isActive = isFlyoutStillActive(childFlyout, parentToChildren, eventInfo) || isActive;
		});
	}

	if (!isActive) {
		flyout.processEvent(eventInfo);
		isActive = flyout.isActive;
	}

	return isActive;
}

var processFlyoutEvent = function(e) {
	var parentToChildren = getParentToChildren();
	var rootFlyouts = getRoots(parentToChildren);
	rootFlyouts.forEach(function(flyout) {
		isFlyoutStillActive(flyout, parentToChildren, e);
	});
};

var eventMouseMove = function(event) {
	processFlyoutEvent({
		x: event.x,
		y: event.y,
		type: 'hover',
	});
};
window.document.addEventListener('mousemove', throttle(eventMouseMove, 90));

var eventMouseClick = function(event) {
	processFlyoutEvent({
		x: event.x,
		y: event.y,
		type: 'click',
	});
};
window.document.addEventListener('click', throttle(eventMouseClick, 20));

export { register };
