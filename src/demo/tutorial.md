# js-sailing-kit

Here is a demo of my sailing boat animation library version 0.1. It is designed to allow easy animation of sailing boats in the HTML canvas. The last two examples show how the library can be used to realistically animate boats. Refresh the page to restart the animations.

<div class="water" id="ex-1"></div>

*Initialise the sailing area and load a boat.*

	var area = new JsSailingKit({
		container: 'ex-1',
		width: 200,
		height: 150,
	});

	area.addBoat({ x: 100, y: 75 });


<div class="water" id="ex-2"></div>

*Perform animations and chain them using Promise syntax.*

	area.addBoat({ x: 100, y: 75 }).then(function(boat) {
		boat.turnBoat({ x : 150, y : 150 }).then(function() {
			boat.sail.correctSail();
		});
	});

<div class="water" id="ex-3"></div>

*Attach 'dependant functions' which run each time the boats position is changed. This can be used to update the sail position.*

	area.addBoat({ x: 100, y: 75 }).then(function(boat) {
		boat.turnBoat({ x : 10, y : 0, dependantFns : [boat.sail.correctSail], turnClockwise : false });
	});

<div class="water" id="ex-4"></div>

*Control the boat based on mouse actions. Click anywhere to head the boad to your mouse and set the sail correctly.*

	area.addBoat({ x: 100, y: 75 }).then(function(boat) {
		document.getElementById('ex-4').addEventListener('click', function(e) {
			var abs = boat.getAbsolutePosition(),
				dx = e.offsetX - abs.x,
				dy = abs.y - e.offsetY;

			boat.turnBoat({ x : dx, y : dy, dependantFns : [boat.sail.correctSail], speed : 4 });
		});
	});


<div class="water" id="ex-5"></div>

*Control the boat based on mouse actions. Click anywhere to sail the boat to that position.*

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

<div class="water" id="ex-6"></div>

Image apears below:

<div id="eg-img"></div>

*Initialise the sailing area and load a boat.*

	var area = new JsSailingKit({
		container: 'ex-1',
		width: 200,
		height: 150,
	});

	area.addBoat({ x: 100, y: 75 });


<script type="text/javascript" src="demo.js"></script>
<style type="text/css">
	.water {
		background-color: lightblue;
		width: auto;
		display: inline-block;
		border: 1 gray solid;
	}
</style>