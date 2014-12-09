var Kinetic = require('kinetic');

var data = {
	assetRoot: 'assets/',

	sails: [
		{
			name: 'main',
			image: 'main.png',
			offset: { x: 0, y: 10 },
			range: [0, 180]
		}
	],

	hull: {
		image: 'hull.png',
		offset: { x: 19, y: 27 }
	}
};

var state = function () {
	this.sail = undefined;
	this.hull = undefined;
	this.context = undefined;
}

var api = {

	// sail{} => double(0,1) => sail{}
	setSail: function(sail, degree) {
		var side = this.getSailSide(sail);
		var maxRotation = 90;
		sail.rotation(degree * side * maxRotation);
		return sail;
	},

	// sail{} => Maybe polarity(-1,1) => sail{}
	flipSail: function(sail, polarity) {
		sail.rotation(-sail.rotation());
		return sail;
	},

	// boatState{} => double(0,1) => boatState{}
	setSails: function (boatState, degree) {
		this.setSail(boatState.sail, degree);
		return boatState;
	},

	// boatState{} => Maybe polarity(-1,1) => boatState{}
	flipSails: function (boatState, polarity) {
		this.flipSail(boatState.sail, polarity);
		return boatState;
	},

	// boat{} => context{} => boatState{}
	build: function (boat, context) {

		var hullImage = new Image(),
			sailImage = new Image(),
			group = new Kinetic.Group(properties),
			toLoad = 2;

		hullImage.onload = function() {
			hull = new kinetic.Image({
				image: hullImage,
				offsetX: 19,
				offsetY: 27
			});
		};

		sailImage.onload = function() {
			hull = new kinetic.Image({
				image: sailImage,
				offsetX: 0,
				offsetY: 10
			});
		};

		hullImage.src = '../assets/hull.png';
		sailImage.src = '../assets/main.png';

		var boatState = new state();
		boatState.hull = hullImage;
		boatState.sail = sailImage;
		boatState.context = context;

		return boatState;
	},

	// element{} => element{}
	getDrawContext: function(element) {
		while(element.nodeType != "Layer") {
			element = element.parent;
		}
		return element;
	},

	// sail{} => nonzero int(1,-1)
	getSailSide: function(sail) {
		if(sail.rotation() > 0) return 1;
		return -1;
	},

	// sail{} => double(1,-1)
	getSailDegree: function(sail) {
		return sail.rotation() / 90;
	},

	// boatState{} => nonzero int(1,-1)
	getSailSides: function(boatState) {
		return [this.getSailSide(sail)]
	},

	// boatState{} => double(1,-1)
	getSailDegrees: function(boatState) {
		return [this.getSailDegree(boatState.sail)];
	},

	// boatState{} => double (0, 1) => boatState{}
	turnBoat: function(boatState, turn) {
		var fullRotation = 360;
		boatState.boat.rotation(turn * fullRotation);
	},

	// boatState{} => double (-1, 1) => boatState{}
	turnBoatRel: function(boatState, turn) {
		var current = this.getBoatRotation(boatState);
		var next = current + turn;
		this.turnBoat(boatState, turn);
	},

	// boatState{} => double (-1, 1)
	getBoatRotation: function(boatState) {
		var rot = boatState.boat.rotation();
		if(rot < 0) return (360 + rot) / 360;
		return rot / 360;
	}
}


module.exports.data = data;
module.exports.api = api;