const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// canvas.width = '500';
// canvas.height = '700';

const FRAMERATE = 30;
const SHIP_HEIGHT_PX = 30;
const NUM_STARS = 10;

// Draw scene framerate times per second
setInterval(updateCanvas, 1000 / FRAMERATE);

let playerShip = {
	location: {
		// Center of canvas by default
		x: canvas.width / 2,
		y: canvas.height / 2,
		radius: SHIP_HEIGHT_PX / 2,
		// ship heading: radians
		angle: (90 / 180) * Math.PI,
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
		playerShip.location.x +
			playerShip.location.radius * Math.cos(playerShip.location.angle),
		playerShip.location.y -
			playerShip.location.radius * Math.sin(playerShip.location.angle)
	);
	// Rear left
	ctx.lineTo(
		playerShip.location.x -
			playerShip.location.radius *
				(Math.cos(playerShip.location.angle) +
					Math.sin(playerShip.location.angle)),
		playerShip.location.y +
			playerShip.location.radius *
				(Math.sin(playerShip.location.angle) -
					Math.cos(playerShip.location.angle))
	);
	// Rear right
	ctx.lineTo(
		playerShip.location.x -
			playerShip.location.radius *
				(Math.cos(playerShip.location.angle) -
					Math.sin(playerShip.location.angle)),
		playerShip.location.y +
			playerShip.location.radius *
				(Math.sin(playerShip.location.angle) +
					Math.cos(playerShip.location.angle))
	);
	// Hypoteneuse
	ctx.closePath();
	ctx.stroke();

	// dot
	ctx.fillStyle = 'red';
	ctx.fillRect(playerShip.location.x - 1, playerShip.location.y - 1, 2, 2);
}

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

console.log(playerShip.location.x);

window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	updateCanvas();
}
