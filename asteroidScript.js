const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let screenCoordX = window.innerWidth;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// canvas.width = '500';
// canvas.height = '700';

// ==Globals==
const FRAMERATE = 60;
// Slow object speed: 1 = base speed
const FRICTION = 0.7;
const SHIP_HEIGHT_PX = 30;
// Deg/sec
const SHIP_TURN_SPEED = 360;
// Acceleration per second
const SHIP_THRUST_SPEED_PX = 1;
const SHIP_MAX_THRUST_SPEED = 7;

// Default asteroid
const ASTEROIDS_NUMBER = 3;
const ASTEROIDS_SIZE = 100;
// Avg vertices for each asteroid
const ASTEROIDS_VERTEX = 10;
// Max acceleration per second
const ASTEROID_SPEED_PX = 20;

// Background stars
const NUM_STARS = 10;

// Draw scene framerate times per second. (use requestanimationframe)
// setInterval(updateCanvas, 1000 / FRAMERATE);

// ==Objects==
let playerShip = {
	radius: SHIP_HEIGHT_PX / 2,
	isAlive: true,
	lives: 3,
	isShooting: false,

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

// ==Asteroids==
let currentAsteroids = [];

function createNewAsteroid(x, y) {
	let asteroid = {
		radius: ASTEROIDS_SIZE / 2,
		position: {
			x: x,
			y: y,
			// Velocities applied to each asteroid: if random value > .5, velocity applied to positive direction else negative direction
			xVelocity:
				((Math.random() * ASTEROID_SPEED_PX) / FRAMERATE) *
				(Math.random() < 0.5 ? 1 : -1),
			yVelocity:
				((Math.random() * ASTEROID_SPEED_PX) / FRAMERATE) *
				(Math.random() < 0.5 ? 1 : -1),
			// Radian heading
			angle: Math.random() * Math.PI * 2,
			vertex: Math.floor(
				Math.random() * (ASTEROIDS_VERTEX + 1) + ASTEROIDS_VERTEX / 2
			),
		},
	};
	return asteroid;
}

function createAsteroidsArray() {
	// Empty
	currentAsteroids = [];
	for (let i = 0; i < ASTEROIDS_NUMBER; i++) {
		let x = Math.floor(Math.random() * canvas.width);
		let y = Math.floor(Math.random() * canvas.height);

		currentAsteroids.push(createNewAsteroid(x, y));
	}
}

createAsteroidsArray();

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

	// Ship thrust state
	if (playerShip.shipThrusting) {
		// Accelerate along cos (X of ship's angle)
		playerShip.thrust.x +=
			(SHIP_THRUST_SPEED_PX * Math.cos(playerShip.position.angle)) /
			FRAMERATE;
		// Sin (Y)
		playerShip.thrust.y -=
			(SHIP_THRUST_SPEED_PX * Math.sin(playerShip.position.angle)) /
			FRAMERATE;

		// ==Draw thrust==
		ctx.strokeStyle = 'yellow';
		ctx.fillStyle = 'orange';
		ctx.lineWidth = SHIP_HEIGHT_PX / 10;
		ctx.beginPath();

		// left line thrust
		ctx.moveTo(
			playerShip.position.x -
				playerShip.radius *
					((2 / 3) * Math.cos(playerShip.position.angle) +
						0.5 * Math.sin(playerShip.position.angle)),

			playerShip.position.y +
				playerShip.radius *
					((2 / 3) * Math.sin(playerShip.position.angle) -
						0.5 * Math.cos(playerShip.position.angle))
		);
		// center line thrust
		ctx.lineTo(
			playerShip.position.x -
				playerShip.radius *
					(5 / 3) *
					Math.cos(playerShip.position.angle),
			playerShip.position.y +
				playerShip.radius *
					(5 / 3) *
					Math.sin(playerShip.position.angle)
		);
		// right line thrust
		ctx.lineTo(
			playerShip.position.x -
				playerShip.radius *
					((2 / 3) * Math.cos(playerShip.position.angle) -
						0.5 * Math.sin(playerShip.position.angle)),

			playerShip.position.y +
				playerShip.radius *
					((2 / 3) * Math.sin(playerShip.position.angle) +
						0.5 * Math.cos(playerShip.position.angle))
		);
		// closepath if i want a triangle, looks fine without for thruster.
		// ctx.closePath();
		ctx.fill();
		ctx.stroke();
	} else {
		// Apply friction to ship if not accelerating
		playerShip.thrust.x -= (FRICTION * playerShip.thrust.x) / FRAMERATE;
		playerShip.thrust.y -= (FRICTION * playerShip.thrust.y) / FRAMERATE;
	}

	// Move on canvas
	playerShip.position.x += playerShip.thrust.x;
	playerShip.position.y += playerShip.thrust.y;

	// Keep player on screen, loops back into view.
	// X
	if (playerShip.position.x < 0 - playerShip.radius) {
		playerShip.position.x = canvas.width + playerShip.radius;
	} else if (playerShip.position.x > canvas.width + playerShip.radius) {
		playerShip.position.x = 0 - playerShip.radius;
	}
	// Y
	if (playerShip.position.y < 0 - playerShip.radius) {
		playerShip.position.y = canvas.height + playerShip.radius;
	} else if (playerShip.position.y > canvas.height + playerShip.radius) {
		playerShip.position.y = 0 - playerShip.radius;
	}

	// dot cockpit
	ctx.fillStyle = 'white';
	ctx.fillRect(playerShip.position.x - 1, playerShip.position.y - 1, 2, 2);

	// ==Draw asteroids==
	ctx.strokeStyle = 'slategrey';
	ctx.lineWidth = SHIP_HEIGHT_PX / 20;
	currentAsteroids.forEach((asteroid) => {
		// let asteroidPosX =
		// Path
		// ctx.beginPath();
		// ctx.moveTo();
		// Polygon
		// Asteroid
		// Edge detection
	});

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

function setObjectsOnResize() {
	playerShip.position.x = canvas.width / 2;
	playerShip.position.y = canvas.height / 2;
}

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	setObjectsOnResize();
	updateCanvas();
}

// ==Event Listeners==
window.addEventListener('resize', debounce(resizeCanvas), false);

document.addEventListener('keydown', keyDownAction);
document.addEventListener('keyup', keyUpAction);

// Moving, rotating ship
function keyDownAction(event) {
	console.log(event);
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
		// Brake
		case 40:
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
			playerShip.thrust.x +=
				(SHIP_THRUST_SPEED_PX * Math.cos(playerShip.position.angle)) /
				FRAMERATE;
			playerShip.thrust.y +=
				(SHIP_THRUST_SPEED_PX * Math.sin(playerShip.position.angle)) /
				FRAMERATE;

			break;
		case 39:
			playerShip.position.rotation = 0;

			break;
	}
}
