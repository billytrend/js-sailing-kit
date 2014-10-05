var kinetic = require('kinetic');

var loadAssets = function() {
	return new Promise(function(resolve, reject){
		Promise.all(this.loadPromises).then(function(loaded) {
			loaded.forEach(function(element) {
				this.add(element);
			}.bind(this));
			resolve(this);
		}.bind(this)).catch(function(e) {
			console.log(e.message);
		});
	}.bind(this));
};

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

var getCoordFromAngle = function(deg, distance) {
	deg = toRad(deg - 90);
	return {
		x: distance * Math.cos(deg),
		y: distance * Math.sin(deg)
	};
};

var pythagorous = function(x, y) {
	return Math.sqrt(x*x + y*y); 
};

var mover = function(defaults) {


	return function(options) {
		return new Promise(function(resolve, reject) {

			// check if coordinates need calculating
			if(areUndefined([options.x, options.y]) && !areUndefined([options.angle, options.distance])) {
				var coords = getCoordFromAngle(options.angle, options.distance);
				options.x = coords.x;
				options.y = coords.y;
			}


			// sets speed to default if undefined
			if(isUndefined(options.speed)) {
				options.speed = 1;
			}

			if(isUndefined(options.distance)) {
				options.distance = pythagorous(options.x, options.y);
			}

			if(!areUndefined([options.x, options.y])) {
				// cancel any currently running animation on the target
				if(this.moveAnim !== undefined && this.moveAnim.isRunning()) {
					this.moveAnim.stop();
				}

				var travelled = 0;

				this.moveAnim = new kinetic.Animation(function(frame) {

					// check the distance hasn't been travelled
					if(xIsInRange(options.distance, travelled, travelled += options.speed)) {
						this.moveAnim.stop();
						resolve();
					}

					// move and draw the target by the unitVector 
					this.move({ x: (options.x*options.speed)/options.distance, y: -(options.y*options.speed)/options.distance });

					this.parent.draw();

					if(!isUndefined(options.dependantFns)){
						options.dependantFns.forEach(function(fn) {
							fn();
						});
					}

				}.bind(this));
				this.moveAnim.start();
			}
		}.bind(this));
	};
};

var turner = function(low, high, dependantFns) {

	return function(options) {
			var context = isUndefined(options.target) ? this : options.target

			var drawTarget = this.parent;
			while(drawTarget.nodeType != "Layer") {
				drawTarget = drawTarget.parent;
			}

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
						options.turnClockwise = angleDiffs(normaliseAngle(this.rotation(), range), options.angle, range)[0] >= 0;
					}

					// check whether an angle delta has been input
					if (!isUndefined(options.angleDelta)) {
						options.angle = this.rotation() + (options.turnClockwise ? -options.angleDelta : options.angleDelta);
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
							var curRotation = normaliseAngle(this.rotation(), range),
								delta = options.turnClockwise ? options.speed : - options.speed,
								nextRotation = normaliseAngle(curRotation + delta, range),
								normDeg = normaliseAngle(options.angle, range);

							// stop if reached this 
							if(xIsInRange(normDeg, curRotation, nextRotation) && curRotation + delta == nextRotation) {
								this.rotation(options.angle);
								drawTarget.draw();
								this.turnAnim.stop();
								resolve();
							}

							// otherwhise perform turn and draw results to the parent
							this.rotation(nextRotation);
							drawTarget.draw();

							if(!isUndefined(dependantFns)){
								dependantFns.forEach(function(fn) {
									fn();
								});
							}

							if(!isUndefined(options.dependantFns)){
								options.dependantFns.forEach(function(fn) {
									fn();
								});
							}

						}.bind(this)
					);

					// start turning!
					this.turnAnim.start();
				}

				else {
					console.log("Not enough inputs.");
				}
			}.bind(context)
		);
	};
};

var getNearestLayer = function(cur) {
	var drawTarget = cur.parent;
	while(drawTarget.nodeType != "Layer") {
		drawTarget = drawTarget.parent;
	};
	return drawTarget;
};

var flipSail = function() {
	this.scale({ y: this.scale().y * -1 });
	(getNearestLayer(this)).draw();
};

var checkSailSide = function() {
	var rot = this.rotation();
	var scale = this.scale().y;
	if(rot < 90 && rot >= 0 && scale == -1) this.flipSail();
	if(rot >= 90 && rot <= 180 && scale == 1) this.flipSail();
};

var correctSail = function(boat) {
	var rot = boat.rotation();
	if(rot > 0 && rot < 180) this.rotation(90-(rot/2));
	if(rot >= 180 && rot <=360) this.rotation((-rot/2) + 270);
	this.checkSailSide();
	(getNearestLayer(boat)).draw();
};

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


var buildBoat = function(properties) {

	boat = new kinetic.Group(properties);
	boat.hullImage = new Image();
	boat.sailImage = new Image();
	boat.sail = new kinetic.Image();

	boat.loadPromises = [
		new Promise(function(resolve, reject) {
			this.hullImage.onload = function() {
				this.hull = new kinetic.Image({
					image: this.hullImage,
					offsetX: 19,
					offsetY: 27
				});
				resolve(this.hull);
			}.bind(this);
			this.hullImage.src = '../assets/hull.png';

		}.bind(boat)),

		new Promise(function(resolve, reject) {
			this.sailImage.onload = function() {
				this.sail.setAttr('image', this.sailImage);
				this.sail.setAttr('offsetY', 10);
				resolve(this.sail);
			}.bind(this);
			this.sailImage.src = '../assets/main.png';
		}.bind(boat))
	];

	boat.loadAssets = loadAssets.bind(this);
	boat.moveBoat = mover({});
	boat.turnBoat = turner(0, 360);
	boat.loadAssets = loadAssets;

	boat.sail.flipSail = flipSail.bind(boat.sail);
	boat.sail.checkSailSide = checkSailSide.bind(boat.sail);
	boat.sail.setSail = turner(0, 180, [boat.sail.checkSailSide]);
	boat.sail.correctSail = correctSail.bind(boat.sail, boat);

	return boat;
};

module.exports.buildBoat = buildBoat;