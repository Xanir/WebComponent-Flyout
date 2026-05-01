import FlyoutComponent from './Flyout';
import { register } from './event-binder';


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
        register(this.#flyout);
	}

	disconnectedCallback() {
        this.#flyout.close();
	}

	adoptedCallback() {
	}

	attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'flyout-on') {
            if (newValue) {
                this.#flyout.unbindOpenerActions();

                if (typeof newValue === 'string') {
                    newValue = newValue.split(' ');
                    if (newValue.indexOf('click') >= 0 && newValue.indexOf('hover') >= 0) {
                        this.#flyout.bindOpenerClickHover();
                    } else if (newValue.indexOf('click') >= 0) {
                        this.#flyout.bindOpenerClick();
                    } else if (newValue.indexOf('hover') >= 0) {
                        this.#flyout.bindOpenerMouseMove();
                    }
                }
            }
        }
	}
}

customElements.define('nz-flyout', NzFlyout);
