

var alienImgs = [[47, -67108864, 42, -1442840576, 170, -1442840576, 170, -1442840576, 11946, -1430781952, 10922, -1431568384, 9898, -1431830528, 785066, -1431314432, 682666, -1431658496, 956074, -1431916544, 9278826, -1454001664, 43423066, -1453932672, 44734294, -1512658240, 40539994, -1512658240, 40539482, -1453938048, 44737898, -1453675904, 40544917, 1521134208, 39496277, 1437160832, 11183735, 2006624768, 9813, 1436024832, 9821, -577110016, 632149, 1448779776, 693338, -1457868800, 692377, 1761976320, 6963221, 1442950784, 111486608, 93350592, 127149712, 94378560, 23864896, 26219968, 10488192, 6294016],
              [770048, 1032192, 704512, 1024000, 688128, 1024000, 698368, 15376384, 698880, 65699840, 11776, 48758784, 10752, 48758784, 961194, -357924864, 961194, -1431576576, 961194, -1431642112, 16411306, -1432950272, 66737834, -1437159936, 65689002, -1453937152, 44727658, -1510560256, -22381142, -1443189848, -22369622, -1431655432, -1096111446, -1431655768, -1431655766, -1431660888, -1436898731, 1437247144, -1458918787, 2108318120, -1458918742, -1431678552, -1458918742, -1431662172, -1459191808, 692644, 1762033664, 692564, -1794790828, -1788198312, 67201636, 1520762880, 27300, 1519648768, 5476, -1789394944, 10836, -1431830528],
              [682, -1434451968, 3071, -1414529024, 16362, -1430519808, 44760746, -1431655808, 44739242, -1431655552, 48933546, -1431654464, 732605098, -1431655432, 1051372202, -1431655430, 984263338, -1431655686, 715806378, -1433032006, 715806058, -1454003542, 715825002, -1443452246, 715824986, -1510561110, 715827882, -1431655766, 1789569706, -1431655766, 447326890, -1431741786, 357935773, 1990874452, 1747613, 1990890496, 1747605, 1454023936, 22697386, -1432966848, 27935066, -1543411136, 27934746, -1543411136, 22697301, 1414899008, 1742080, 5936384, 1485312, 5936384, 1399040, 5854208, 349440, 5586944]],

shotColors = [],
aliens = [],
alienShots = [],
aliensCenters = [],
movingDown = 0,
movingHoriz = 0,
currentWave = 0,
lastWaveStarted = -10e6,
shootChance = function(alien) {
	return .0001*(alien.t+1+alien.wv);
},
maxAlienShots= function(wave) {
	return 50+25*wave;
},
getAimRadius = function(alien) {
	return CELL_SIZE*(22-alien.wv+alien.t*2); // +- bad aim of alien
}
updateAliens1 = function(dt) {  // move strategy 1
	var aliensCollided = false;
	if (movingDown > 0) {
		movingDown -= dt;
		each(aliensCenters, function(center) {
			center.y += dt*abs(center.speed)/2;
			if (movingDown <= 0) {
				movingHoriz = 40;
				center.speed = minmax(-10*SIZE_FACTOR ,10*SIZE_FACTOR, -1.1*center.speed);
			}
		}) 
		
	}
	else {
		movingHoriz -= dt;
		each(aliensCenters, function(center) {
			center.x += center.speed*dt;
		})
	}
	each(aliens, function(alien,ind) {
		var center = aliensCenters[alien.center],
			xofs = alien.xi*20 + (fps>20? +6*sin((alien.xi+3*alien.yi)*10/TPI+ 0.0005*alien.wv*prev_t) : 0);
		alien.x = center.x + CELL_SIZE*xofs;
		if (alien.life <= 0) {
			return;
		}
		alien.y = center.y + alien.yi *CELL_SIZE*10;
		if (alien.shake > 0) {
			alien.shake -= dt;
			alien.x += rndab(-CELL_SIZE,CELL_SIZE);
			alien.y += rndab(-CELL_SIZE,CELL_SIZE);
			if (fps > 20) {
				shotsPart.setOptions(shotColors[alien.t]);
				shotsPart.addParticle(alien.x,alien.y);
			}
		}
		if (alien.x < -200*CELL_SIZE || alien.x > WORLD_WIDTH + 200*CELL_SIZE) {
			aliensCollided = true;
		}
		if (getCellType(alien.x / CELL_SIZE | 0, alien.y / CELL_SIZE | 0) != AIR) {
			aliensCollided = true;
			alien.life--;
			makeHole(alien.x, alien.y, 16)
		}
	})
	if (aliensCollided) {
		if (movingDown <=0 && movingHoriz <= 0)
			movingDown = 20;
	}
},
explode = function(what, size) {
	jetpack.angle = -90;
	smoke.speed *= 3;
	var cs = CELL_SIZE*size;
	shotsPart.setOptions(shotColors[what.t]);
	range((fps< 20 ? 4 : 12)*size*size, function() {
		jetpack.addParticle(what.x+irndab(-2*cs,2*cs), what.y+irndab(-3*cs,cs))
		smoke.addParticle(what.x+irndab(-2*cs,2*cs),what.y+irndab(-2*cs,cs));
		shotsPart.addParticle(what.x+irndab(-2*cs,2*cs),what.y+irndab(-2*cs,2*cs));
	})
	jetpack.angle = 90;
	smoke.speed /= 3;
}

//updateAliens2 = function(dt) {
//	// move in spiral
//},

renderAliens = function(ctx) {
	each(aliens, function(alien) {
		ctx.drawImage(alienImgs[alien.t], alien.x-alien.w/2, alien.y-alien.h/2, alien.w, alien.h)
	})
	each(alienShots, function(shot) {
		ctx.fillStyle = rgba(shotColors[shot.t].startColor);
		ctx.fillRect(shot.x-5,shot.y-5, 10,10)
	})
},
updateAliens = function(dt) {
	if (prev_t > lastWaveStarted + 120000) {
		// start wave every period of time
		startAlienWave();
	}
	updateAliens1(dt);
	each(aliens, function(alien,ind) {
		if (alien.life < 5 && rnd()<.3) {
			smoke.addParticle(alien.x,alien.y);
		}
		var dx = Player.pos.x - alien.x,
			dy = Player.pos.y -MAN_IMG_SIZE/2 - alien.y;
		if (!alien.collided && abs(dx)+abs(dy) < MAN_IMG_SIZE) {
			hitPlayer()
			alien.life = 0;
			explode(alien, 2)
			alien.collided = 1;
		}
		if (alien.life <= 0) {
			alien.v = min(CELL_SIZE*3, (alien.v|| 0) + .3);
			alien.y += alien.v*dt;
			if (rnd() < .6)
				smoke.addParticle(alien.x,alien.y);
			var collided = isCollide(alien.x, alien.y) ; 
			if (alien.y > water_y+20*CELL_SIZE) {
				splashAt(alien.x-OffsetX, 12, alien.x, alien.y-CELL_SIZE*20)
				collided = true;
			}
			if (collided) {
				
				explode(alien, 2)
				aliens.splice(ind,1);
				if (aliens.length == 0 && currentWave == 10 && Player.health > 0) {
					gameOver(true);
				}
				makeHole(alien.x, alien.y, CELL_SIZE*6)
			}
		}
		else {
			if (alien.y > water_y+5*CELL_SIZE) {
				gameOver();
				OffsetY = alien.y - HEIGHT/2;
				OffsetX = alien.x - HEIGHT/2;
			}
			var radius = getAimRadius(alien);
			dx += rndab(-radius,radius);
			dy += rndab(-radius,radius);
			var r = sq(dx)+sq(dy),
			r2 = sq(radius)
			
			if (rnd() < shootChance(alien, alien)*dt*(r<40*r2 ? 3 : 1)   && alienShots.length < maxAlienShots(currentWave)) {
				if (r > 99*r2) {
					dx = 0; // shoot straight down if player is out of range
					dy = 1;
				}
				else {
					r = sqrt(r)
					dx /= r;
					dy /= r;
				}
				alienShots.push({
					x: alien.x,
					y: alien.y,
					t: alien.t,
					dx: CELL_SIZE*dx*rndab(1, 1.1+alien.t/3),
					dy: CELL_SIZE*dy*rndab(1, 1.1+alien.t/3)
				})
			}
		}
	});
	collidableTypes[GRASS] = 1; // shots collide with grass as well
	each(alienShots, function(shot, ind) {
		brrange(2, function() {
			shot.x += shot.dx*dt;
			shot.y += shot.dy*dt;
			var inside = (shot.x > OffsetX-WIDTH) && (shot.x < OffsetX+WIDTH) && (shot.y > OffsetY-HEIGHT) && (shot.y < OffsetY + HEIGHT);
			if (inside && fps > 20) {
				shotsPart.setOptions(shotColors[shot.t]);
				shotsPart.addParticle(shot.x,shot.y);
			}
			var collided = ( shot.y < -10*CELL_SIZE || shot.x < -200*CELL_SIZE || shot.x > WORLD_WIDTH + 200*CELL_SIZE);
			if (shot.y > water_y + 5*CELL_SIZE) {
				splashAt(shot.x-OffsetX, 6, shot.x, shot.y-CELL_SIZE*20)
				collided = true;
			}
			if (abs(shot.x-Player.pos.x)+abs(shot.y-Player.pos.y+MAN_IMG_SIZE/2) < MAN_IMG_SIZE) {
				hitPlayer();
				Player.pos.x += shot.dx;
				Player.pos.y += shot.dy;
				collided = true;
			}
			if (isCollide(shot.x, shot.y)) {
				collided = true;
				makeHole(shot.x, shot.y, CELL_SIZE*3)
			}
			if (collided) {
				alienShots.splice(ind, 1);
				if (inside)
					explode(shot, 1);
				return true;
			}	
		})
	})
	collidableTypes[GRASS] = 0;
},

startAlienWave = function() {
	lastWaveStarted = prev_t;
	if (currentWave >= 10) {
		return;
	}
	var x0 = CELL_SIZE*20;
	currentWave++;
	textToPlayer = "Wave #"+currentWave+" started! coming from the top ";
	if (currentWave%2==0) {
		x0 = WORLD_WIDTH - x0*12;
		textToPlayer += "RIGHT!";
	}
	else {
		textToPlayer += "LEFT!";
	}
	showTextFor = 250;
	for (var y=0; y<6; y++) {
		aliensCenters.push({x: x0, y:CELL_SIZE*(30+y*20), speed: (1.2*currentWave+1.5)*SIZE_FACTOR})
		var type = y>>1;
		for (var x=0; x<12; x++) {
			aliens.push({
				xi: x,
				yi: y,
//				i: y*12+x,
				t: type,
				center: aliensCenters.length-1,
				w: alienImgs[type].width*(1+currentWave/15),
				h: alienImgs[type].height*(1+currentWave/15),
				wv: currentWave, // wave
				life: 6+3*currentWave,
				shake:0
			});
		}
	}
	
}

initFu("Beaming Aliens", 4, function() {
	range(3, function(j) {
		var img = intArrayToImg(alienImgs[j], 32, alienImgs[j].length/2, 1<<j),  // divide by two because 16pixels per number, 32 pixels per row ---> numbers*16/32 rows
			canv = createCanvas(64*SIZE_FACTOR, 2*img.height*SIZE_FACTOR);
		Ctx(canv).drawImage(img, 0,0,canv.width,canv.height);
		alienImgs[j] = canv;
	})

	
	range(3, function(j) {
		var color = {
			finishColor: [40, 40, 40, .2],
			finishColorRandom: [10,10,10,0],
			startColor: [220, 220, 220, .9],
			startColorRandom: [5, 5, 5, 0]
		};
		color.finishColor[j] = 120;
		color.startColor[j] = 250;
		shotColors.push(color)
	})

	addWaveFrame()
})



