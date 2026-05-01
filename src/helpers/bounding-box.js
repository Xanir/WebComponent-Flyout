
export default function(node) {
	var computedStyles = window.getComputedStyle(node);
	var boxData = node.getBoundingClientRect();
	boxData.marginLeft   = parseInt(computedStyles.marginLeft);
	boxData.marginRight  = parseInt(computedStyles.marginRight);
	boxData.marginTop    = parseInt(computedStyles.marginTop);
	boxData.marginBottom = parseInt(computedStyles.marginBottom);

	return boxData;
}
