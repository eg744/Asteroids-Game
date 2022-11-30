const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// canvas.width = '500';
// canvas.height = '700';

const FRAMERATE = 60;
const SHIP_HEIGHT_PX = 30;
const NUM_STARS = 10;
// Deg/sec
const SHIP_TURN_SPEED = 360;

// Draw scene framerate times per second. (use requestanimationframe)
// setInterval(updateCanvas, 1000 / FRAMERATE);

let playerShip = {
	radius: SHIP_HEIGHT_PX / 2,

	position: {
		// Center of canvas by default
		x: canvas.width / 2,
		y: canvas.height / 2,
		// ship heading: radians
		angle: (90 / 180) * Math.PI,
		rotation: 0,
	},

	shipThrusting: false,
	// Simulate momentum
	thrust: {
		x: 0,
		y: 0,
	},
};

function updateCanvas() {
	// ==Draw Background: "space"==
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

	// ==Draw Player Ship: (triangle)==
	ctx.strokeStyle = 'white';
	ctx.lineWidth = SHIP_HEIGHT_PX / 20;
	ctx.beginPath();

	// Head
	ctx.moveTo(
		playerShip.position.x +
			playerShip.radius * Math.cos(playerShip.position.angle),
		playerShip.position.y -
			playerShip.radius * Math.sin(playerShip.position.angle)
	);
	// Rear left
	ctx.lineTo(
		playerShip.position.x -
			playerShip.radius *
				(Math.cos(playerShip.position.angle) +
					Math.sin(playerShip.position.angle)),
		playerShip.position.y +
			playerShip.radius *
				(Math.sin(playerShip.position.angle) -
					Math.cos(playerShip.position.angle))
	);
	// Rear right
	ctx.lineTo(
		playerShip.position.x -
			playerShip.radius *
				(Math.cos(playerShip.position.angle) -
					Math.sin(playerShip.position.angle)),
		playerShip.position.y +
			playerShip.radius *
				(Math.sin(playerShip.position.angle) +
					Math.cos(playerShip.position.angle))
	);
	// Hypoteneuse
	ctx.closePath();
	ctx.stroke();

	// Rotate
	playerShip.position.angle += playerShip.position.rotation;

	// Ship thrust

	// dot
	ctx.fillStyle = 'red';
	ctx.fillRect(playerShip.position.x - 1, playerShip.position.y - 1, 2, 2);

	// Animate recursively
	requestAnimationFrame(updateCanvas);
}
// Call function when using requestanimationframe
updateCanvas();

function populateStars() {
	ctx.fillStyle = 'white';

	for (let i = 0; i < NUM_STARS; i++) {
		ctx.fillRect(
			Math.floor(Math.random() * canvas.width - 1),
			Math.floor(Math.random() * canvas.height - 1),
			2,
			2
		);
	}
}
populateStars();

console.log(playerShip.position.x);

function debounce(func, timeout = 300) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
}

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	updateCanvas();
}

// ==Event Listeners==
window.addEventListener('resize', debounce(resizeCanvas), false);

document.addEventListener('keydown', keyDownAction);
document.addEventListener('keyup', keyUpAction);

// Moving, rotating ship
function keyDownAction(event) {
	console.log(event.keyCode);
	switch (event.keyCode) {
		// Rotate left
		case 37:
			playerShip.position.rotation =
				((SHIP_TURN_SPEED / 180) * Math.PI) / FRAMERATE;
			break;
		// Thrust
		case 38:
			playerShip.shipThrusting = true;

			break;
		// Rotate right
		case 39:
			playerShip.position.rotation =
				((-SHIP_TURN_SPEED / 180) * Math.PI) / FRAMERATE;

			break;
	}
}

function keyUpAction(event) {
	// Stop actions
	switch (event.keyCode) {
		case 37:
			playerShip.position.rotation = 0;
			break;
		case 38:
			playerShip.shipThrusting = false;

			break;
		case 39:
			playerShip.position.rotation = 0;

			break;
	}
}
