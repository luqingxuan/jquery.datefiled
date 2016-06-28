;
(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define([ 'jquery', './jquery.datepicker.css' ], factory);
	} else if (typeof exports === 'object') {

		require("./jquery.datepicker.css");

		// Node, CommonJS之类的
		module.exports = factory(require('jquery'));
	} else {
		// 浏览器全局变量(root 即 window)
		root.returnExports = factory(root.jQuery);
	}
}(this, function($) {

	$.fn.datepicker = function(options) {

		options = options || {};

		$(this).each(function() {

		});
	};

	return $;

}));