class NzFlyout extends HTMLElement {
	static get observedAttributes() {
		return [];
	}

	connectedCallback() {
		const container = document.createElement('div');
		container.className = 'nz-flyout-container';
		this.appendChild(container);
	}

	disconnectedCallback() {
	}

	adoptedCallback() {
	}

	attributeChangedCallback(name, oldValue, newValue) {
	}
}

customElements.define('nz-flyout', NzFlyout);
