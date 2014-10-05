module.exports = {
	makeImage: function(boat) {
		return new Promise(function(resolve, reject) {
			boat.toImage({
				callback: resolve
			});
		});
	},
};