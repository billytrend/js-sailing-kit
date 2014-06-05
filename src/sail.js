
var Boat = function() {

	// images 
	this.representation = new kinetic.Group();
	this.hullImage = new Image();
	this.sailImage = new Image();
	// image assets to be loaded
	// START HERE!! 
	this.loadPromises = [
		new Promise(function(resolve, reject) {
			this.hullImage.onload = function() {
				this.hull = new kinetic.Image({
					image: this.hullImage,
					offsetX: 19,
					offsetY: 27
				});
				resolve(this.hull);
			}.bind(this);
			this.hullImage.src = './hull.png';

		}.bind(this)),

		new Promise(function(resolve, reject) {
			this.sailImage.onload = function() {
				this.sail = new kinetic.Image({
					image: this.sailImage,
					offsetY: 10
				});
				resolve(this.sail);
			}.bind(this);
			this.sailImage.src = './main.png';
		}.bind(this))
	];

};

Boat.prototype.loadAssets = function() {
	return new Promise(function(resolve, reject){
		Promise.all(this.loadPromises).then(function(loaded) {
			loaded.forEach(function(element) {
				this.getRepresentation().add(element);
			}.bind(this));
			resolve(this);
		}.bind(this));
	}.bind(this));
};


Boat.prototype.getRepresentation = function() {
	return this.representation;
};

Boat.prototype.moveBoat = undefined;

var mover = function(defaults) {
	var getCoordFromAngle = function(deg, distance) {
		deg = toRad(deg - 90);
		return {
			x: distance * Math.cos(deg),
			y: distance * Math.sin(deg)
		};
	};

	var xIsInRange = function(x, a, b) {
		return (x >= a && x <= b) || (x <= a && x >= b);
	};

	var pythagorous = function(x, y) {
		return Math.sqrt(x*x, y*y); 
	};

	return function(options) {
		return new Promise(function(resolve, reject) {

			// check if coordinates need calculating
			if(areUndefined([this.x, this.y] && !isUndefined(options.angle))) {
				var coords = getCoordFromAngle(this);
				this.x = coords.x;
				this.y = coords.y;
			}

			// sets speed to default if undefined
			if(isUndefined(options.speed)) {
				options.speed = 1;
			}

			if(isUndefined(options.distance)) {
				options.distance = pythagorous(this.x, this.y);
			}

			if(areUndefined([this.x, this.y])) {
				// cancel any currently running animation on the target
				if(defaults.target.moveAnim !== undefined && defaults.target.moveAnim.isRunning()) {
					defaults.target.moveAnim.stop();
				}

				defaults.target.moveAnim = new kinetic.Animation(function(frame) {

					// check the distance hasn't been travelled
					if(xIsInRange(vector.dist, travelled, ++travelled)) {
						defaults.target.moveAnim.stop();
						resolve();
					}

					// move and draw the target by the unitVector 
					defaults.target.move(unitVector);
					defaults.target.parent.draw();

				});


			}
			defaults.target.moveAnim.start();
		});
	};
};

function options() {
	this.x;
	this.y;

	this.angle;
	this.distance;

	this.speed;
}

var turner = function(low, high, extras) {
	var toRad = function(deg) {
		return deg * Math.PI/180;
	};

	var fromRad = function(rad) {
		return rad / (Math.PI/180);
	};


	var getAngleFromCoord = function(x, y) {
		var angle = fromRad(Math.atan2(toRad(x), toRad(y)));
		if(angle<0) angle += 360;
		return angle;
	};

	var angleDiffs = function (a, b, range) {
		var direction = a < b ? -1 : 1;
		var inner = (b - a);
		var outer = (direction * range) + inner;
		return [inner, outer].sort(function(a, b) {
			if(Math.abs(a) > Math.abs(b)) return 1;
			else if(Math.abs(b) > Math.abs(a)) return -1;
			return 0;
		});
	};

	var normaliseAngle = function(deg, range) {
		if(deg < 0) deg += range;
		return Math.abs(deg % range);
	};

	var xIsInRange = function(x, a, b) {
		return (x >= a && x <= b) || (x <= a && x >= b);
	};


	return function(options) {

			return new Promise(
				function(resolve, reject) {

					// find turn range
					var range = high-low;

					// check whether angle should be calculated
					if(isUndefined(options.angle) && !areUndefined([options.x, options.y])) {
						options.angle = getAngleFromCoord(options.x, options.y);
					}

					// check whether direction should be detected
					if(isUndefined(options.turnClockwise)) {
						options.turnClockwise = angleDiffs(normaliseAngle(this.getRepresentation().rotation(), range), options.angle, range)[0] > 0;
					}

					// check whether an angle delta has been input
					if (isUndefined(options.angleDelta)) {
						options.angle = this.getRepresentation().rotation() + options.turnClockwise ? options.angle : -options.angle;
					}

					// check if speed should be set to default
					if(isUndefined(options.speed)) {
						options.speed = 1;
					}


					if(!isUndefined(options.angle)){

						// stop current turning
						if(!isUndefined(this.turnAnim) && this.turnAnim.isRunning()) {
							this.turnAnim.stop();
						}


						this.turnAnim = new kinetic.Animation(function(frame) {

							// find this frames rotation
							var curRotation = normaliseAngle(this.getRepresentation().rotation(), range),
								delta = options.turnClockwise ? options.speed : - options.speed,
								nextRotation = normaliseAngle(curRotation + delta, range),
								normDeg = normaliseAngle(options.angle, range);

							// stop if reached this 
							if(xIsInRange(normDeg, curRotation, nextRotation) && curRotation + delta == nextRotation) {
								this.turnAnim.stop();
								resolve();
							}
							console.log("hi")

							// otherwhise perform turn and draw results to the parent
							this.getRepresentation().rotation(nextRotation);
							this.getRepresentation().parent.draw();

						}.bind(this)
					);

					// start turning!
					this.turnAnim.start();
				}

				else {
					console.log("Not enough inputs.");
				}
			}.bind(this)
		);
	};
};


Boat.prototype.turnBoat = turner(0, 360, {});

Boat.prototype.setSail = turner(this.sail, 0, 180, {});

// deg, speed, turnClockwise



var isUndefined = function(variable) {
	return typeof(variable) == 'undefined';
};

var areUndefined = function(array) {
	return array.reduce(function(previous, current) {
		return previous && isUndefined(current);
	}, true);
};

var hasUndefined = function(array) {
	return array.reduce(function(previous, current) {
		return previous || isUndefined(current);
	}, false);
};


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

var boat = new Boat();


Promise.all([boat.loadAssets()]).then(function(response) {

	boatsLayer.add(boat.getRepresentation());
	sailingArea.add(boatsLayer);

	Promise.all([ boat.turnBoat({ x : 10, y: 10 }) ]).then(function() {
		console.log("working");
	}).catch(function(a) {
		console.log(a.message)
	});

	document.getElementById('area').addEventListener('click', function(e) {

		var abs = boat.getRepresentation().getAbsolutePosition(),
			dx = e.clientX - abs.x,
			dy = abs.y - e.clientY;



		Promise.all([boat.turnBoat({ x : dx, y: dy})]);

	});
});
