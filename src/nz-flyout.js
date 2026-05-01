import FlyoutComponent from './Flyout';


class NzFlyout extends HTMLElement {
    #flyout

    constructor() {
        super();

        this.#flyout = new FlyoutComponent(this)
    }

	static get observedAttributes() {
		return ['flyout-on'];
	}

	connectedCallback() {
	}

	disconnectedCallback() {
        this.#flyout.close();
	}

	adoptedCallback() {
	}

	attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'flyout-on') {
            this.#flyout.unbindOpenerActions();
            if (newValue) {
                this.#flyout.bindOpenerActions();
            }
        }
	}
}

customElements.define('nz-flyout', NzFlyout);
