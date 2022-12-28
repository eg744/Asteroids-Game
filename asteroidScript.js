const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
const SHIP_DEATH_TIME = 0.3;
const SHIP_INVULNERABLE_TIME = 3;
const SHIP_BLINK_TIME = 0.3;

// Player ship shot values
const PLAYER_SHOTS_MAX = 10;
const PLAYER_SHOT_HEIGHT = 5;
const PLAYER_SHOT_SPEED_PX = 5;
const PLAYER_SHOT_CONTACT_TIME = 0.02;

// Default asteroid values
const ASTEROIDS_NUMBER = 5;
const ASTEROIDS_SIZE_PX = 100;
const ASTEROIDS_HEIGHT_PX = 30;
const ASTEROID_SHAPE_VARIATION = 0.5;
const ASTEROIDS_VERTEX_AVG = 10;
// Max acceleration per second
const ASTEROID_SPEED_PX = 20;

// Development values
const SHOW_COLLISION = false;

// Background stars
const NUM_STARS = 10;

// Default game params
let level, currentAsteroidsArray, playerShip;
// let currentAsteroidsArray = [];
newGame();

function newGame() {
	// ==Player ship==
	// Default
	playerShip = createNewPlayerShip(
		canvas.width / 2,
		canvas.height / 2,
		SHIP_HEIGHT_PX / 2
	);

	level = 0;

	newLevel();

	function newLevel() {
		createAsteroidsArray();
	}

	// console.log('asteroids', currentAsteroidsArray);
}

function createNewPlayerShip(xPosition, yPosition, radius) {
	// playerShip = {
	// 	radius: SHIP_HEIGHT_PX / 2,
	// 	isAlive: true,
	// 	lives: 33,
	// 	deathTimer: 0,
	// 	isShooting: false,

	// 	position: {
	// 		x: canvas.width / 2,
	// 		y: canvas.height / 2,

	// 		angle: (90 / 180) * Math.PI,
	// 		rotation: 0,
	// 	},

	// 	shipThrusting: false,
	// 	thrust: {
	// 		x: 0,
	// 		y: 0,
	// 	},
	// };
	return {
		radius: radius,
		isAlive: true,
		lives: 33,
		deathTimer: 0,
		blinkingTime: Math.ceil(SHIP_BLINK_TIME * FRAMERATE),
		blinkingCount: Math.ceil(SHIP_INVULNERABLE_TIME / SHIP_BLINK_TIME),

		isShooting: false,
		shootingAllowed: true,
		currentShots: [],

		position: {
			x: xPosition,
			y: yPosition,

			angle: (90 / 180) * Math.PI,
			rotation: 0,
		},

		shipThrusting: false,
		thrust: {
			x: 0,
			y: 0,
		},
	};
}

// ==Shooting==
function playerShot() {
	if (
		playerShip.shootingAllowed &&
		playerShip.currentShots.length < PLAYER_SHOTS_MAX
	) {
		playerShip.currentShots.push({
			x:
				playerShip.position.x +
				playerShip.radius * Math.cos(playerShip.position.angle),
			y:
				playerShip.position.y -
				playerShip.radius * Math.sin(playerShip.position.angle),

			xVelocity:
				(PLAYER_SHOT_SPEED_PX * Math.cos(playerShip.position.angle)) /
				FRAMERATE,
			yVelocity:
				-(PLAYER_SHOT_SPEED_PX * Math.sin(playerShip.position.angle)) /
				FRAMERATE,
			rotation: playerShip.position.angle / 360,
			contactTime: 0,
		});
	}
	playerShip.shootingAllowed = false;
	console.log(playerShip.currentShots);
	console.log(playerShip.position.angle);
}

function updateShipDeathState() {
	playerShip.deathTimer = Math.ceil(SHIP_DEATH_TIME * FRAMERATE);
}
function applyShipFriction() {
	playerShip.thrust.x -= (FRICTION * playerShip.thrust.x) / FRAMERATE;
	playerShip.thrust.y -= (FRICTION * playerShip.thrust.y) / FRAMERATE;
}

// ==Asteroids==

function createNewAsteroid(x, y, radius) {
	let asteroidLevelModifier = 1 + 0.1 * level;

	let asteroid = {
		radius: radius,
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
			// Velocities increase with time as level increments
			xVelocity:
				((Math.random() * ASTEROID_SPEED_PX * asteroidLevelModifier) /
					FRAMERATE) *
				(Math.random() < 0.5 ? 1 : -1),
			yVelocity:
				((Math.random() * ASTEROID_SPEED_PX * asteroidLevelModifier) /
					FRAMERATE) *
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

function asteroidDistanceCalculated(shipX, shipY, asteroidX, asteroidY) {
	// Square root of square of distance between the object (currently player ship and shots) and generated asteroids
	return Math.sqrt(
		Math.pow(asteroidX - shipX, 2) + Math.pow(asteroidY - shipY, 2)
	);
}

function createAsteroidsArray() {
	// Empty
	currentAsteroidsArray = [];
	let asteroidX, asteroidY;
	// Increase number of asteroids present with each level
	for (let i = 0; i < ASTEROIDS_NUMBER + level; i++) {
		// Generate asteroids within allowed space around player
		do {
			asteroidX = Math.floor(Math.random() * canvas.width);
			asteroidY = Math.floor(Math.random() * canvas.height);
		} while (
			asteroidDistanceCalculated(
				playerShip.position.x,
				playerShip.position.y,
				asteroidX,
				asteroidY
			) <
			ASTEROIDS_SIZE_PX * 2 + playerShip.radius
		);

		currentAsteroidsArray.push(
			createNewAsteroid(
				asteroidX,
				asteroidY,
				Math.ceil(ASTEROIDS_SIZE_PX / 2)
			)
		);
	}
}

function handleAsteroidSplit(index) {
	let asteroidX = currentAsteroidsArray[index].position.x;
	let asteroidY = currentAsteroidsArray[index].position.y;
	let oldRadius = currentAsteroidsArray[index].radius;

	// Asteroid possible to split
	if (oldRadius > 0 && currentAsteroidsArray.length !== 0) {
		switch (true) {
			case oldRadius == Math.ceil(ASTEROIDS_SIZE_PX / 2):
				// Replace with 2 smaller asteroids
				currentAsteroidsArray.splice(index, 1);

				currentAsteroidsArray.push(
					createNewAsteroid(asteroidX, asteroidY, oldRadius / 2)
				);
				currentAsteroidsArray.push(
					createNewAsteroid(asteroidX, asteroidY, oldRadius / 2)
				);

				break;

			case oldRadius == Math.ceil(ASTEROIDS_SIZE_PX / 4):
				currentAsteroidsArray.splice(index, 1);

				currentAsteroidsArray.push(
					createNewAsteroid(asteroidX, asteroidY, oldRadius / 4)
				);
				currentAsteroidsArray.push(
					createNewAsteroid(asteroidX, asteroidY, oldRadius / 4)
				);

				break;

			// Fully destroyed
			default:
				currentAsteroidsArray.splice(index, 1);

				break;
		}
	} else {
		// Asteroids destroyed, make new harder ones
		level++;
		newLevel();
	}
	console.log('oldradius', oldRadius, 'ht', Math.ceil(ASTEROIDS_SIZE_PX / 2));
}

function updateCanvas() {
	// Timer bool: player is losing. If countdown reaches 0, life lost
	let playerLossStateTime = playerShip.deathTimer > 0;

	// Player invulnerability signaled by blink on even intervals: draw ship
	let playerBlinkingOn = playerShip.blinkingCount % 2 == 0;

	// ==Draw Background: "space"==
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// ==Draw Player Ship: (triangle) while player alive==
	if (!playerLossStateTime) {
		if (playerBlinkingOn) {
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
			ctx.closePath();
			ctx.stroke();

			// dot cockpit
			ctx.fillStyle = 'white';
			ctx.fillRect(
				playerShip.position.x - 1,
				playerShip.position.y - 1,
				2,
				2
			);
		}
		// Draw player shots
		playerShip.currentShots.forEach((shot) => {
			// Shot not in contact with object
			if (shot.contactTime == 0) {
				// ctx.fillStyle = 'red';
				ctx.strokeStyle = 'red';
				ctx.beginPath();
				// Line shot or circle shot
				ctx.moveTo(shot.x, shot.y);
				ctx.lineTo(
					shot.x + shot.rotation + PLAYER_SHOT_HEIGHT,
					shot.y - shot.rotation + PLAYER_SHOT_HEIGHT
				);
				// ctx.arc(shot.x, shot.y, SHIP_HEIGHT_PX / 15, 0, Math.PI * 2, false);
				// ctx.fill();

				ctx.closePath();
				ctx.stroke();
			} else {
				// Shot contact graphic
				ctx.fillStyle = 'red';
				ctx.beginPath();
				ctx.arc(
					shot.x,
					shot.y,
					playerShip.radius * 0.75,
					0,
					Math.PI * 2,
					false
				);
				ctx.fill();

				ctx.fillStyle = 'orangered';
				ctx.beginPath();
				ctx.arc(
					shot.x,
					shot.y,
					playerShip.radius * 0.5,
					0,
					Math.PI * 2,
					false
				);
				ctx.fill();

				ctx.fillStyle = 'orange';
				ctx.beginPath();
				ctx.arc(
					shot.x,
					shot.y,
					playerShip.radius * 0.25,
					0,
					Math.PI * 2,
					false
				);
				ctx.fill();
			}
		});

		if (playerShip.blinkingCount > 0) {
			// Reduce blink time until not invulnerable
			playerShip.blinkingTime--;
			if (playerShip.blinkingTime == 0) {
				playerShip.blinkingTime = Math.ceil(
					SHIP_BLINK_TIME * FRAMERATE
				);
				playerShip.blinkingCount--;
			}
		}
	} else {
		// Loss state graphic
		ctx.fillStyle = 'red';
		ctx.beginPath();
		ctx.arc(
			playerShip.position.x,
			playerShip.position.y,
			playerShip.radius * 1.7,
			0,
			2 * Math.PI,
			false
		);
		ctx.fill();

		ctx.fillStyle = 'orange';
		ctx.beginPath();
		ctx.arc(
			playerShip.position.x,
			playerShip.position.y,
			playerShip.radius * 1.4,
			0,
			2 * Math.PI,
			false
		);
		ctx.fill();

		ctx.fillStyle = 'yellow';
		ctx.beginPath();
		ctx.arc(
			playerShip.position.x,
			playerShip.position.y,
			playerShip.radius * 1,
			0,
			2 * Math.PI,
			false
		);
		ctx.fill();

		ctx.stroke();
	}

	if (SHOW_COLLISION) {
		ctx.strokeStyle = 'green';
		ctx.beginPath();
		ctx.arc(
			playerShip.position.x,
			playerShip.position.y,
			playerShip.radius,
			0,
			2 * Math.PI,
			false
		);
		ctx.stroke();
	}

	if (!playerLossStateTime) {
		// Player invulnerable while in blinking state after collision
		if (playerShip.blinkingCount == 0) {
			currentAsteroidsArray.forEach((asteroid, index) => {
				// Player colliding with asteroid
				if (
					asteroidDistanceCalculated(
						playerShip.position.x,
						playerShip.position.y,
						asteroid.position.x,
						asteroid.position.y
					) <
					playerShip.radius + asteroid.radius
				) {
					handleAsteroidSplit(index);
					updateShipDeathState();
				}
			});
		}

		// Rotate ship
		playerShip.position.angle += playerShip.position.rotation;

		// Ship thrust state
		if (playerShip.shipThrusting && playerBlinkingOn) {
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
			applyShipFriction();
		}
	} else {
		playerShip.deathTimer--;
		if (playerShip.deathTimer == 0) {
			updateShipDeathState();

			playerShip = createNewPlayerShip(
				canvas.width / 2,
				canvas.height / 2,
				SHIP_HEIGHT_PX / 2
			);
		}
		applyShipFriction();
	}
	// Move player on canvas
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

	// Player shot movement
	for (let i = 0; i < playerShip.currentShots.length; i++) {
		// Remove shots as they exit play area
		if (
			playerShip.currentShots[i].x < 0 ||
			playerShip.currentShots[i].x > canvas.width
		) {
			playerShip.currentShots.splice(i, 1);
		} else if (
			playerShip.currentShots[i].y < 0 ||
			playerShip.currentShots[i].y > canvas.height
		) {
			playerShip.currentShots.splice(i, 1);
		}

		// Handle shot contact for animation
		playerShip.currentShots.forEach((shot) => {
			console.log('shot contact', shot.contactTime);
			// Remove shots as they exit play area
			if (shot.x < 0 || shot.x > canvas.width) {
				playerShip.currentShots.splice(shot, 1);
			} else if (shot.y < 0 || shot.y > canvas.height) {
				playerShip.currentShots.splice(shot, 1);
			}

			// Handle shot contact for animation
			if (shot.contactTime > 0) {
				//Making contact
				shot.contactTime--;
				playerShip.currentShots.splice(shot, 1);
			} else {
				// Move shot
				shot.x += shot.xVelocity * FRAMERATE;
				shot.y += shot.yVelocity * FRAMERATE;
			}
		});
	}

	// Collision between player shots and asteroids
	// Loop by first inserted asteroids, player shots
	for (let i = currentAsteroidsArray.length - 1; i >= 0; i--) {
		for (let j = playerShip.currentShots.length - 1; j >= 0; j--) {
			if (
				// Shot, laser not finished colliding
				playerShip.currentShots[j].contactTime == 0 &&
				asteroidDistanceCalculated(
					currentAsteroidsArray[i].position.x,
					currentAsteroidsArray[i].position.y,
					playerShip.currentShots[j].x,
					playerShip.currentShots[j].y
				) < currentAsteroidsArray[i].radius
			) {
				// Remove shot: free space for shots on screen
				// playerShip.currentShots.splice(j, 1);

				// Break/destroy asteroid and show collision with laser
				handleAsteroidSplit(i);
				playerShip.currentShots[j].contactTime = Math.ceil(
					PLAYER_SHOT_CONTACT_TIME * FRAMERATE
				);
				// currentAsteroidsArray.splice(i, 1);
				break;
			}
		}
	}

	// ==Draw asteroids==
	ctx.lineWidth = ASTEROIDS_HEIGHT_PX / 20;
	currentAsteroidsArray.forEach((asteroid) => {
		// ctx.strokeStyle = 'slategrey';
		ctx.strokeStyle = '#807a6f';

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

		if (SHOW_COLLISION) {
			ctx.strokeStyle = 'green';
			ctx.beginPath();
			ctx.arc(
				asteroid.position.x,
				asteroid.position.y,
				asteroid.radius,
				0,
				Math.PI * 2,
				false
			);
			ctx.stroke();
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
	// console.log(event);
	switch (event.keyCode) {
		// Space: shoot
		case 32:
			isShooting = true;
			playerShot();

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
			isShooting = true;
			playerShot();
			break;
	}
}

function keyUpAction(event) {
	// Stop actions
	switch (event.keyCode) {
		case 32:
			isShooting = false;
			playerShip.shootingAllowed = true;

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
		case 40:
			isShooting = false;
			playerShip.shootingAllowed = true;
			break;
	}
}
