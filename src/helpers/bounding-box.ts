export interface BoxData {
	x: number;
	y: number;
	width: number;
	height: number;
	top: number;
	bottom: number;
	left: number;
	right: number;
	marginLeft: number;
	marginRight: number;
	marginTop: number;
	marginBottom: number;
}

export default function getBoxData(node: HTMLElement): BoxData {
	const computedStyles = window.getComputedStyle(node);
	const rect = node.getBoundingClientRect();
	return {
		x:            rect.x,
		y:            rect.y,
		width:        rect.width,
		height:       rect.height,
		top:          rect.top,
		bottom:       rect.bottom,
		left:         rect.left,
		right:        rect.right,
		marginLeft:   parseInt(computedStyles.marginLeft),
		marginRight:  parseInt(computedStyles.marginRight),
		marginTop:    parseInt(computedStyles.marginTop),
		marginBottom: parseInt(computedStyles.marginBottom),
	};
}
