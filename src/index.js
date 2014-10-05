var boatBuilder = require('./js/sail.js');
var kinetic = require('kinetic');

var jsSailingKit = function(properties) {
	this.sailingArea = new kinetic.Stage(properties);
	this.boatsLayer = new kinetic.Layer(properties);
	this.sailingArea.add(this.boatsLayer);
};

jsSailingKit.prototype.addBoat = function(properties) {
	return new Promise(function(resolve, reject) {
		var newBoat = boatBuilder.buildBoat(properties);
		this.boatsLayer.add(newBoat);
		newBoat.loadAssets().then(function() {
			this.boatsLayer.draw();
			resolve(newBoat);
		}.bind(this))
		.catch(function(e) {
			console.log(e.message);
		});

	}.bind(this));
};

jsSailingKit.prototype.addBoats = function(propertieses) {
	return Promise.all(propertieses.map(function(properties) {
		return this.addBoat(properties);
	}.bind(this)));
};

module.exports = jsSailingKit;