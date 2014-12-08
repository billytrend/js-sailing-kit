var JsSailingKit = require('../index.js'),
	BoatVisuals = require('../js/BoatVisuals.js'),
	BoatMovements = require('../js/BoatMovements.js');

var area = new JsSailingKit({
	container: 'ex-1',
	width: 200,
	height: 150
});

area.addBoat({ x: 100, y: 75 }).then(function(boat) {
	console.log("going");
	BoatVisuals.showSternLine(boat);
}).catch(console.log);

var area = new JsSailingKit({
	container: 'ex-2',
	width: 200,
	height: 150
});

area.addBoat({ x: 100, y: 75 }).then(function(boat) {
	BoatMovements.turnBoat(boat, { x : 150, y : 150 }).then(function() {
		boat.sail.correctSail();
	}).catch(console.log);
});

var area = new JsSailingKit({
	container: 'ex-3',
	width: 200,
	height: 150
});

area.addBoat({ x: 100, y: 75 }).then(function(boat) {
	boat.turnBoat({ x : 10, y : 0, dependantFns : [boat.sail.correctSail], turnClockwise : false });
});

var area = new JsSailingKit({
	container: 'ex-4',
	width: 200,
	height: 150
});

area.addBoat({ x: 100, y: 75 }).then(function(boat) {
	document.getElementById('ex-4').addEventListener('click', function(e) {
		var abs = boat.getAbsolutePosition(),
			dx = e.offsetX - abs.x,
			dy = abs.y - e.offsetY;

		boat.turnBoat({ x : dx, y : dy, dependantFns : [boat.sail.correctSail], speed : 4 });
	});
});

var area = new JsSailingKit({
	container: 'ex-5',
	width: 800,
	height: 200
});

area.addBoat({ x: 100, y: 75 }).then(function(boat) {
	document.getElementById('ex-5').addEventListener('click', function(e) {
		var abs = boat.getAbsolutePosition(),
			dx = e.offsetX - abs.x,
			dy = abs.y - e.offsetY;

		Promise.all([
			boat.turnBoat({ x : dx, y : dy, dependantFns : [boat.sail.correctSail], speed : 8 }),
			boat.moveBoat({  x : dx, y : dy, speed : 4 })
		]);
	});
});

var area = new JsSailingKit({
	container: 'ex-6',
	width: 200,
	height: 150
});

area.addBoat({ x: 100, y: 75 })
	.then(BoatVisuals.makeImage)
	.then(function(image) {
		console.log(image);
		document.getElementById('eg-img').appendChild(image);
	})
	.catch(console.log);