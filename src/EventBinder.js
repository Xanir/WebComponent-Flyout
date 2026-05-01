import ConvexHull from './helpers/convex-hull';

class EventsBinder {
	static #activeFlyouts = new Set();
	static #hullCheckLastTime = 0;
	static #staticMouseMoveListener = null;
	static #staticClickListener = null;

	static watchActiveFlyout(flyout) {
		EventsBinder.#activeFlyouts.add(flyout);
		if (flyout.isActivatedOnHover) {
			EventsBinder.#bindStaticWatcherMouseMove();
		} else if (flyout.isActivatedOnClick) {
			EventsBinder.#bindStaticWatcherClick();
		}
	}

	static unwatchFlyout(flyout) {
		EventsBinder.#activeFlyouts.delete(flyout);
		if (EventsBinder.#activeFlyouts.size === 0) {
			EventsBinder.#unbindStaticWatcherMouseMove();
			EventsBinder.#unbindStaticWatcherClick();
		}
	}

	/*
	CLOSURE EVENT HANDLERS
	*/

	static #watchEventMouseMove = (event) => {
		const now = Date.now();
		if (now - EventsBinder.#hullCheckLastTime < 100) return;
		EventsBinder.#hullCheckLastTime = now;

		console.log('watching mouse move')
		for (const flyout of EventsBinder.#activeFlyouts) {
		console.log(!flyout.isActivatedOnHover)
			if (!flyout.isActivatedOnHover) continue;
		console.log(!flyout.isActive)
			if (!flyout.isActive) {
				EventsBinder.#activeFlyouts.delete(flyout);
				continue;
			}
		console.log('checking hull')
			const hull = ConvexHull.buildHull(
				flyout.flyoutElem.parentElement,
				flyout.flyoutContainer
			);
		console.log('hull built')
		
		console.log('hull built')
			if (!hull.isInsideElements(event)) {
				flyout.close();
				EventsBinder.#activeFlyouts.delete(flyout);
				flyout.bindOpenerActions();
			}
		}

		if (EventsBinder.#activeFlyouts.size === 0) {
			EventsBinder.#unbindStaticWatcherMouseMove();
		}
	};

	static #bindStaticWatcherMouseMove() {
		if (!EventsBinder.#staticMouseMoveListener) {
			EventsBinder.#staticMouseMoveListener = EventsBinder.#watchEventMouseMove;
			window.document.addEventListener('mousemove', EventsBinder.#staticMouseMoveListener, true);
		}
	}

	static #unbindStaticWatcherMouseMove() {
		if (EventsBinder.#staticMouseMoveListener) {
			window.document.removeEventListener('mousemove', EventsBinder.#staticMouseMoveListener, true);
			EventsBinder.#staticMouseMoveListener = null;
		}
	}

	static #watchEventClick = (event) => {
		console.log('watching click')
		for (const flyout of EventsBinder.#activeFlyouts) {
			if (!flyout.isActivatedOnClick) continue;
			if (!flyout.isActive) {
				EventsBinder.#activeFlyouts.delete(flyout);
				continue;
			}
			const isInContainer = ConvexHull.isInsideElement(flyout.flyoutContainer, event);
			if (!isInContainer) {
				flyout.close();
				EventsBinder.#activeFlyouts.delete(flyout);
				flyout.bindOpenerActions();
			}
		}

		if (EventsBinder.#activeFlyouts.size === 0) {
			EventsBinder.#unbindStaticWatcherClick();
		}
	};

	static #bindStaticWatcherClick() {
		if (!EventsBinder.#staticClickListener) {
			EventsBinder.#staticClickListener = EventsBinder.#watchEventClick;
			window.document.addEventListener('click', EventsBinder.#staticClickListener, true);
		}
	}

	static #unbindStaticWatcherClick() {
		if (EventsBinder.#staticClickListener) {
			window.document.removeEventListener('click', EventsBinder.#staticClickListener, true);
			EventsBinder.#staticClickListener = null;
		}
	}

	#flyout;
	#watchedElements = [];

	constructor(flyout) {
		this.#flyout = flyout;
	}

	/*
	OPENER BINDING
	*/

	bindOpenerActions() {
		const isHoverOpener = this.#flyout.isActivatedOnHover;
		const isClickOpener = this.#flyout.isActivatedOnClick;
		
		if (isHoverOpener) {
			this.#bindOpenerMouseMove();
		} else if (isClickOpener && !isHoverOpener) {
			this.#bindOpenerClick();
		}
	}

	#bindOpenerClick() {
		this.#flyout.flyoutElem.parentElement.addEventListener('click', this.#clickEvent);
	}

	#bindOpenerMouseMove() {
		this.#flyout.flyoutElem.parentElement.addEventListener('mouseover', this.#watchMouseOver);
	}

	unbindOpenerActions() {
		this.#flyout.flyoutElem.parentElement.removeEventListener('click', this.#clickEvent);
		this.#flyout.flyoutElem.parentElement.removeEventListener('mouseover', this.#watchMouseOver);
	}

	unbindAll() {
		this.unbindOpenerActions();
		this.removeScrollEvents();
	}

	/*
	EVENT HANDLERS
	*/

	#watchMouseOver = (event) => {
		this.unbindOpenerActions();
		this.#flyout.displayFlyout();
	};

	#clickEvent = (event) => {
		this.unbindOpenerActions();
		this.#flyout.displayFlyout();
	};

	/*
	SCROLL EVENTS
	*/

	registerScrollEvent(elem) {
		const wrappedScrollEvent = () => {
			if (this.#flyout.isActive) {
				this.#flyout.displayFlyout();
			} else {
				this.removeScrollEvents();
				elem.removeEventListener('scroll', wrappedScrollEvent);
			}
		};
		this.#watchedElements.push({
			elem: elem,
			fn: wrappedScrollEvent
		});
		elem.addEventListener('scroll', wrappedScrollEvent);
	}

	removeScrollEvents() {
		if (this.#watchedElements) {
			this.#watchedElements.forEach((group) => {
				group.elem.removeEventListener('scroll', group.fn);
			});
		}
		this.#watchedElements.length = 0;
	}
}

export default EventsBinder;
