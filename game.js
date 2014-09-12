

waterCtx.globalAlpha = 0.9;

var frameCount = 0,

	prevCount = frameCount,
	t0 = -1,

	prevFrameInd,

	PWind = function() {return Player.inWind ? wind : 0; },
	Wind = function() {return wind },

// based on http://stackoverflow.com/questions/4412345/implementing-wind-speed-in-our-projectile-motion
windForce=  function(wind, speed, area) {
	var dv = wind - speed;
	return minmax(-10,10, abs(dv)*dv*area);
},
particleHitWater = function(particle) {
	var x = particle.position.x;
	smoke.addParticle(x, particle.position.y);
	var spring = springs[springs.length*(1-(x-OffsetX)/WIDTH) |0 + irndab(-1,2)];
	if (spring) {
		spring.velocity += 1;
	}
},


jetpack = ParticlePointEmitter(350, {
	position: vector_create(),
	angle: 90,
	angleRandom: 10,
	duration: -1,
	finishColor: [200, 45, 10, 0],
	finishColorRandom: [40,40,40,0],
	gravity: vector_create(0,.03),
	lifeSpan: 1,
	positionRandom: vector_create(4,6),
	sharpness: 12,
	sharpnessRandom: 12,
	size: 30*SIZE_FACTOR|0,
	finishSize: 75*SIZE_FACTOR|0,
	colorEdge: 'rgba(40,20,10,0)',
	sizeRandom: 5*SIZE_FACTOR,
	speed: 4*SIZE_FACTOR,
	speedRandom: 1*SIZE_FACTOR,
	emissionRate: 140,
	startColor: [220, 188, 88, 1],
	startColorRandom: [32, 35, 38, 0],
	updateParticle: function(particle) {
		if (particle.position.y > water_y) {
			particle.timeToLive = 0;
			particleHitWater(particle);
		}
		else {
			// check collision
			var cellX = (particle.position.x / CELL_SIZE|0)+1,
			cellY = (particle.position.y/CELL_SIZE|0)+1,
			cell = getCellType(cellX, cellY)
			if (cell == GRASS || cell == ICE) {
				particle.timeToLive = 0;
				smoke.addParticle(particle.position.x, particle.position.y);

				if (cell == ICE) {
					water.speed = 3*SIZE_FACTOR;
					water.addParticle(particle.position.x, particle.position.y);
					setCellType(cellX, cellY, AIR);
				}
				else {
					// burn vegetation
					setCellType(cellX, cellY, rnd()<.8? BURNED_GRASS : AIR);
				}
			}
			else if (isCollideType(cell)) {
				particle.position.sub(particle.direction);
				// bounce - assuming hit with floor/ceiling - flip v.y
				particle.direction.y *= -1;
			}
		}
	},
	wind: PWind,
	area: 0.1
}),

shotsPart = ParticlePointEmitter(50, {
	position: vector_create(),
	angle: 90,
	angleRandom: 10,
	duration: -1,
//	finishColor: [200, 45, 10, 0],
//	finishColorRandom: [40,40,40,0],
//	startColor: [220, 188, 88, 1],
//	startColorRandom: [32, 35, 38, 0],
	colorEdge: 'rgba(40,20,10,0)',
	gravity: 0,
	lifeSpan: 1,
	positionRandom: vector_create(3,3),
	sharpness: 22,
	sharpnessRandom: 12,
	size: 30*SIZE_FACTOR|0,
	finishSize: 15*SIZE_FACTOR|0,
	sizeRandom: 5*SIZE_FACTOR,
	speed: 4*SIZE_FACTOR,
	speedRandom: 1*SIZE_FACTOR,
	emissionRate: 140,
	area: 0.1
}),


sparks = ParticlePointEmitter(250, {
	active:false,
	position: vector_create(),
	angle: 0,
	angleRandom: 360,
	duration: -1,
	finishColor: [230, 150, 150, .1],
	finishColorRandom: [20,20,20,.1],
	gravity: vector_create(0,.4),
	lifeSpan: 2.5,
	positionRandom: vector_create(3,3),
	sharpness: 82,
	sharpnessRandom: 12,
	size: 8*SIZE_FACTOR|0,
	finishSize: 2*SIZE_FACTOR|0,
	speed: 5*SIZE_FACTOR,
	speedRandom: 1*SIZE_FACTOR,
	startColor: [250, 160, 160, 1],
	startColorRandom: [5, 5, 5, 0],
	wind: PWind,
	area: 0.1
}),

laser = ParticlePointEmitter(100, {
	active: false,
	gravity:0,
	position: vector_create(),
	startColor: [200, 50, 50, .8],
	speed: CELL_SIZE,// laser is updated multiple times each tick so speed is actually much higher
	lifeSpan: 3, 		
	renderParticle: function(ctx, p) {
//		if (p.just_created) {
//			p.just_created = false;
//			return; // don't draw when just created
//		}
		ctx.moveTo(p.prev.x, p.prev.y);
		ctx.lineTo(p.position.x, p.position.y);
	},
	updateParticle: function(particle) {
		if (particle.timeToLive < 0) return;
		particle.prev = vector_sub(particle.position, particle.direction); // one is added before this function
		for (var i=0; i<6 && particle.timeToLive; i++) {
			var x = particle.position.x,
				y = particle.position.y;
			// collision with sea
			if (y > water_y) {
				particle.timeToLive *= .8;
				particleHitWater(particle)
			}
			// check collision with aliens
			each(aliens, function(alien, ind) {
				var ax = alien.x-alien.w/2,
					ay = alien.y-alien.h/2;
				if (x > ax && x < ax+alien.w && y > ay && y < ay+alien.h) {
					particle.timeToLive = 0;
					sparks.addParticle(x, y);
					alien.life--;
				}
			})
			// check collision moutain
			var cellX = (x/ CELL_SIZE|0)+1,
				cellY = (y/CELL_SIZE|0)+1,
				cell = getCellType(cellX, cellY)
			if (cell == GRASS || cell == ICE) {
				smoke.addParticle(x, y);
	
				if (cell == ICE) {
					particle.timeToLive *= .8;
					water.speed = 3*SIZE_FACTOR;
					water.addParticle(x, y);
					setCellType(cellX, cellY, AIR);
				}
				else {
					particle.timeToLive = 0;
					// burn vegetation
					setCellType(cellX, cellY, rnd()<.8? BURNED_GRASS : AIR);
					continue;
				}
			}
			else if (isCollideType(cell)) {
				particle.timeToLive = 0;
				sparks.addParticle(x, y);
				continue;
			}
			particle.position.add( particle.direction );
		}
		if (!particle.timeToLive) {
			particle.position.sub( particle.direction )
			particle.timeToLive = .00001; // just above zero to still allow render to run but die at next update
		}
	}
}),



snow = ParticlePointEmitter(SNOW_PARTICLES, {
	active:true,
	position: vector_create(Player.pos.x,-60*CELL_SIZE),
	angle:90,
	angleRandom: 180,
	duration: -1,
	finishColor: [240,240,250,0.1],
	finishColorRandom: [10,10,10,0],
	gravity: vector_create(0,.02),
	lifeSpan: 25,
	positionRandom: vector_create(WIDTH*.7,5*CELL_SIZE),
	sharpness: 12,
	sharpnessRandom: 12,
	size: 20*SIZE_FACTOR|0,
	finishSize: 10*SIZE_FACTOR|0,
	sizeRandom: 2*SIZE_FACTOR,
	colorEdge: 'rgba(40,40,40,0)',
	speed: .2*SIZE_FACTOR,
	speedRandom: 0.1,
	startColor: [220, 220, 230, 1],
	startColorRandom: [22, 22, 22, 0],
	wind: Wind,
	updateParticle: function(p, ind) {
		p.position.x += sin(TPI*ind/50+0.001*prev_t);
	},
	area: .4
}),


clouds = ParticlePointEmitter(350, {
	active:false,
	position: vector_create(WORLD_WIDTH/2, -125*CELL_SIZE),
	angle:0,
	duration: -1,
	gravity: 0,
	lifeSpan: 10,
	emissionRate: -1,
	positionRandom: vector_create(WORLD_WIDTH/2, 10*CELL_SIZE),
	size: 280*SIZE_FACTOR|0,
	finishSize: 280*SIZE_FACTOR|0,
	sizeRandom: 30,
	speed: .2*SIZE_FACTOR,
	speedRandom: 0.1,
	wind: Wind,
	area: .3,
	updateParticle: function(p) {
		p.timeToLive = 1000;
		p.position.x += WORLD_WIDTH;
		p.position.x %= WORLD_WIDTH;
	},
	renderParticle:  function(context, p) { 
		// render particle function where the radial gradient is calculated only once
		var size = p.size |0,
		x = p.position.x|0,
		y = p.position.y|0;
		if (!p.img) {
			p.img = getCloudImg(p.area * 100 |0)
		}
	  	context.drawImage( p.img, x, y, size*2, size );
	}

}),

smoke = ParticlePointEmitter(250, {
	active:false,
	position: vector_create(),
	angle: -90,
	angleRandom: 20,
	duration: 10,
	finishColor: [40, 40, 40, 0],
	finishColorRandom: [10,10,10,0],
	gravity: vector_create(0,-.25),
	lifeSpan: .8,
	lifeSpanRandom: 0.2,
	positionRandom: vector_create(2,2),
	sharpness: 12,
	sharpnessRandom: 12,
	size: 45*SIZE_FACTOR|0,
	finishSize: 60*SIZE_FACTOR|0,
	sizeRandom: 6*SIZE_FACTOR,
	colorEdge: 'transparent',
	speed: 1.2*SIZE_FACTOR,
	speedRandom: .1,
	startColor: [220, 220, 220, 1],
	startColorRandom: [22, 22, 22, 0],
	wind: Wind,
	area: 0.8
}),


water = ParticlePointEmitter(250, {
	active:false,
	position: vector_create(),
	angle: -90,
	angleRandom: 80,
	duration: 0.15,
	finishColor: [40, 70, 140, .2],
	finishColorRandom: [10,10,10,0],
	gravity: vector_create(0,.5),
	lifeSpan: 1.2,
	lifeSpanRandom: 0.2,
	positionRandom: vector_create(16,4),
	sharpness: 72,
	sharpnessRandom: 12,
	size: 14,
	finishSize: 8,
	sizeRandom: 1,
	emissionRate: 100,
	speed: 2*SIZE_FACTOR,
	colorEdge: 'rgba(140,140,255,0)',
	speedRandom: .5,
	startColor: [60, 80, 120, .9],
	startColorRandom: [12, 12, 12, 0],
	updateParticle: function(particle) {
		if (particle.position.y > water_y && particle.direction.y > 0) {
			particle.timeToLive = 0;
		}
	},
	wind: Wind,
	area: 0.05
}),

// accurately calculate the water level - not necessary, just waste of cpu and code
//waterY = function(x) {
//	var m = (x%WATER_SPRING_DX)/WATER_SPRING_DX;
//	return springs[x/WATER_SPRING_DX | 0].height * m + (1-m)* springs[1+(x/WATER_SPRING_DX | 0)].height;
//}


prev_t = 0,
fps = 0, // DBG

snowRender = SNOW_LEVEL*WORLD_HEIGHT,

animFrame = function(t) {
	var dt = min(3.5, (t - prev_t)/32);
	prev_t = t;
	var frameInd = (frameCount/3 |0) % WATER_FRAMES;  // TODO: anim water frames based on FPS

	updatePlayer(dt);
	var shouldShowSnow = Player.pos.y < snowRender;
	
	// no more updates to player pos at this frame - update camera to point to player
	
	OffsetY = Player.pos.y - HEIGHT/2 +Player.lookY |0;
	OffsetX = Player.pos.x - WIDTH/2 +Player.lookX |0;
	spritesCtx.setTransform(1,0,0,1,-OffsetX, -OffsetY);
	waterCtx.setTransform(1,0,0,1,-OffsetX, -OffsetY);
	if (shouldShowSnow) {
		skySpritesCtx.setTransform(1,0,0,1,-OffsetX, -OffsetY);
		snow.position.x = Player.pos.x - wind*20*CELL_SIZE;
	}
	

	jetpack.position.x = Player.pos.x -(Player.leftFace ? -5: 5);
	jetpack.position.y = Player.pos.y-15;
	updateWaves(dt);
	laser.update(dt);
	updateAliens(dt);   // aliens can add jetpack and smoke so must update before them
	jetpack.update(dt);
	sparks.update(dt);
	water.update(dt); // water update must come after jetpack and laser because they can create water
	smoke.update(dt); // same as water
	if (shouldShowSnow) {
		snow.update(dt);
		clouds.update(dt);
	}

	
	waterCtx.clearRect(OffsetX,OffsetY,WIDTH,HEIGHT);
	skySpritesCtx.clearRect(OffsetX,OffsetY, WIDTH,HEIGHT);
	spritesCtx.clearRect(OffsetX,OffsetY,WIDTH,HEIGHT);

	spritesCtx.save()
	spritesCtx.globalCompositeOperation = "lighter";
	jetpack.renderParticles(spritesCtx);
	spritesCtx.restore()
	sparks.renderParticles(spritesCtx);
	spritesCtx.beginPath()
	laser.renderParticles(spritesCtx);
	spritesCtx.strokeStyle = 'rgba(250, 60, 60, .4)';
	spritesCtx.lineWidth = 7;
	spritesCtx.stroke();
	spritesCtx.lineWidth = 2;
	spritesCtx.strokeStyle = 'rgba(255,190,190,.9)';
	spritesCtx.stroke();
	smoke.renderParticles(spritesCtx);
	renderAliens(spritesCtx);
	if (shouldShowSnow) {
		snow.renderParticles(skySpritesCtx);
		clouds.renderParticles(skySpritesCtx);
	}

	if (yellow_man) {
		draw_man(Player.pos, Player.angle);
	}

	waterCtx.save()
	water.renderParticles(waterCtx);
	waterCtx.restore()
	if (Player.pos.y > water_y - HEIGHT) {
		if (prevFrameInd != frameInd) {
			waterCtx.fillStyle = water_frames[frameInd];
			prevFrameInd = frameInd;
		}
		renderWater();
	}
		
	
	//water_frames[frameInd].draw(0,water_y, WIDTH, HEIGHT);
	water_y -= 0.01*dt;
	if (water_y< WORLD_HEIGHT-1000) {
		water_y = WORLD_HEIGHT-10;
	}


	skyCtx.save()
	var skyX = -.3*OffsetX, skyY = minmax(-1,0, -1.1*OffsetY/WORLD_HEIGHT)*HEIGHT;
	skyCtx.translate(skyX, skyY)
	skyCtx.fillRect(-skyX,-skyY,WIDTH,HEIGHT);
	skyCtx.restore();
//	groundBackCtx[curBackBuffInd].fillStyle = "#f00";
//	groundBackCtx[curBackBuffInd].fillRect(Player.pos.x - lastRenderX -1, Player.pos.y -lastRenderY -1, 3,3);

//	mountainCtx.clearRect(0,0,WIDTH,HEIGHT)	
//	drawToBackBuff(mountainCtx, OffsetX/CELL_SIZE|0, OffsetY/CELL_SIZE|0, 0,0, BB_WIDTH,BB_HEIGHT);
	redrawDirty();
	scrollBackground(Player.pos.x+ Player.lookX, Player.pos.y+Player.lookY);
	
	
    RQ(animFrame);
    
    frameCount++;
    // TODO: remove later
	var text= "Wind: "+wind;
	if (DBG) {
		text+= "  Sky: "+skyX.toFixed(1)+","+skyY.toFixed(1);
    	text+= "  Player: "+Player.pos.x.toFixed(0)+","+Player.pos.y.toFixed(0);
    	text+= "  V: "+Player.v.x.toFixed(1)+","+Player.v.y.toFixed(1);
		if (t - t0 > 5000) {
			t0 = t;
			//wind = rndab(-10,10)
			//console.log((frameCount-prevCount)/10, " avg FPS, wind:", wind);
			fps = (frameCount-prevCount)/5
			prevCount = frameCount;
		}
		text += " fire: "+jetpack.particles.length;
		text += "  FPS: "+fps.toFixed(1)
	}
	mountainCtx.fillText(text, WIDTH/2,50);
	if (Player.engine_frozen) {
		mountainCtx.fillText("Engine FROZEN!", WIDTH/2,HEIGHT/2 - 100);
	}
},

progress = 0,
initialize = function() {
	if (initQueue.length == 0)
		return;
	var todo = initQueue.shift();
	var text = todo[0];
	var pg = todo[1];
	DC.getElementById("text").textContent= text;
	progress+=pg;
	if (DBG) {
		console.log("Progress: "+progress+"  text: "+text+"  "+Date())
		if (progress > 100) alert("prgs at "+progress+" text is "+text);
	}
	DC.getElementById('pbar-in').style.width = (progress*2)+'px'

	todo[2]();
	setTimeout(initialize, 0);
};


initFu("Almost Ready...", 10, function() {
	range(clouds.maxParticles, function() {
		if (rnd() < 0.22) {
			clouds.position.y+= 2;
			clouds.area *= .98;
		}
		var p = clouds.addParticle();
		p.finishSize = p.size;
		p.deltaSize = 0;
	})
	
	mountainCtx.font="20px Verdana";
	mountainCtx.textAlign = 'center';
	mountainCtx.fillStyle = '#fff';
});

initFu("Ready!", 1, function() {
	DC.getElementById('overlay').style.display = "none"; // TODO: add class for fade transition
	RQ(animFrame);
})

initialize();