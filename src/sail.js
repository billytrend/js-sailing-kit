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
			offsetY: 10
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
	boat.setSail(135);
	Promise.all([boat.animateBoat(360, 1)]);
});

var testNormaliseAngle = function() {
	var i = -12345;
	while(normaliseAngle(i) < 360 && normaliseAngle(i) >= 0) {
		i++;
		if(i == 12345) break;
	}
	console.log(i);
};

var normaliseAngle = function(deg) {
	if(deg < 0) deg +=360;
	return Math.abs(deg % 360);
};

var toRad = function(deg) {
	return deg * Math.PI/180;
};

boat.getAbsoluteRotation = function() {
	return normaliseAngle(this.rotation());
};

boat.setSail = function(deg) {
	this.sail.rotation(deg);
	this.checkSailSide();
	this.parent.draw();
};

boat.setBoat = function(deg) {
	this.rotation(deg);
	this.parent.draw();
};

boat.flipSail = function() {
	this.sail.scale({ y: this.sail.scale().y * -1 });
	this.parent.draw();
};

boat.checkSailSide = function() {
	var rot = this.sail.rotation();
	var scale = this.sail.scale().y;
	if(rot < 90 && rot >= 0 && scale == -1) this.flipSail();
	if(rot <=180 && rot > 90 && scale == 1) this.flipSail();
};

boat.animateSail = function(deg, speed) {
	return new Promise(
		function(resolve, reject){
			var absolutePos = this.sail.rotation() + deg;
			this.sail.curAnimation = new kinetic.Animation(function(frame) {
				var curRotation = this.sail.rotation();
				if(curRotation == absolutePos || curRotation >= 180 || curRotation <= 0) {
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
				this.setSail(physics.getOptimumSailAngle(this));
				if(curRotation == absolutePos) {
					this.curAnimation.stop();
					resolve();
				}
				this.setBoat(curRotation + speed);
			}.bind(this));

			this.curAnimation.start();
	}.bind(this));
};

boat.setRelPos = function(x, y) {
	this.move({ x: x, y: y});
	this.parent.draw();
};

boat.moveOnTradjectory = function(deg, distance) {
	deg = toRad(deg - 90);
	var vector = {
		x: distance * Math.cos(deg),
		y: distance * Math.sin(deg)
	};
	this.setRelPos(vector.x, vector.y);
};

boat.animateMove = function(deg, distance) {
	return new Promise(function(resolve, reject){
		var travelled = 0;
		this.movingAnimation = new kinetic.Animation(function(frame){
			this.moveOnTradjectory(deg, 1);
			if(++travelled == distance) {
				this.movingAnimation.stop();
			}
		}.bind(this));

		this.movingAnimation.start();
	}.bind(this));
};

boat.goForward = function(){
	var rot = this.rotation();
	return this.animateMove(rot, 100);
};

boat.moveToCoord = function(x, y, steps) {
	var dX = x/steps,
		dY = y/steps;
	return new Promise(function(resolve, reject){
		var travelled = 0;
		if(this.movingAnimation !== undefined && this.movingAnimation.isRunning()) {
			this.movingAnimation.stop();
		}

		this.movingAnimation = new kinetic.Animation(function(frame){
			this.setRelPos(dX * ++travelled, dY * travelled);
			if(travelled > 100) {
				this.movingAnimation.stop();
				resolve();
			}
		}.bind(this));

		this.movingAnimation.start();
	}.bind(this));
};

var physics = {};

physics.getOptimumSailAngle = function(boat) {
	var rot = normaliseAngle(boat.rotation());
	if(rot >= 0 && rot < 180) {
		return (180-rot)/2;
	}
	return (540-rot)/2;
};