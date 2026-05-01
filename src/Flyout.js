import EventBinder from './EventBinder';
import flyoutPositioning from './helpers/positioning'


class Flyout {
	#flyoutElem
	#flyoutContainer
	#flyoutTemplate
	#eventBinder

	#isActivatedOnClick = false;
	#isActivatedOnHover= false;

	#pendingRenderActions = {};

	constructor (flyoutElem) {
		if (!flyoutElem || !(flyoutElem instanceof HTMLElement)) {
			throw 'must be an instanceof HTMLElement'
		}
		this.#flyoutElem = flyoutElem;

		// Store inner HTML
		this.#flyoutTemplate = this.#flyoutElem.innerHTML;
		this.#flyoutElem.innerHTML = '';

		this.#eventBinder = new EventBinder(this);
		this.bindOpenerActions();
	}

	get isActivatedOnClick() {
		return this.#isActivatedOnClick;
	}

	get isActivatedOnHover() {
		return this.#isActivatedOnHover;
	}

	get flyoutElem() {
		return this.#flyoutElem;
	}

	get flyoutContainer() {
		return this.#flyoutContainer;
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
		return !!this.#flyoutContainer;
	}

	#clearTimers () {
		if (this.#pendingRenderActions) {
			window.cancelAnimationFrame(this.#pendingRenderActions.animationFrame);
			window.cancelAnimationFrame(this.#pendingRenderActions.animationFrame2);
		}
		this.#pendingRenderActions = {};
	}

	close () {
		this.#eventBinder.unbindAll();
		this.#clearTimers();
		this.#flyoutContainer?.remove();
		this.#flyoutContainer = null;
	}

	bindOpenerActions() {
		const flyoutOnAttr = this.#flyoutElem.getAttribute('flyout-on');
		const flyoutOnAttrs = flyoutOnAttr.split(' ');

		this.#isActivatedOnClick = flyoutOnAttrs.reduce((acc, attr) => {
			if (attr.trim() === 'click') {
				return true;
			}
			return acc;
		}, false);
		this.#isActivatedOnHover = flyoutOnAttrs.reduce((acc, attr) => {
			if (attr.trim() === 'hover') {
				return true;
			}
			return acc;
		}, false);

		this.#eventBinder.bindOpenerActions();
	}

	unbindOpenerActions() {
		this.#eventBinder.unbindOpenerActions();
	}

	#initFlyoutContainer() {
		if (!this.#flyoutContainer) {
			this.#flyoutContainer = document.createElement('div');
			this.#flyoutContainer.innerHTML = this.#flyoutTemplate;

			window.document.body.appendChild(this.#flyoutContainer);

			this.#flyoutContainer.style.position = 'fixed';
			this.#flyoutContainer.style.top = '0';
			this.#flyoutContainer.style.left = '0';
			this.#flyoutContainer.style.visibility = 'hidden';

			this.#eventBinder.unbindOpenerActions();
			EventBinder.watchActiveFlyout(this);
		}
	}

	displayFlyout () {
		this.#clearTimers();
		const flyoutAlignedToElem = this.#findParentToPositionAgainst();

		this.#pendingRenderActions.animationFrame = window.requestAnimationFrame(() => {
			this.#initFlyoutContainer();
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

}

export default Flyout;