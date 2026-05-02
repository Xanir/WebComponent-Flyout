import type { IFlyout } from './interfaces';
import ConvexHull from './helpers/convex-hull';

interface ScrollWatcher {
	elem: Element | Document;
	fn: EventListener;
}

class EventsBinder {
	static #activeFlyouts = new Set<IFlyout>();
	static #hullCheckLastTime = 0;
    static #isTrackingMousemove = false;
    static #isTrackingClick = false;

	watchActiveFlyout(flyout: IFlyout): void {
		EventsBinder.#activeFlyouts.add(flyout);
		if (flyout.isActivatedOnHover) {
			EventsBinder.#bindStaticWatcherMouseMove();
		} else if (flyout.isActivatedOnClick) {
			EventsBinder.#bindStaticWatcherClick();
		}
        this.findAndRegisterScrollableParents(flyout.flyoutElem.parentElement!);
	}

	static unwatchFlyout(flyout: IFlyout): void {
		EventsBinder.#activeFlyouts.delete(flyout);
		if (EventsBinder.#activeFlyouts.size === 0) {
			EventsBinder.#unbindStaticWatcherMouseMove();
			EventsBinder.#unbindStaticWatcherClick();
		}
	}

	/*
	CLOSURE EVENT HANDLERS
	*/

	static #eventCloseFlyoutOnMouseAway = (event: MouseEvent): void => {
		const now = Date.now();
		if (now - EventsBinder.#hullCheckLastTime < 95) return;
		EventsBinder.#hullCheckLastTime = now;

		for (const flyout of EventsBinder.#activeFlyouts) {
			if (!flyout.isActivatedOnHover) continue;
			if (!flyout.isActive) {
				EventsBinder.#activeFlyouts.delete(flyout);
				continue;
			}
			const hull = ConvexHull.buildHull(
				flyout.flyoutElem.parentElement!,
				flyout.flyoutContainer!
			);
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

	static #bindStaticWatcherMouseMove(): void {
		if (!EventsBinder.#isTrackingMousemove) {
			EventsBinder.#isTrackingMousemove = true;
			window.document.addEventListener('mousemove', EventsBinder.#eventCloseFlyoutOnMouseAway as EventListener, true);
		}
	}

	static #unbindStaticWatcherMouseMove(): void {
		if (EventsBinder.#isTrackingMousemove) {
			window.document.removeEventListener('mousemove', EventsBinder.#eventCloseFlyoutOnMouseAway as EventListener, true);
			EventsBinder.#isTrackingMousemove = false;
		}
	}

	static #eventCloseFlyoutOnClickAway = (event: MouseEvent): void => {
		for (const flyout of EventsBinder.#activeFlyouts) {
			if (!flyout.isActivatedOnClick) continue;
			if (!flyout.isActive) {
				EventsBinder.#activeFlyouts.delete(flyout);
				continue;
			}
			const isInContainer = ConvexHull.isInsideElement(flyout.flyoutContainer!, event);
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

	static #bindStaticWatcherClick(): void {
		if (!EventsBinder.#isTrackingClick) {
			EventsBinder.#isTrackingClick = true;
			window.document.addEventListener('click', EventsBinder.#eventCloseFlyoutOnClickAway as EventListener, true);
		}
	}

	static #unbindStaticWatcherClick(): void {
		if (EventsBinder.#isTrackingClick) {
			window.document.removeEventListener('click', EventsBinder.#eventCloseFlyoutOnClickAway as EventListener, true);
			EventsBinder.#isTrackingClick = false;
		}
	}

	#flyout: IFlyout;
    #scrollableParents: ScrollWatcher[] = [];

	constructor(flyout: IFlyout) {
		this.#flyout = flyout;
	}

	/*
	OPENER BINDING
	*/

	bindOpenerActions(): void {
		const isHoverOpener = this.#flyout.isActivatedOnHover;
		const isClickOpener = this.#flyout.isActivatedOnClick;

		if (isHoverOpener) {
			this.#bindOpenerMouseMove();
		} else if (isClickOpener && !isHoverOpener) {
			this.#bindOpenerClick();
		}
	}

	#bindOpenerClick(): void {
		this.#flyout.flyoutElem.parentElement!.addEventListener('click', this.#eventOpenFlyoutOnClick);
	}

	#bindOpenerMouseMove(): void {
		this.#flyout.flyoutElem.parentElement!.addEventListener('mouseover', this.#eventOpenFlyoutOnMouseover);
	}

	unbindOpenerActions(): void {
		this.#flyout.flyoutElem.parentElement!.removeEventListener('click', this.#eventOpenFlyoutOnClick);
		this.#flyout.flyoutElem.parentElement!.removeEventListener('mouseover', this.#eventOpenFlyoutOnMouseover);
	}

	unbindAll(): void {
		this.unbindOpenerActions();
		this.removeScrollEvents();
	}

	/*
	EVENT HANDLERS
	*/

	#eventOpenFlyoutOnMouseover = (_event: MouseEvent): void => {
		this.unbindOpenerActions();
		this.#flyout.displayFlyout();
	};

	#eventOpenFlyoutOnClick = (_event: MouseEvent): void => {
		this.unbindOpenerActions();
		this.#flyout.displayFlyout();
	};

	/*
	SCROLL EVENTS
	*/

    findAndRegisterScrollableParents(elem: Element): void {
		const style = window.getComputedStyle(elem);
		const overflow = style.overflow + style.overflowX + style.overflowY;
		if (/(auto|scroll)/.test(overflow)) {
			this.registerScrollEvent(elem);
		}
		if (elem.parentElement) {
			this.findAndRegisterScrollableParents(elem.parentElement);
		} else {
			this.registerScrollEvent(document);
        }
    }

	registerScrollEvent(elem: Element | Document): void {
		const wrappedScrollEvent = (): void => {
            if (this.#flyout.isActive) {
                this.#flyout.displayFlyout();
            } else {
                this.removeScrollEvents();
                elem.removeEventListener('scroll', wrappedScrollEvent);
            }
		};
		this.#scrollableParents.push({
			elem,
			fn: wrappedScrollEvent,
		});
		elem.addEventListener('scroll', wrappedScrollEvent);
	}

	removeScrollEvents(): void {
		this.#scrollableParents.forEach(group => {
			group.elem.removeEventListener('scroll', group.fn);
		});
		this.#scrollableParents.length = 0;
	}
}

export default EventsBinder;
