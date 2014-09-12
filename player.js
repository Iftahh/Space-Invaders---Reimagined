var Player = {
//	pos : vector_create(50 * CELL_SIZE, 900 * CELL_SIZE), // start position - near water
	 pos: vector_create(820*CELL_SIZE, 30*CELL_SIZE), // start position - top
	// of mountain
	v : vector_create(),
	
	laser_cooldown: 0
},
yellow_man = 0, MAN_IMG_SIZE = 64 * SIZE_FACTOR | 0;

initFu("Chasing Sprites", 4, function() {

	var manImage = intArrayToImg([0, 0, 0, 44016, 0, 0, 176124, 0, 0, 152917, 0, 0, 177556, 0, 0, 174826, 0, 1024, 174680, 5119, -2096, 174752, 1365, 1431655764, 175088, 5467, -445688492, 437244, 86, -50380800, 437247, 6, -1124253696, 1747967, 1, -1359396864, 437247, 0, 1788870656, 1485823, 0, 444596224, 1485823, 0, 83886080, 1485567, 0, 0, 1747711, 0, 0, 1485804, 0, 0, 48175, 0, 0, 15407, 0, 0, 11307, 0, 0, 11304, 0, 0, 11307, 0, 0, 11051, 0, 0],
				48,24),

	man_canvas = createCanvas(2 * MAN_IMG_SIZE, MAN_IMG_SIZE),
	ctx = Ctx(man_canvas);

	ctx.drawImage(manImage, 0, 0, 2 * MAN_IMG_SIZE, MAN_IMG_SIZE);
	emboss(ctx, true);
	yellow_man = createCanvas(2 * MAN_IMG_SIZE, MAN_IMG_SIZE);
	var bctx = Ctx(yellow_man), pixels = ctx.getImageData(0, 0,
			2 * MAN_IMG_SIZE, MAN_IMG_SIZE).data,
	yellowid = bctx.createImageData(2 * MAN_IMG_SIZE, MAN_IMG_SIZE),
	yellow = yellowid.data, i = 0;
	duRange(2 * MAN_IMG_SIZE, MAN_IMG_SIZE, function() {
		yellow[i] = pixels[i];
		i++;
		yellow[i] = pixels[i];
		i++;
		yellow[i] = pixels[i] / 2;
		i++;
		yellow[i] = pixels[i];
		i++;
	});
	bctx.putImageData(yellowid, 0, 0);
	
	addWaveFrame()
});
	

var draw_man = function(v, angle) {
	var man = yellow_man;
	spritesCtx.save();
	spritesCtx.translate(v.x - MAN_IMG_SIZE / 2, v.y - MAN_IMG_SIZE);
	if (Player.leftFace) {
		spritesCtx.translate(MAN_IMG_SIZE, 0);
		spritesCtx.scale(-1, 1);
		angle = PI - angle;
	}
	spritesCtx.drawImage(man, 0, 0, MAN_IMG_SIZE, MAN_IMG_SIZE, 0, 0,
			MAN_IMG_SIZE, MAN_IMG_SIZE);
	spritesCtx.translate(MAN_IMG_SIZE / 3 + MAN_IMG_SIZE / 9, MAN_IMG_SIZE / 3);
	spritesCtx.rotate(angle);
	spritesCtx.drawImage(man, MAN_IMG_SIZE, 0, MAN_IMG_SIZE, MAN_IMG_SIZE,
			-MAN_IMG_SIZE / 3, -MAN_IMG_SIZE / 3, MAN_IMG_SIZE, MAN_IMG_SIZE);
	spritesCtx.restore();
	// C.fillStyle= "#f00";
	// C.fillRect(v.x-1, v.y-1, 3,3)
},

// hack to keep on the ground few ticks even when in air
leftGround = 0,
/*******************************************************************************
 * Updates player location/speed for collision with mountain
 * 
 * @returns True if standing on ground (colliding down feet-floor)
 */
checkPlayerCollision = function() {
	var cell = getCellType(Player.pos.x / CELL_SIZE | 0,
			(Player.pos.y - MAN_IMG_SIZE * .4) / CELL_SIZE | 0), deepCollide = false, headCollide = false, feetCollide = false, horizOffset = 0, toMoveX = 0;

	Player.inWind = cell == AIR || cell == GRASS || cell == BURNED_GRASS;
	if (Player.v.x > 0) {
		horizOffset = MAN_IMG_SIZE / 4;
		toMoveX = -Player.pos.x % CELL_SIZE;
	}
	if (Player.v.x < 0) {
		horizOffset = MAN_IMG_SIZE / -4;
		toMoveX = -Player.pos.x % CELL_SIZE + CELL_SIZE;
	}

	// simple collision check

	// check collision at head level
	if (isCollide((Player.pos.x + horizOffset) / CELL_SIZE | 0,
			(Player.pos.y - MAN_IMG_SIZE * .8) / CELL_SIZE | 0)) {
		headCollide = true;
		if (isCollide((Player.pos.x + horizOffset) / CELL_SIZE | 0,
				(Player.pos.y - MAN_IMG_SIZE * .6) / CELL_SIZE | 0)) {
			// deep collide - bounce back x and move back player
			deepCollide = true;
		}
	}
	// check at feet level
	if (isCollide((Player.pos.x + horizOffset) / CELL_SIZE | 0,
			(Player.pos.y + 2 * CELL_SIZE) / CELL_SIZE | 0)) {
		feetCollide = true;
		// collide at feet level - check slightly above and lift if ok
		if (isCollide((Player.pos.x + horizOffset) / CELL_SIZE | 0,
				(Player.pos.y) / CELL_SIZE | 0)) {
			deepCollide = true;
		}
	}

	if (feetCollide || headCollide) {
		if (deepCollide) {
			// deep collide - bounce back
			Player.v.x *= -.3;
			Player.pos.x += toMoveX;
		}

		if (abs(Player.v.y) < .2) {
			Player.v.y = 0;
		} else {
			Player.v.y *= ((Player.v.y > 0 && feetCollide) || Player.v.y < 0
					&& headCollide) ? -.3 : .3;
		}

		if (headCollide) {
			Player.pos.y += CELL_SIZE - (Player.pos.y % CELL_SIZE);
			if (!deepCollide) {
				Player.pos.y += CELL_SIZE;
			}
			Player.v.x *= .2; // friction with ceiling - remove for ice?
		}
		if (feetCollide) {

			Player.pos.y -= Player.pos.y % CELL_SIZE;
			if (deepCollide) {
				Player.pos.y -= CELL_SIZE;
			}
			Player.onGround = true;
			leftGround = 0;
			return;
		}
	}

	// hack: stay on ground for 6 ticks even if not feet collided
	if (leftGround++ > 6) {
		Player.onGround = false;
	}
},

KEYS = {},

updateFromKeys = function(e) {
	KEYS[e.keyCode] = e.type == "keydown";
	if (e.keyCode == 32 || e.keyCode >= 37 && e.keyCoe <= 40)
		e.preventDefault();
}, 
isLeftPressed = function() {
	return KEYS[37] || // left arrow
	KEYS[65] || KEYS[83] // 'a' or 's';
}, 
isRightPressed = function() {
	return KEYS[39] || // right arrow
	KEYS[68] || KEYS[70] // 'd' or 'f'
}, 
isUpPressed = function() {
	return KEYS[32] || KEYS[87] || KEYS[69]; // Space or 'w' or 'e'
};

DC.onkeydown = updateFromKeys;
DC.onkeyup = updateFromKeys;

DC.body.addEventListener('touchmove', function(event) {
	event.preventDefault();
}, false);

var mouse = {
	x : 0,
	y : 0,
	pressed: 0
};
DC.onmousemove = function(evt) {
	var rect = canvases[1].getBoundingClientRect();
	mouse.x = evt.clientX - rect.left;
	mouse.y = evt.clientY - rect.top;
}

DC.onmousedown = function(e) {
	mouse.pressed |= 1<<e.button;
}
DC.onmouseup= function(e) {
	mouse.pressed &= ~(1<<e.button);
}

var updatePlayer = function(dt) {
	var WATER_FRICTION = 0.76, AIR_FRICTION = .99;

	var speed = isUpPressed() ? 1.65 : 0.6;
	Player.leftFace = Player.angle > PI / 2 || Player.angle < -PI / 2
	if (isLeftPressed()) {
		Player.v.x = max(-10, Player.v.x - speed);
		if (Player.onGround)
			Player.leftFace = true;
	} else if (isRightPressed()) {
		Player.v.x = min(10, Player.v.x + speed);
		if (Player.onGround)
			Player.leftFace = false;
	} 
	if (!Player.onGround && Player.inWind) {
		Player.v.x += windForce(Wind(), Player.v.x, .02);
	}

	jetpack.active = !Player.engine_frozen && isUpPressed();
	var above = Player.pos.y < water_y;
	Player.v.scale(above ? AIR_FRICTION : WATER_FRICTION) // air or water
															// friction

	// gravity or jetpack - higher gravity while "onGround" to allow going down
	// diagonal without hopping
	Player.v.y = minmax(-10, 20, Player.v.y
			+ (jetpack.active ? -.25 : (Player.onGround ? 0.8 : .5)));
	var dist = vector_multiply(Player.v, dt)
	Player.pos.add(dist);

	if (Player.pos.y > water_y) {
		if (above) {
			var x = WIDTH / 2;// Player.pos.x;
			// if (x < WIDTH && x>0)
			springs[springs.length * (1 - x / WIDTH) | 0].velocity = 22 * Player.v.y;
			// splash some droplets
			water.active = true;
			water.position.x = Player.pos.x;
			water.position.y = Player.pos.y + MAN_IMG_SIZE - 8;
			water.speed = 0.75 * Player.v.y;
			water.emissionRate = 20 * abs(Player.v.y);
			// water.angle = Math.atan2(-abs(Player.v.y), 2*Player.v.x) *
			// 180/PI;
		}
		if (Player.pos.y > water_y + HEIGHT * .5)
			Player.pos.y = 0;
	}
	if (Player.pos.x > WORLD_WIDTH + WIDTH) {
		Player.pos.x = -WIDTH;
	}
	if (Player.pos.x < -WIDTH) {
		Player.pos.x = WORLD_WIDTH + WIDTH;
	}

	checkPlayerCollision();
	if (Player.onGround) {
		// friction with ground - for ice do not alter v.x
		if (abs(Player.v.x) < .3) {
			Player.v.x = 0;
		} else {
			Player.v.x *= .8;
		}
	} else {
		if (Player.pos.y < -20 * CELL_SIZE) {
			Player.engine_frozen = 20;
		}
	}
	if (Player.engine_frozen> 0) {
		Player.engine_frozen--;
	}
	Player.angle = Math.atan2(OffsetY+mouse.y - Player.pos.y + MAN_IMG_SIZE*.72, OffsetX+mouse.x - Player.pos.x);
	if (mouse.pressed && Player.laser_cooldown <= 0) {
		laser.angle = Player.angle*360/TPI;
		var p = laser.addParticle(Player.pos.x, Player.pos.y- MAN_IMG_SIZE*.72);
//		p.just_created = true;
		Player.laser_cooldown += dt;
	}
	if (Player.laser_cooldown > 0 && Player.laser_cooldown < 300) {
		Player.laser_cooldown += dt;
	}
	else {
		Player.laser_cooldown = -20;
	}
	
};
