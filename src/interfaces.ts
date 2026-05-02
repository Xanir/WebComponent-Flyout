
export interface IFlyout {
	readonly flyoutElem: HTMLElement;
	readonly flyoutContainer: HTMLElement | null;
	readonly isActive: boolean;
	readonly isActivatedOnHover: boolean;
	readonly isActivatedOnClick: boolean;
	displayFlyout(): void;
	close(): void;
	bindOpenerActions(): void;
}
