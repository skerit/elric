module.exports = function elricHelpers(hawkejs) {

	return;

	var helpers = hawkejs.helpers;

	/**
	 * Create dropdown field for creating doek elements
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.0.1
	 * @version  0.0.1
	 *
	 * @param    {object}    elementTypes    All the available element types
	 */
	helpers.doekETMenu = function doekETMenu(elementTypes) {
		var html = '';
		
		for (var typename in elementTypes) {
			var type = elementTypes[typename];
			
			html += '<li><a href="#" data-target="addElementType" data-elementType="' + typename + '">Add ' + type.title + '</a></li>';
		}
		
		this.scope.buf.push(html);
	};

};