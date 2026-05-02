import FlyoutComponent from './Flyout';

class NzFlyout extends HTMLElement {
	#flyout: FlyoutComponent;

	constructor() {
		super();
		this.#flyout = new FlyoutComponent(this);
	}

	static get observedAttributes(): string[] {
		return ['flyout-on'];
	}

	connectedCallback(): void {
	}

	disconnectedCallback(): void {
		this.#flyout.close();
	}

	adoptedCallback(): void {
	}

	attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
		if (name === 'flyout-on') {
			this.#flyout.unbindOpenerActions();
			if (newValue) {
				this.#flyout.bindOpenerActions();
			}
		}
	}
}

customElements.define('nz-flyout', NzFlyout);
