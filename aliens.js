

var alienImgs = [[47, -67108864, 42, -1442840576, 170, -1442840576, 170, -1442840576, 11946, -1430781952, 10922, -1431568384, 9898, -1431830528, 785066, -1431314432, 682666, -1431658496, 956074, -1431916544, 9278826, -1454001664, 43423066, -1453932672, 44734294, -1512658240, 40539994, -1512658240, 40539482, -1453938048, 44737898, -1453675904, 40544917, 1521134208, 39496277, 1437160832, 11183735, 2006624768, 9813, 1436024832, 9821, -577110016, 632149, 1448779776, 693338, -1457868800, 692377, 1761976320, 6963221, 1442950784, 111486608, 93350592, 127149712, 94378560, 23864896, 26219968, 10488192, 6294016],
              [770048, 1032192, 704512, 1024000, 688128, 1024000, 698368, 15376384, 698880, 65699840, 11776, 48758784, 10752, 48758784, 961194, -357924864, 961194, -1431576576, 961194, -1431642112, 16411306, -1432950272, 66737834, -1437159936, 65689002, -1453937152, 44727658, -1510560256, -22381142, -1443189848, -22369622, -1431655432, -1096111446, -1431655768, -1431655766, -1431660888, -1436898731, 1437247144, -1458918787, 2108318120, -1458918742, -1431678552, -1458918742, -1431662172, -1459191808, 692644, 1762033664, 692564, -1794790828, -1788198312, 67201636, 1520762880, 27300, 1519648768, 5476, -1789394944, 10836, -1431830528],
              [682, -1434451968, 3071, -1414529024, 16362, -1430519808, 44760746, -1431655808, 44739242, -1431655552, 48933546, -1431654464, 732605098, -1431655432, 1051372202, -1431655430, 984263338, -1431655686, 715806378, -1433032006, 715806058, -1454003542, 715825002, -1443452246, 715824986, -1510561110, 715827882, -1431655766, 1789569706, -1431655766, 447326890, -1431741786, 357935773, 1990874452, 1747613, 1990890496, 1747605, 1454023936, 22697386, -1432966848, 27935066, -1543411136, 27934746, -1543411136, 22697301, 1414899008, 1742080, 5936384, 1485312, 5936384, 1399040, 5854208, 349440, 5586944]],
              
aliens = [],
alienShots = [],
aliensCenters = [],
alienSpeed = 2.5*SIZE_FACTOR,
movingDown = 0,
movingHoriz = 0,
ALIEN_SHOOT_CHANCE = 0.01,
MAX_ALIEN_SHOTS=100,
updateAliens1 = function(dt) {  // move strategy 1
	var aliensCollided = false;
	if (movingDown > 0) {
		movingDown -= dt;
		each(aliensCenters, function(center) {
			center.y += dt*abs(alienSpeed)/2;
			if (center.y > water_y) {
				center.y = CELL_SIZE*60;
			}
		}) 
		if (movingDown <= 0) {
			movingHoriz = 40;
			alienSpeed = minmax(-10*SIZE_FACTOR ,10*SIZE_FACTOR, -1.05*alienSpeed);
		}
	}
	else {
		movingHoriz -= dt;
		each(aliensCenters, function(center) {
			center.x += alienSpeed*dt;
		})
	}
	each(aliens, function(alien,ind) {
		var center = aliensCenters[alien.t];
		alien.x = center.x + CELL_SIZE*(alien.xi*20 +6*sin((alien.xi+3*alien.yi)*10/TPI+ 0.001*prev_t));
		if (alien.life <= 0) {
			return;
		}
		alien.y = center.y + alien.yi *CELL_SIZE*20;
		if (alien.x < -20*CELL_SIZE || alien.x > WORLD_WIDTH + 20*CELL_SIZE) {
			aliensCollided = true;
		}
		var cellX = alien.x / CELL_SIZE | 0, 
			cellY = alien.y / CELL_SIZE | 0;
		if (getCellType(cellX, cellY) != AIR) {
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

updateAliens2 = function(dt) {
},

renderAliens = function(ctx) {
	each(aliens, function(alien) {
		ctx.drawImage(alienImgs[alien.t], alien.x-alien.w/2, alien.y-alien.h/2)
	})
},
updateAliens = function(dt) {
	updateAliens1(dt);
	each(aliens, function(alien,ind) {
		if (alien.life < 5 && rnd()<.3) {
			smoke.addParticle(alien.x,alien.y);
		}
		if (alien.life <= 0  || alien.y > water_y+20*CELL_SIZE) {
			alien.v = min(CELL_SIZE*3, (alien.v|| 0) + .3);
			alien.y += alien.v*dt;
			if (rnd() < .6)
				smoke.addParticle(alien.x,alien.y);
			var cellX = alien.x / CELL_SIZE | 0, 
			cellY = alien.y / CELL_SIZE | 0;
			if (isCollide(cellX, cellY) || alien.y > water_y+20*CELL_SIZE) {
				jetpack.angle = -90;
				jetpack.speed *= 2;
				smoke.speed *= 3;
				range(50, function() {
					jetpack.addParticle(alien.x+irndab(-3*CELL_SIZE,3*CELL_SIZE), alien.y+irndab(-3*CELL_SIZE,3*CELL_SIZE))
					smoke.addParticle(alien.x+irndab(-3*CELL_SIZE,3*CELL_SIZE),alien.y+irndab(-3*CELL_SIZE,3*CELL_SIZE));
				})
				jetpack.angle = 90;
				jetpack.speed /= 2;
				smoke.speed /= 3;
				aliens.splice(ind,1);
				makeHole(alien.x, alien.y, 32)
			}
		}
		else if (rnd() < ALIEN_SHOOT_CHANCE*dt && alienShots<MAX_ALIEN_SHOTS) {
			alienShots.push({
				x: alien.x,
				y: alien.y,
				t: alien.t
			})
		}
	});
}

initFu("Beaming Aliens", 4, function() {
	range(3, function(j) {
		var img = intArrayToImg(alienImgs[j], 32, alienImgs[j].length/2, 1<<j),  // divide by two because 16pixels per number, 32 pixels per row ---> numbers*16/32 rows
			canv = createCanvas(64*SIZE_FACTOR, 2*img.height*SIZE_FACTOR);
		Ctx(canv).drawImage(img, 0,0,canv.width,canv.height);
		alienImgs[j] = canv;
	})

	for (var y=0; y<6; y++) {
		aliensCenters.push({x:CELL_SIZE*20, y:CELL_SIZE*(30+y*20)})
		var type = y>>1;
		for (var x=0; x<12; x++) {
			aliens.push({
				xi: x,
				yi: y,
				i: y*12+x,
				t: type,
				w: alienImgs[type].width,
				h: alienImgs[type].height,
				life: 10
			})	
		}
	}
	
	addWaveFrame()
})



