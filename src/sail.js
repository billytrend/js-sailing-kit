var kinetic = require('./lib/kinetic-v5.0.1.min.js');

var sailingArea = new kinetic.Stage({
	container: 'area',
	width: 800,
	height: 800
});

var boatsLayer = new kinetic.Layer({
	x: 100,
	y: 100
});

var boat = new kinetic.Group();

var hullImage = new Image(),
	sailImage = new Image();

var hullLoad = new Promise(function(resolve, reject) {
	hullImage.onload = function() {
		boat.hull = new kinetic.Image({
			image: hullImage,
			offsetX: 19,
			offsetY: 27
		});
		resolve(boat.hull);
	};
});

var sailLoad = new Promise(function(resolve, reject) {
	sailImage.onload = function() {
		boat.sail = new kinetic.Image({
			image: sailImage,
			offsetX: 10
		});
		resolve(boat.sail);
	};
});

hullImage.src = './hull.png';
sailImage.src = './main.png';

Promise.all([sailLoad, hullLoad]).then(function(response) {
	boat.add(response[1]);
	boat.add(response[0]);
	boatsLayer.add(boat);
	sailingArea.add(boatsLayer);
});

boat.setSail = function(deg) {
	var curRotation = this.sail.rotation();
	if((curRotation < 0 && deg >= 0) || (curRotation > 0 && deg <= 0)) {
		this.flipSail();
	}
	this.sail.rotation(deg);
	this.parent.draw();
};

boat.setBoat = function(deg) {
	var curRotation = this.rotation();
	if((curRotation < 0 && deg >= 0) || (curRotation > 0 && deg <= 0)) {
		this.fliphull();
	}
	this.rotation(deg);
	this.parent.draw();
};

boat.flipSail = function() {
	this.sail.scale({ x: this.sail.scale().x * -1 });
	this.parent.draw();
};

boat.animateSail = function(deg, speed) {
	this.sail.curAnimation = new kinetic.Animation(function(frame) {
		var curRotation = this.sail.rotation();
		if(curRotation == deg || curRotation > 90 || curRotation < -90) {
			this.sail.curAnimation.stop();
		} else {
			this.setSail(curRotation + speed);
		}
	}.bind(this));

	this.sail.curAnimation.start();
};

boat.animateBoat = function(deg, speed) {
		this.curAnimation = new kinetic.Animation(function(frame) {
		var curRotation = this.rotation();
		this.setBoat(curRotation + speed);

	}.bind(this));

	this.curAnimation.start();
};
