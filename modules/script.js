import { MyMatrix, MyNeuralNetwork } from './ai-player.js';

// Note: when using modules that access globals, attach vars to window
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
const SHIP_TURN_SPEED = 100;
// Acceleration per second
const SHIP_THRUST_SPEED_PX = 1;
const SHIP_MAX_THRUST_SPEED = 7;
const SHIP_DEATH_TIME = 0.3;
const SHIP_INVULNERABLE_TIME = 3;
const SHIP_BLINK_TIME = 0.3;
const SHIP_LIVES_DEFAULT = 3;

// Player ship shot values
const PLAYER_SHOTS_MAX = 10;
const PLAYER_SHOT_HEIGHT = 5;
const PLAYER_SHOT_SPEED_PX = 5;
const PLAYER_SHOT_CONTACT_TIME = 0.02;

// Default asteroid values
const ASTEROIDS_NUMBER = 1;
const ASTEROIDS_SIZE_PX = 100;
const ASTEROIDS_HEIGHT_PX = 30;
const ASTEROID_SHAPE_VARIATION = 0.5;
const ASTEROIDS_VERTEX_AVG = 10;
// Max acceleration per second
const ASTEROID_SPEED_PX = 20;

// Asteroid point values
const ASTEROID_POINTS_LARGE = 5;
const ASTEROID_POINTS_MEDIUM = 8;
const ASTEROID_POINTS_SMALL = 10;

// Development values
const SHOW_COLLISION = false;

// ==Computer player values==
const COMPUTER_ACTIVE = false;
const NUM_INPUTS = 2;
const NUM_HIDDEN = 5;
// 1 bool output (turn left or right)
const NUM_OUTPUTS = 1;
const NUM_TRAINING_SAMPLES = 10000;

// Game text values
const TEXT_FADE_TIME = 6;
const TEXT_SIZE = 30;

// Localstorage save key
const LOCAL_ASTEROIDS_HIGH_SCORE = 'highScore';

// Background stars
const NUM_STARS = 100;

// Start screen initial state
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Default game params
let level,
	currentAsteroidsArray,
	playerShip,
	lives,
	playerScoreText,
	playerHighScore,
	highScoreText,
	// gameStateText,
	gameLevelText,
	currentPoints,
	textAlpha;

function activateComputerPlayer() {
	let aiPlayer;
	if (COMPUTER_ACTIVE) {
		aiPlayer = new MyNeuralNetwork(NUM_INPUTS, NUM_HIDDEN, NUM_OUTPUTS);
		let asteroidX, asteroidY, shipAngle, shipX, shipY;
		for (let i = 0; i < NUM_TRAINING_SAMPLES; i++) {
			// Random positions of asteroids
			// Check off-screen asteroids up to its radius. (subtract radius)
			asteroidX =
				Math.random() * (canvas.width + ASTEROIDS_SIZE_PX) -
				ASTEROIDS_SIZE_PX / 2;
			asteroidY =
				Math.random() * (canvas.height + ASTEROIDS_SIZE_PX) -
				ASTEROIDS_SIZE_PX / 2;

			// Ship position, angle
			shipX = playerShip.position.x;
			shipY = playerShip.position.y;
			shipAngle = Math.random() * Math.PI * 2;

			// Angle to asteroid
			let angleToAsteroid = findAngleToPoint(
				shipX,
				shipY,
				shipAngle,
				asteroidX,
				asteroidY
			);
		}

		// console.table(aiPlayer.weight0.data);
		// console.table(aiPlayer.weight1.data);
		// let matrix0 = new MyMatrix(2, 3, [2, 1, -1], [4, 3, 0]);
		// matrix0.randomizeWeight();
		// console.table(matrix0.data);
	}
}
// Calling newgame here to get ship obj positional data
newGame();

// activateComputerPlayer();

// Calculate angle between given coordinates (current and target coordinates)
function findAngleToPoint(x, y, bearing, targetX, targetY) {
	// Inverse tan: (use atan2 where 4 quadrants in coordinate space)
	let angleToTarget = Math.atan2(-targetY + y, targetX - x);
	let difference = bearing - angleToTarget;
	// Add 360deg to maintain same angle position with positive number. Modulus 360deg will return result between 0, 360deg in radians
	return (difference + Math.PI * 2) % (Math.PI * 2);
}

function neuralNetworkXORTest() {
	aiPlayer = new MyNeuralNetwork(NUM_INPUTS, NUM_HIDDEN, NUM_OUTPUTS);

	// Training neural network with XOR logic
	// 0 0 = 0, 0 1 = 1, 1 0 = 1, 1 1 = 0
	for (let i = 0; i < NUM_TRAINING_SAMPLES; i++) {
		let input0 = Math.round(Math.random());
		let input1 = Math.round(Math.random());
		let output;
		if (input0 == input1) {
			output = 0;
		} else {
			output = 1;
		}

		aiPlayer.training([input0, input1], [output]);
	}
	console.log(`0 0 = ${aiPlayer.feedForward([0, 0]).data}`);
	console.log(`0 1 = ${aiPlayer.feedForward([0, 1]).data}`);
	console.log(`1 0 = ${aiPlayer.feedForward([1, 0]).data}`);
	console.log(`1 1 = ${aiPlayer.feedForward([1, 1]).data}`);
}

function onScreenText(text, alpha) {
	return {
		text: text,
		textAlpha: alpha,
	};
}
function startText() {
	// Give flourish (Ship drawn = A in Asteroids. I don't know if I want this, the positioning isn't right. Keep in mind.)
	const aShip = () => {
		ctx.save();
		ctx.translate(canvas.width * 0.372, canvas.height * 0.152);

		ctx.strokeStyle = 'white';
		ctx.lineWidth = SHIP_HEIGHT_PX / 8;
		ctx.beginPath();

		// Head
		ctx.moveTo(
			// canvas.width * 0.2 + (SHIP_HEIGHT_PX / 2) * Math.cos(0.5 * Math.PI),
			// canvas.height * 0.2 - (SHIP_HEIGHT_PX / 2) * Math.sin(0.5 * Math.PI)

			SHIP_HEIGHT_PX + (SHIP_HEIGHT_PX / 2) * Math.cos(0.5 * Math.PI),
			SHIP_HEIGHT_PX - (SHIP_HEIGHT_PX / 2) * Math.sin(0.5 * Math.PI)
		);

		// Rear left
		ctx.lineTo(
			SHIP_HEIGHT_PX -
				(SHIP_HEIGHT_PX / 2) *
					(Math.cos(0.5 * Math.PI) + Math.sin(0.5 * Math.PI)),
			SHIP_HEIGHT_PX +
				(SHIP_HEIGHT_PX / 2) *
					(Math.sin(0.5 * Math.PI) - Math.cos(0.5 * Math.PI))
		);
		// Rear right
		ctx.lineTo(
			SHIP_HEIGHT_PX -
				(SHIP_HEIGHT_PX / 2) *
					(Math.cos(0.5 * Math.PI) - Math.sin(0.5 * Math.PI)),
			SHIP_HEIGHT_PX +
				(SHIP_HEIGHT_PX / 2) *
					(Math.sin(0.5 * Math.PI) + Math.cos(0.5 * Math.PI))
		);
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	};
	// aShip();

	let gameTitleText = onScreenText('Asteroids');

	let gameStartText = onScreenText('Click to start');
	let gameMoveControlsText = onScreenText('Control with arrow keys or WAD');
	let gameShootControlsText = onScreenText(
		'Shoot with Space, arrow down or S'
	);

	ctx.fillStyle = `rgb(255,255,255) `;

	ctx.font = `bold ${TEXT_SIZE * 2}px Courier New`;

	ctx.fillText(gameTitleText.text, canvas.width * 0.4, canvas.height * 0.2);

	ctx.font = `bold ${TEXT_SIZE * 1.1}px Courier New`;

	ctx.fillText(gameStartText.text, canvas.width * 0.4, canvas.height * 0.5);

	ctx.font = `bold ${TEXT_SIZE}px Courier New`;

	ctx.fillText(
		gameMoveControlsText.text,
		canvas.width * 0.1,
		canvas.height * 0.8
	);
	ctx.fillText(
		gameShootControlsText.text,
		canvas.width * 0.1,
		canvas.height * 0.9
	);
}

function playerPointsText() {
	playerScoreText = onScreenText(`${currentPoints} points`);

	ctx.fillStyle = `rgb(255,255,255) `;
	ctx.font = `bold ${TEXT_SIZE}px Courier New`;

	ctx.fillText(
		playerScoreText.text,
		canvas.width * 0.75,
		canvas.height * 0.1
	);
}

function playerHighScoreText() {
	highScoreText = onScreenText(`High Score: ${playerHighScore}`);

	ctx.fillStyle = `rgb(255,255,255) `;
	ctx.font = `bold ${TEXT_SIZE * 0.5}px Courier New`;

	ctx.fillText(highScoreText.text, canvas.width * 0.8, canvas.height * 0.9);
}

// Call newgame(onclick)
// newGame();

function newGame() {
	// ==Player ship==
	// Default
	playerShip = createNewPlayerShip(
		canvas.width / 2,
		canvas.height / 2,
		SHIP_HEIGHT_PX / 2,
		SHIP_LIVES_DEFAULT
	);

	level = 0;
	currentPoints = 0;
	let initialHighScore = localStorage.getItem(LOCAL_ASTEROIDS_HIGH_SCORE);
	if (initialHighScore == null) {
		playerHighScore = 0;
	} else {
		playerHighScore = parseInt(initialHighScore);
	}

	newLevel();

	// console.log('asteroids', currentAsteroidsArray);
}
function newLevel() {
	gameLevelText = onScreenText(`Level ${level + 1}`, 1.0);
	createAsteroidsArray();
}
startText();

function createNewPlayerShip(xPosition, yPosition, radius, lives) {
	return {
		radius: radius,
		isAlive: true,
		lives: lives,
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

// Values for player to be drawn on canvas
function drawPlayerShip(x, y, angle, playerColor = 'white') {
	ctx.strokeStyle = playerColor;
	ctx.lineWidth = SHIP_HEIGHT_PX / 20;
	ctx.beginPath();

	// Head
	ctx.moveTo(
		x + playerShip.radius * Math.cos(angle),
		y - playerShip.radius * Math.sin(angle)
	);
	// Rear left
	ctx.lineTo(
		x - playerShip.radius * (Math.cos(angle) + Math.sin(angle)),
		y + playerShip.radius * (Math.sin(angle) - Math.cos(angle))
	);
	// Rear right
	ctx.lineTo(
		x - playerShip.radius * (Math.cos(angle) - Math.sin(angle)),
		y + playerShip.radius * (Math.sin(angle) + Math.cos(angle))
	);
	ctx.closePath();
	ctx.stroke();
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
			madeContact: false,
		});
	}
	playerShip.shootingAllowed = false;
	console.log(playerShip.currentShots);
	console.log(playerShip.position.angle);
}

function updateShipDeathState() {
	playerShip.deathTimer = Math.ceil(SHIP_DEATH_TIME * FRAMERATE);
}

function handleGameOver() {
	playerShip.isAlive = false;

	// Restart the game without base values being altered from calling updateCanvas multiple times.
	document.addEventListener('click', handleGameRestart);
}

function applyShipFriction() {
	playerShip.thrust.x -= (FRICTION * playerShip.thrust.x) / FRAMERATE;
	playerShip.thrust.y -= (FRICTION * playerShip.thrust.y) / FRAMERATE;
}

function calculatePlayerScore(asteroidSize) {
	if (
		currentPoints > Number.MIN_SAFE_INTEGER ||
		currentPoints < Number.MAX_SAFE_INTEGER
	) {
		switch (asteroidSize) {
			case 'large':
				currentPoints += ASTEROID_POINTS_LARGE;

				break;
			case 'medium':
				currentPoints += ASTEROID_POINTS_MEDIUM;

				break;
			case 'small':
				currentPoints += ASTEROID_POINTS_SMALL;

				break;

			default:
				break;
		}
		if (currentPoints > playerHighScore) {
			playerHighScore = currentPoints;
			// Save user's high score with localstorage
			localStorage.setItem(LOCAL_ASTEROIDS_HIGH_SCORE, playerHighScore);
		}
	}
}

// ==Asteroids==

function createNewAsteroid(x, y, radius, size) {
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
		size: size,
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
				Math.ceil(ASTEROIDS_SIZE_PX / 2),
				'large'
			)
		);
	}
}

function handleAsteroidSplit(index) {
	let asteroidX = currentAsteroidsArray[index].position.x;
	let asteroidY = currentAsteroidsArray[index].position.y;
	let oldRadius = currentAsteroidsArray[index].radius;
	let asteroidSize = currentAsteroidsArray[index].size;

	// Asteroid possible to split
	if (oldRadius > 0) {
		switch (true) {
			case oldRadius == Math.ceil(ASTEROIDS_SIZE_PX / 2):
				calculatePlayerScore(asteroidSize);
				// Replace with 2 smaller asteroids
				currentAsteroidsArray.splice(index, 1);

				currentAsteroidsArray.push(
					createNewAsteroid(
						asteroidX,
						asteroidY,
						oldRadius / 2,
						'medium'
					)
				);
				currentAsteroidsArray.push(
					createNewAsteroid(
						asteroidX,
						asteroidY,
						oldRadius / 2,
						'medium'
					)
				);

				break;

			case oldRadius == Math.ceil(ASTEROIDS_SIZE_PX / 4):
				calculatePlayerScore(asteroidSize);
				currentAsteroidsArray.splice(index, 1);

				currentAsteroidsArray.push(
					createNewAsteroid(
						asteroidX,
						asteroidY,
						oldRadius / 3,
						'small'
					)
				);
				currentAsteroidsArray.push(
					createNewAsteroid(
						asteroidX,
						asteroidY,
						oldRadius / 3,
						'small'
					)
				);

				break;

			// Fully destroyed
			default:
				calculatePlayerScore(asteroidSize);
				currentAsteroidsArray.splice(index, 1);

				break;
		}
	}
	// Asteroids destroyed, make new harder ones
	if (currentAsteroidsArray.length == 0) {
		level++;
		newLevel();
	}
}

// ==Update each frame==
function updateCanvas() {
	// Timer bool: player is losing. If countdown reaches 0, life lost
	let playerLossStateTime = playerShip.deathTimer > 0;

	// Player invulnerability signaled by blink on even intervals: draw ship
	let playerBlinkingOn = playerShip.blinkingCount % 2 == 0;

	// ==Draw Background: "space"==
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// ==Draw Player Ship: (triangle) while player alive==
	if (!playerLossStateTime && playerShip.isAlive) {
		if (playerBlinkingOn) {
			drawPlayerShip(
				playerShip.position.x,
				playerShip.position.y,
				playerShip.position.angle
			);
			// Initial ship state: keeping comment for now.
			// ctx.strokeStyle = 'white';
			// ctx.lineWidth = SHIP_HEIGHT_PX / 20;
			// ctx.beginPath();

			// // Head
			// ctx.moveTo(
			// 	playerShip.position.x +
			// 		playerShip.radius * Math.cos(playerShip.position.angle),
			// 	playerShip.position.y -
			// 		playerShip.radius * Math.sin(playerShip.position.angle)
			// );
			// // Rear left
			// ctx.lineTo(
			// 	playerShip.position.x -
			// 		playerShip.radius *
			// 			(Math.cos(playerShip.position.angle) +
			// 				Math.sin(playerShip.position.angle)),
			// 	playerShip.position.y +
			// 		playerShip.radius *
			// 			(Math.sin(playerShip.position.angle) -
			// 				Math.cos(playerShip.position.angle))
			// );
			// // Rear right
			// ctx.lineTo(
			// 	playerShip.position.x -
			// 		playerShip.radius *
			// 			(Math.cos(playerShip.position.angle) -
			// 				Math.sin(playerShip.position.angle)),
			// 	playerShip.position.y +
			// 		playerShip.radius *
			// 			(Math.sin(playerShip.position.angle) +
			// 				Math.cos(playerShip.position.angle))
			// );
			// ctx.closePath();
			// ctx.stroke();

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
				// if (shot.madeContact == false) {
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
				console.log('contact', shot.madeContact);
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
		if (
			playerShip.shipThrusting &&
			playerBlinkingOn &&
			playerShip.isAlive
		) {
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
		// Handle ship life logic
		playerShip.deathTimer--;
		if (playerShip.deathTimer == 0) {
			updateShipDeathState();
			if (playerShip.lives == 0) {
				handleGameOver();
			} else {
				playerShip = createNewPlayerShip(
					canvas.width / 2,
					canvas.height / 2,
					SHIP_HEIGHT_PX / 2,
					playerShip.lives - 1
				);
			}
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

	// Draw player lives
	let playerDamagedColor;
	for (let i = 0; i < playerShip.lives; i++) {
		// Visual indication ship takes damage, life is red
		playerDamagedColor =
			playerLossStateTime && i == playerShip.lives - 1 ? 'red' : 'white';
		// console.log('pldamg', playerDamagedColor);
		drawPlayerShip(
			SHIP_HEIGHT_PX + i * SHIP_HEIGHT_PX * 1.2,
			SHIP_HEIGHT_PX,
			0.5 * Math.PI,
			playerDamagedColor
		);
	}

	// Player shot movement
	// for (let i = 0; i < playerShip.currentShots.length; i++) {
	for (let i = playerShip.currentShots.length - 1; i >= 0; i--) {
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
				shot.madeContact = true;
				// Remove shot that makes contact
				if (shot.contactTime == 0) {
					playerShip.currentShots.splice(shot, 1);
				}
			} else {
				// Move shot
				shot.x += shot.xVelocity * FRAMERATE;
				shot.y += shot.yVelocity * FRAMERATE;
			}

			// Handle shot contact for animation
			if (shot.contactTime > 0) {
				//Making contact
				shot.contactTime--;
				shot.madeContact = true;
				console.log('made contact');
				// Remove shot that makes contact
				if (shot.contactTime == 0) {
					playerShip.currentShots.splice(shot, 1);
				}
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

				// Break/destroy asteroid and show collision with laser
				handleAsteroidSplit(i);
				playerShip.currentShots[j].contactTime = Math.ceil(
					PLAYER_SHOT_CONTACT_TIME * FRAMERATE
				);
				break;
			}
		}
	}

	// ==Draw asteroids==
	ctx.lineWidth = ASTEROIDS_HEIGHT_PX / 20;
	currentAsteroidsArray.forEach((asteroid) => {
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

	// Draw on screen level text
	if (gameLevelText.textAlpha >= 0 && playerShip.isAlive) {
		ctx.fillStyle = `rgba(255,255,255,${gameLevelText.textAlpha}) `;
		ctx.font = `bold ${TEXT_SIZE}px Courier New`;

		ctx.fillText(
			gameLevelText.text,
			canvas.width / 2.75,
			canvas.height * 0.1
		);
		// Fadeout text
		gameLevelText.textAlpha -= 1.0 / TEXT_FADE_TIME / (FRAMERATE * 2);
	} else if (!playerShip.isAlive) {
		let gameStateText = onScreenText('Game Over!');
		let gameRetryText = onScreenText('Click to try again.');

		ctx.fillStyle = `rgb(255,255,255) `;
		ctx.font = `bold ${TEXT_SIZE}px Courier New`;

		ctx.fillText(
			gameStateText.text,
			canvas.width / 2.75,
			canvas.height * 0.1
		);

		ctx.fillText(gameRetryText.text, canvas.width / 3, canvas.height * 0.2);
	}
	playerPointsText();
	playerHighScoreText();

	// Animate recursively
	requestAnimationFrame(updateCanvas);
}

// Call function when using requestanimationframe
// updateCanvas();

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
	newGame();
	// TODO: This canvas update modifies game speed values every change.
	updateCanvas();

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	setObjectsOnResize();
}

// ==Event Listeners==
window.addEventListener('resize', debounce(resizeCanvas), false);

document.addEventListener('keydown', keyDownAction);
document.addEventListener('keyup', keyUpAction);
document.addEventListener('click', handleFirstGameStart);

// Game start (first time: calls update)
function handleFirstGameStart(event) {
	newGame();
	updateCanvas();
	document.removeEventListener('click', handleFirstGameStart);
}
// Subsequent restarts
function handleGameRestart() {
	newGame();
	document.removeEventListener('click', handleGameRestart);
}

// Moving, rotating ship
function keyDownAction(event) {
	console.log(event.keyCode);
	if (!playerShip.isAlive || COMPUTER_ACTIVE) {
		return;
	}
	// console.log(event);
	switch (event.keyCode) {
		// Space: shoot
		case 32:
			playerShip.isShooting = true;
			playerShot();

			break;
		// Rotate left
		case 37:
			shipRotationLeft(playerShip);

			break;
		case 65:
			shipRotationLeft(playerShip);

			break;

		// Thrust
		case 38:
			playerShip.shipThrusting = true;

			break;
		case 87:
			playerShip.shipThrusting = true;

			break;
		// Rotate right
		case 39:
			shipRotationRight(playerShip);

			break;
		case 68:
			shipRotationRight(playerShip);

			break;

		case 40:
			playerShip.isShooting = true;
			playerShot();
			break;
		case 83:
			playerShip.isShooting = true;
			playerShot();
			break;
	}
}
function shipRotationLeft(ship) {
	ship.position.rotation = ((SHIP_TURN_SPEED / 180) * Math.PI) / FRAMERATE;
}
function shipRotationRight(ship) {
	ship.position.rotation = ((-SHIP_TURN_SPEED / 180) * Math.PI) / FRAMERATE;
}

function keyUpAction(event) {
	// Stop actions
	if (!playerShip.isAlive || COMPUTER_ACTIVE) return;

	switch (event.keyCode) {
		case 32:
			playerShip.isShooting = false;
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
		case 87:
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
		case 65:
			playerShip.position.rotation = 0;

			break;
		case 68:
			playerShip.position.rotation = 0;

			break;
		case 40:
			playerShip.isShooting = false;
			playerShip.shootingAllowed = true;
			break;
		case 83:
			playerShip.isShooting = false;
			playerShip.shootingAllowed = true;
			break;
	}
}
