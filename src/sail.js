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
	document.getElementById('area').addEventListener('click', function(e) {
		// console.log(e.clientX, e.clientY);
		var abs = boat.getAbsolutePosition(),
			dx = e.clientX - abs.x,
			dy = abs.y - e.clientY;

			console.log(dx, dy);

		Promise.all([boat.pointToCoord(dx, dy)]);

	});
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

var fromRad = function(rad) {
	return rad / (Math.PI/180);
};

var xIsInRange = function(x, a, b) {
	return (x >= a && x <= b) || (x <= a && x >= b);
};

var angleDiffs = function (a, b) {
	var direction = a < b ? -1 : 1;
	var inner = (b - a);
	var outer = (direction * 360) + inner;
	return [inner, outer].sort(function(a, b) {
		if(Math.abs(a) > Math.abs(b)) return 1;
		else if(Math.abs(b) > Math.abs(a)) return -1;
		return 0;
	});
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
				var curRotation = this.sail.rotation(),
					nextRotation = curRotation + speed;
				if(xIsInRange(absolutePos, toRad(curRotation), toRad(nextRotation)) || curRotation >= 180 || curRotation <= 0) {
					this.sail.curAnimation.stop();
					resolve();
				} else {
					this.setSail(nextRotation);
				}
			}.bind(this));

			this.sail.curAnimation.start();
		}.bind(this)
	);
};

boat.animateBoat = function(deg, speed) {
	return new Promise(
		function(resolve, reject){
			if(this.curAnimation !== undefined && this.curAnimation.isRunning()) {
				this.curAnimation.stop();
			}

			var plusDirection = angleDiffs(this.getAbsoluteRotation(), deg)[0] > 0
			
			deg = normaliseAngle(deg);

			this.curAnimation = new kinetic.Animation(function(frame) {

				var curRotation = this.getAbsoluteRotation(),
					nextRotation = plusDirection ? curRotation + speed : curRotation - speed;

				console.log(xIsInRange(deg, curRotation, nextRotation), deg, curRotation, nextRotation)

				if(xIsInRange(deg, curRotation, nextRotation)) {
					this.curAnimation.stop();
					resolve();
				}
				this.setBoat(nextRotation);
			}.bind(this));

			this.curAnimation.start();
	}.bind(this));
};

boat.setRelPos = function(x, y) {
	this.move({ x: x, y: y});
	this.parent.draw();
};

boat.setAbsPos = function(x, y) {
	this.position({ x: x, y: y});
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

boat.pointToCoord = function(x, y) {
	var angle = fromRad(Math.atan2(toRad(x), toRad(y)));
	if(angle<0) angle += 360;
	return fromRad(boat.animateBoat(angle, 1));
};

boat.setOptimumSailAngle = function() {
	var rot = this.getAbsoluteRotation();
	if(rot >= 0 && rot < 180) {
		this.setSail((180-rot)/2);
	} else {
		this.setSail((540-rot)/2);
	}
};