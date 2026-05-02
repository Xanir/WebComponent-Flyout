import EventBinder from './EventBinder';
import type { IFlyout } from './interfaces';
import flyoutPositioning from './helpers/positioning';

interface PositioningKeys {
	attributes: string[];
	classes:    string[];
}

class Flyout implements IFlyout {
	#flyoutElem: HTMLElement;
	#flyoutContainer: HTMLElement | null = null;
	#flyoutTemplate: string;
	#eventBinder: EventBinder;

	#isActivatedOnClick: boolean = false;
	#isActivatedOnHover: boolean = false;

	#rAFdisplayFlyout: number = 0;

	constructor(flyoutElem: HTMLElement) {
		if (!flyoutElem || !(flyoutElem instanceof HTMLElement)) {
			throw new Error('must be an instanceof HTMLElement');
		}
		this.#flyoutElem = flyoutElem;

		this.#flyoutTemplate = this.#flyoutElem.innerHTML;
		this.#flyoutElem.innerHTML = '';

		this.#eventBinder = new EventBinder(this);
		this.bindOpenerActions();
	}

	get isActivatedOnClick(): boolean {
		return this.#isActivatedOnClick;
	}

	get isActivatedOnHover(): boolean {
		return this.#isActivatedOnHover;
	}

	get flyoutElem(): HTMLElement {
		return this.#flyoutElem;
	}

	get flyoutContainer(): HTMLElement | null {
		return this.#flyoutContainer;
	}

	#getPositioningKeys(): PositioningKeys {
		return {
			attributes: ['flyout-anchor'],
			classes:    ['flyout-anchor'],
		};
	}

	#findParentToPositionAgainst(): HTMLElement {
		const flyoutElem = this.#flyoutElem;
		let positionAgainstElem: HTMLElement | undefined;

		const positioningKeys = this.#getPositioningKeys();
		if (positioningKeys.attributes) {
			const clone = positioningKeys.attributes.slice(0);
			clone.map(attr => 'data-' + attr).forEach(attr => {
				positioningKeys.attributes.push(attr);
			});
		}

		let searchParentElem: HTMLElement | null = flyoutElem.parentElement;
		while (searchParentElem && !positionAgainstElem) {
			if (positioningKeys.classes instanceof Array) {
				positioningKeys.classes.forEach(someClass => {
					if (!positionAgainstElem && searchParentElem!.classList.contains(someClass)) {
						positionAgainstElem = searchParentElem!;
					}
				});
			}
			if (positioningKeys.attributes instanceof Array) {
				positioningKeys.attributes.forEach(someAttribute => {
					if (!positionAgainstElem && searchParentElem!.attributes.getNamedItem(someAttribute)) {
						positionAgainstElem = searchParentElem!;
					}
				});
			}
			searchParentElem = searchParentElem.parentElement;
		}

		if (!positionAgainstElem) {
			positionAgainstElem = flyoutElem.parentElement!;
		}

		return positionAgainstElem;
	}

	get isActive(): boolean {
		return !!this.#flyoutContainer;
	}

	close(): void {
		this.#eventBinder.unbindAll();
		this.#flyoutContainer?.remove();
		this.#flyoutContainer = null;
	}

	bindOpenerActions(): void {
		const flyoutOnAttr  = this.#flyoutElem.getAttribute('flyout-on') ?? '';
		const flyoutOnAttrs = flyoutOnAttr.split(' ');

		this.#isActivatedOnClick  = flyoutOnAttrs.some(attr => attr.trim() === 'click');
		this.#isActivatedOnHover  = flyoutOnAttrs.some(attr => attr.trim() === 'hover');

		this.#eventBinder.bindOpenerActions();
	}

	unbindOpenerActions(): void {
		this.#eventBinder.unbindOpenerActions();
	}

	#initFlyoutContainer(): void {
		if (!this.#flyoutContainer) {
			this.#flyoutContainer = document.createElement('div');
			this.#flyoutContainer.innerHTML = this.#flyoutTemplate;

			window.document.body.appendChild(this.#flyoutContainer);

			this.#flyoutContainer.style.position   = 'fixed';
			this.#flyoutContainer.style.top        = '0';
			this.#flyoutContainer.style.left       = '0';
			this.#flyoutContainer.style.visibility = 'hidden';

			this.#eventBinder.unbindOpenerActions();
			this.#eventBinder.watchActiveFlyout(this);
		}
	}

	#applyPositioning(flyoutAlignedToElem: HTMLElement): void {
		const flyoutElem  = this.#flyoutElem;
		const alignMyAttr = flyoutElem.getAttribute('align-my');
		const alignToAttr = flyoutElem.getAttribute('align-to');
		flyoutPositioning(this.#flyoutContainer!, flyoutAlignedToElem, {
			alignTo: alignToAttr,
			alignMy: alignMyAttr,
		});
	}

	displayFlyout(): void {
		const flyoutAlignedToElem = this.#findParentToPositionAgainst();

		if (this.#flyoutContainer) {
			this.#applyPositioning(flyoutAlignedToElem);
			return;
		}

		window.cancelAnimationFrame(this.#rAFdisplayFlyout);
		this.#initFlyoutContainer();
		this.#rAFdisplayFlyout = window.requestAnimationFrame(() => {
			this.#applyPositioning(flyoutAlignedToElem);
		});
	}
}

export default Flyout;
