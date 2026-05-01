import ConvexHull from './helpers/convex-hull';
import flyoutPositioning from './helpers/positioning'

class Flyout {
	#flyoutElem
	#flyoutTemplate
	#flyoutContainer

	#pendingRenderActions = {};
	#watchedElements = [];

	#triggerMode = null;
	#hullMouseMoveListener = null;
	#hullCheckLastTime = 0;
	#windowClickListener = null;

	constructor (flyoutElem) {
		if (!flyoutElem || !(flyoutElem instanceof HTMLElement)) {
			throw 'must be an instanceof HTMLElement'
		}

		// Set id on element
		var flyoutId = flyoutElem.getAttribute('id');
		if (!flyoutId) {
			flyoutId = 'f' + Date.now();
			flyoutElem.setAttribute('id', flyoutId);
		}

		this.#flyoutElem = flyoutElem;

		// Store inner HTML
		this.#flyoutTemplate = this.#flyoutElem.innerHTML;
		this.#flyoutElem.innerHTML = '';
	}

	#getPositioningKeys () {
		return {
			attributes: [
				'flyout-anchor'
			],
			classes: [
				'flyout-anchor'
			]
		};
	}

	#findParentToPositionAgainst () {
		var flyoutElem = this.#flyoutElem;
		var positionAgainstElem;
    
        // Get things to check for on parent.
        var positioningKeys = this.#getPositioningKeys();
        if (positioningKeys.attributes) {
            var clone = positioningKeys.attributes.slice(0);
            clone.map(function(attr) {
                return 'data-' + attr;
            }).forEach(function(attr) {
                positioningKeys.attributes.push(attr);
            });
        }

        // Transverse DOM looking for element to position against.
        var searchParentElem = flyoutElem.parentElement;
        while (searchParentElem && !positionAgainstElem) {
            if (positioningKeys.classes instanceof Array) {
                positioningKeys.classes.forEach(function(someClass) {
                    if (!positionAgainstElem) {
                        if (searchParentElem.classList.contains(someClass)) {
                            positionAgainstElem = searchParentElem;
                        }
                    }
                });
            }
            if (positioningKeys.attributes instanceof Array) {
                positioningKeys.attributes.forEach(function(someAttribute) {
                    if (!positionAgainstElem) {
                        if (searchParentElem.attributes[someAttribute]) {
                            positionAgainstElem = searchParentElem;
                        }
                    }
                });
            }

            searchParentElem = searchParentElem.parentElement;
        }

		if (!positionAgainstElem) {
			positionAgainstElem = flyoutElem.parentElement;
		}

		return positionAgainstElem;
	}

	get isActive() {
		if (this.#flyoutContainer) {
			return true;
		};
		return false;
	}

	#clearTimers () {
		if (this.#pendingRenderActions) {
			window.cancelAnimationFrame(this.#pendingRenderActions.animationFrame);
			window.cancelAnimationFrame(this.#pendingRenderActions.animationFrame2);
		}
		this.#pendingRenderActions = {};
	}

	close () {
        this.unbindOpenerActions();
        this.#removeScrollEvents();
		this.#clearTimers();
		this.#unbindHullMouseMove();
		this.#unbindWindowClick();
		this.#flyoutContainer?.remove();
		this.#flyoutContainer = null;
	}

	#flyoutRender() {
		if (!this.#flyoutContainer) {
			this.#flyoutContainer = document.createElement('div');
			this.#flyoutContainer.innerHTML = this.#flyoutTemplate;

			window.document.body.appendChild(this.#flyoutContainer);

			this.#flyoutContainer.style.position = 'fixed';
			this.#flyoutContainer.style.top = '0';
			this.#flyoutContainer.style.left = '0';
			this.#flyoutContainer.style.visibility = 'hidden';

			if (this.#triggerMode === 'hover') {
				this.#bindHullMouseMove();
			}
			if (this.#triggerMode === 'click') {
				this.#bindWindowClick();
			}
		}
	}

	#displayFlyout () {
		this.#clearTimers();
		const flyoutAlignedToElem = this.#findParentToPositionAgainst();

		this.#pendingRenderActions.animationFrame = window.requestAnimationFrame(() => {
			this.#flyoutRender();
			this.#pendingRenderActions.animationFrame2 = window.requestAnimationFrame(() => {
				var flyoutElem = this.#flyoutElem;
				var alignMyAttr = flyoutElem.getAttribute('align-my');
				var alignToAttr = flyoutElem.getAttribute('align-to');

				flyoutPositioning(this.#flyoutContainer, flyoutAlignedToElem, {
					alignTo: alignToAttr,
					alignMy: alignMyAttr,
				});
				//EventManager.addActiveFlyout(flyout);
			});
		});

	}

	/*
	EVENT BINDERS
	*/

	bindOpenerClick() {
		this.#triggerMode = 'click';
		this.#flyoutElem.parentElement.addEventListener('click', this.#clickEvent);
	}
	bindOpenerMouseMove() {
		this.#triggerMode = 'hover';
		this.#flyoutElem.parentElement.addEventListener('mouseover', this.#watchMouseOver);
	}
	unbindOpenerActions () {
		this.#flyoutElem.parentElement.removeEventListener('click', this.#clickEvent);
		this.#flyoutElem.parentElement.removeEventListener('mouseover', this.#watchMouseOver);
	}

	/*
	EVENT ACTIONS
	*/

	#watchMouseOver = (event) => {
		this.unbindOpenerActions();
		this.#displayFlyout();
	};

	#clickEvent = (event) => {
		this.unbindOpenerActions();
		this.#displayFlyout();
	};

    processEvent = (event) => {
        this.#processClickEvent(event);
        this.#processMouseMove(event);
    }

	#processClickEvent = (event) => {
		if (event.type !== 'click') return;

		if (!ConvexHull.isInsideElement(this.#flyoutContainer, event) &&
			!ConvexHull.isInsideElement(this.#flyoutElem.parentElement, event))
		{
			this.close();
		}
	};

	#processMouseMove = (event) => {
		if (event.type !== 'hover') return;

		const flyoutParentElem = this.#flyoutElem.parentElement;
		var hull = ConvexHull.buildHull(flyoutParentElem, this.#flyoutContainer);
		if (!hull.isInsideElements(event)) {
			flyoutParentElem.addEventListener('mouseover', this.#watchMouseOver);
			this.close();

			return true;
		}
	};

	#bindHullMouseMove () {
		this.#hullMouseMoveListener = (event) => {
			var now = Date.now();
			if (now - this.#hullCheckLastTime < 100) return;
			this.#hullCheckLastTime = now;

			if (!this.#flyoutContainer) return;
			var hull = ConvexHull.buildHull(this.#flyoutElem.parentElement, this.#flyoutContainer);
			if (!hull.isInsideElements(event)) {
				this.#unbindHullMouseMove();
				this.close();
				this.#flyoutElem.parentElement.addEventListener('mouseover', this.#watchMouseOver);
			}
		};
		window.document.addEventListener('mousemove', this.#hullMouseMoveListener, true);
	}

	#unbindHullMouseMove () {
		if (this.#hullMouseMoveListener) {
			window.document.removeEventListener('mousemove', this.#hullMouseMoveListener, true);
			this.#hullMouseMoveListener = null;
		}
	}

	#bindWindowClick () {
		this.#windowClickListener = (event) => {
			if (!this.#flyoutContainer) return;
			const openerElem = this.#flyoutElem.parentElement;
			const isInContainer = ConvexHull.isInsideElement(this.#flyoutContainer, event);

			if (!isInContainer) {
				this.#unbindWindowClick();
				this.close();
				openerElem.addEventListener('click', this.#clickEvent);
			}
		};
		window.document.addEventListener('click', this.#windowClickListener, true);
	}

	#unbindWindowClick () {
		if (this.#windowClickListener) {
			window.document.removeEventListener('click', this.#windowClickListener, true);
			this.#windowClickListener = null;
		}
	}

	#registerScrollEvent = (elem) => {
		var wrappedScrollEvent = () => {
			if (this.isActive) {
				this.#displayFlyout();
			} else {
				this.#removeScrollEvents();
				elem.removeEventListener('scroll', wrappedScrollEvent);
			}
		};
		this.#watchedElements.push({
			elem: elem,
			fn: wrappedScrollEvent
		});
		elem.addEventListener('scroll', wrappedScrollEvent);
	};

	#removeScrollEvents = () => {
		if (this.#watchedElements) {
			this.#watchedElements.forEach((group) => {
				group.elem.removeEventListener('scroll', group.fn);
			});
		}
		this.#watchedElements.length = 0;
	};

}

export default Flyout;