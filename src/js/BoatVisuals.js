var Kinetic = require('kinetic');

module.exports = {
	makeImage: function(boat) {
		return new Promise(function(resolve, reject) {
			boat.toImage({
				callback: resolve
			});
		});
	},

	showSternLine: function(boat) {
		var sternLine = new Kinetic.Line({
			points: [57, 57, -57, 57],
			stroke: 'red',
			strokeWidth: 1
		});
		boat.add(sternLine);
		boat.parent.draw();
	}

};