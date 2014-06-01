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
	// boat.animateBoat(100, 10);
	Promise.all([boat.animateBoat(90, 1), boat.animateSail(90, -2 )]);
});

boat.setSail = function(deg) {
	var curRotation = this.sail.rotation();
	var nextRotation = curRotation + deg;
	if((curRotation < 0 && nextRotation > 0) || (curRotation >= 0 && nextRotation <= 0)) {
		this.flipSail();
	}
	this.sail.rotation(deg);
	this.parent.draw();
};

boat.setBoat = function(deg) {
	var curRotation = this.rotation();
	this.rotation(deg);
	this.checkSailSide();
	this.parent.draw();
};

boat.flipSail = function() {
	this.sail.scale({ x: this.sail.scale().x * -1 });
	this.parent.draw();
};

boat.checkSailSide = function() {
	var rot = this.sail.rotation();
	var scale = this.sail.scale().x;
	if(rot > 90 && rot <= 0 && scale == -1) this.flipSail();
	if(rot > 90 && rot <= 0 && scale == 1) this.flipSail();
};

boat.animateSail = function(deg, speed) {
	return new Promise(
		function(resolve, reject){
			var absolutePos = this.sail.rotation() + deg;
			this.sail.curAnimation = new kinetic.Animation(function(frame) {
				var curRotation = this.sail.rotation();
				if(curRotation == absolutePos || curRotation >= 90 || curRotation <= -90) {
					this.sail.curAnimation.stop();
					resolve();
				} else {
					this.setSail(curRotation + speed);
				}
			}.bind(this));

			this.sail.curAnimation.start();
		}.bind(this)
	);
};

boat.animateBoat = function(deg, speed) {
	return new Promise(
		function(resolve, reject){
			var absolutePos = this.rotation() + deg;
			this.curAnimation = new kinetic.Animation(function(frame) {
				var curRotation = this.rotation();
				if(curRotation == absolutePos) {
					this.curAnimation.stop();
					resolve();
				}
				this.setBoat(curRotation + speed);
			}.bind(this));

			this.curAnimation.start();
	}.bind(this));
};
