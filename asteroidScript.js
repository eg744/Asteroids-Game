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

// Default player ship values
const SHIP_HEIGHT_PX = 30;
// Deg/sec
const SHIP_TURN_SPEED = 180;
// Acceleration per second
const SHIP_THRUST_SPEED_PX = 1;
const SHIP_MAX_THRUST_SPEED = 7;

// Default asteroid values
const ASTEROIDS_NUMBER = 5;
const ASTEROIDS_SIZE_PX = 100;
const ASTEROID_SHAPE_VARIATION = 0.5;
const ASTEROIDS_VERTEX_AVG = 10;
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
let currentAsteroidsArray = [];

function createNewAsteroid(x, y) {
	let asteroid = {
		radius: ASTEROIDS_SIZE_PX / 2,
		// Each vertex 1 radius from center point
		vertices: Math.floor(
			Math.random() * (ASTEROIDS_VERTEX_AVG + 1) +
				ASTEROIDS_VERTEX_AVG / 2
		),
		// Add variation to vertices
		offset: [],
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
		},
	};
	// Vertex offsets: random multiplier to radius (between default and 2 * radius)
	for (let i = 0; i < asteroid.vertices; i++) {
		asteroid.offset.push(
			Math.random() * ASTEROID_SHAPE_VARIATION * 2 +
				1 -
				ASTEROID_SHAPE_VARIATION
		);
	}
	return asteroid;
}

function asteroidDistanceAllowed(shipX, shipY, asteroidX, asteroidY) {
	// Square root of square of distance between the player and generated asteroids
	return Math.sqrt(
		Math.pow(asteroidX - shipX, 2) + Math.pow(asteroidY - shipY, 2)
	);
}

function createAsteroidsArray() {
	// Empty
	currentAsteroidsArray = [];
	let asteroidX, asteroidY;
	for (let i = 0; i < ASTEROIDS_NUMBER; i++) {
		// Generate asteroids within allowed space around player
		do {
			asteroidX = Math.floor(Math.random() * canvas.width);
			asteroidY = Math.floor(Math.random() * canvas.height);
		} while (
			asteroidDistanceAllowed(
				playerShip.position.x,
				playerShip.position.y,
				asteroidX,
				asteroidY
			) <
			ASTEROIDS_SIZE_PX * 2 + playerShip.radius
		);

		currentAsteroidsArray.push(createNewAsteroid(asteroidX, asteroidY));
	}
}

createAsteroidsArray();
console.log(currentAsteroidsArray);

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
	currentAsteroidsArray.forEach((asteroid) => {
		// Path
		ctx.beginPath();
		// Center of asteroid

		ctx.moveTo(
			asteroid.position.x +
				asteroid.radius *
					asteroid.offset[0] *
					Math.cos(asteroid.position.angle),
			asteroid.position.y +
				asteroid.radius *
					asteroid.offset[0] *
					Math.sin(asteroid.position.angle)
		);
		// Draw Polygon: number of vertices
		for (let i = 1; i < asteroid.vertices; i++) {
			// Line to each corner of polygon
			ctx.lineTo(
				asteroid.position.x +
					asteroid.radius *
						asteroid.offset[i] *
						Math.cos(
							asteroid.position.angle +
								// Modified for degrees in each angle
								(i * Math.PI * 2) / asteroid.vertices
						),
				asteroid.position.y +
					asteroid.radius *
						asteroid.offset[i] *
						Math.sin(
							asteroid.position.angle +
								(i * Math.PI * 2) / asteroid.vertices
						)
			);
		}
		ctx.closePath();
		ctx.stroke();

		// Asteroid movement

		asteroid.position.x += asteroid.position.xVelocity;
		asteroid.position.y += asteroid.position.yVelocity;

		// Edge detection, loop on other side
		if (asteroid.position.x < 0 - asteroid.radius) {
			asteroid.position.x = canvas.width + asteroid.radius;
		} else if (asteroid.position.x > canvas.width + asteroid.radius) {
			asteroid.position.x = 0 - asteroid.radius;
		}

		if (asteroid.position.y < 0 - asteroid.radius) {
			asteroid.position.y = canvas.height + asteroid.radius;
		} else if (asteroid.position.y > canvas.height + asteroid.radius) {
			asteroid.position.y = 0 - asteroid.radius;
		}
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
		// Space: shoot
		case 32:
			isShooting = true;
			break;
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
		case 32:
			isShooting = false;
			break;
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
