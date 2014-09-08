


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



jetpack = ParticlePointEmitter(350, {
	position: vector_create(),
	angle: 90,
	angleRandom: 10,
	duration: -1,
	finishColor: [200, 45, 10, 0],
	finishColorRandom: [40,40,40,0],
	gravity: vector_create(0,.03),
	lifeSpan: 1,
	lifeSpanRandom: 0,
	positionRandom: vector_create(4,6),
	sharpness: 12,
	sharpnessRandom: 12,
	size: 30*SIZE_FACTOR|0,
	finishSize: 75*SIZE_FACTOR|0,
	colorEdge: 'rgba(40,20,10,0)',
	sizeRandom: 4,
	speed: 4,
	speedRandom: 1,
	emissionRate: 140,
	startColor: [220, 188, 88, 1],
	startColorRandom: [32, 35, 38, 0],
	updateParticle: function(particle) {
		if (particle.position.y > water_y) {
			particle.timeToLive = 0;
			var smokePar = smoke.addParticle(particle.position.x, particle.position.y);
			if (smokePar) {
				var x = particle.position.x;
				var spring = springs[springs.length*(1-(x-OffsetX)/WIDTH) |0 + irndab(-1,2)];
				if (spring) {
					spring.velocity += 1;
				}
			}
		}
		else {
			// check collision
			var cell = getCellType(particle.position.x / CELL_SIZE|0, particle.position.y/CELL_SIZE|0)
			if (cell == 3) {// vegetation
				particle.timeToLive = 0;
				smoke.addParticle(particle.position.x, particle.position.y);
				// TODO: burn vegetation
				setCellType(particle.position.x / CELL_SIZE|0, particle.position.y/CELL_SIZE|0, rnd()<.8? 32 : 0);

//				groundBackCtx[curBackBuffInd].clearRect(particle.position.x - lastRenderX -CELL_SIZE,particle.position.y - lastRenderY -CELL_SIZE, 2*CELL_SIZE-2, 2*CELL_SIZE-2)
//				drawToBackBuff(groundBackCtx[curBackBuffInd], particle.position.x - CELL_SIZE, particle.position.y -CELL_SIZE, 
//						particle.position.x - lastRenderX -CELL_SIZE,particle.position.y - lastRenderY -CELL_SIZE, 2*CELL_SIZE,2*CELL_SIZE, 
//						lastRenderX,
//						lastRenderY);

				
			}
			else if (cell > 4) {
				// bounce - assuming hit with floor/ceiling - flip v.y
				particle.direction.y *= -1;
			}
		}
	},
	wind: PWind,
	area: 0.1
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
	sizeRandom: 6,
	colorEdge: 'transparent',
	speed: 1,
	speedRandom: 0,
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
	finishColor: [40, 70, 140, 1],
	finishColorRandom: [10,10,10,0],
	gravity: vector_create(0,.5),
	lifeSpan: 1.2,
	lifeSpanRandom: 0.2,
	positionRandom: vector_create(16,4),
	sharpness: 82,
	sharpnessRandom: 12,
	size: 18,
	finishSize: 8,
	sizeRandom: 1,
	emissionRate: 100,
	speed: 0,
	colorEdge: 'rgba(240,240,255,0)',
	speedRandom: .5,
	startColor: [40, 50, 120, 1],
	startColorRandom: [12, 12, 12, 0],
	updateParticle: function(particle) {
		if (particle.position.y > water_y && particle.direction.y > 0) {
			particle.timeToLive = 0;
		}
	},
	wind: Wind,
	area: 0.05
}),

//waterY = function(x) {
//	var m = (x%WATER_SPRING_DX)/WATER_SPRING_DX;
//	return springs[x/WATER_SPRING_DX | 0].height * m + (1-m)* springs[1+(x/WATER_SPRING_DX | 0)].height;
//}


prev_t = 0,
fps = 0, // DBG

animFrame = function(t) {
	var dt = min(3.5, (t - prev_t)/32);
	prev_t = t;
	var frameInd = (frameCount/3 |0) % WATER_FRAMES;  // TODO: anim water frames based on FPS

	updatePlayer(dt);
	
	// no more updates to player pos at this frame - update camera to point to player
	
	OffsetY = Player.pos.y - HEIGHT/2 |0;
	OffsetX = Player.pos.x - WIDTH/2 |0;
	waterCtx.setTransform(1,0,0,1,-OffsetX, -OffsetY);
	spritesCtx.setTransform(1,0,0,1,-OffsetX, -OffsetY)

	jetpack.position.x = Player.pos.x -(Player.leftFace ? 5: 15);
	jetpack.position.y = Player.pos.y-25;
	
	updateWaves(dt);
	jetpack.update(dt);
	smoke.update(dt);
	water.update(dt);

	
	waterCtx.clearRect(OffsetX,OffsetY,WIDTH,HEIGHT);

	spritesCtx.clearRect(OffsetX,OffsetY,WIDTH,HEIGHT);

	spritesCtx.save()
	spritesCtx.globalCompositeOperation = "lighter";
	jetpack.renderParticles(spritesCtx);
	spritesCtx.restore()
	smoke.renderParticles(spritesCtx);

	if (yellow_man) {
		Player.angle = Math.atan2(OffsetY+MOUSE_POS.y - Player.pos.y, OffsetX+MOUSE_POS.x - Player.pos.x);
		draw_man(0, Player.pos, Player.angle);
	}

	waterCtx.save()
	water.renderParticles(waterCtx);
	waterCtx.restore()
	if (prevFrameInd != frameInd) {
		waterCtx.fillStyle = water_frames[frameInd];
		prevFrameInd = frameInd;
	}
	renderWater();
		
	
	//water_frames[frameInd].draw(0,water_y, WIDTH, HEIGHT);
	water_y -= 0.01*dt;
	if (water_y< WORLD_HEIGHT-1000) {
		water_y = WORLD_HEIGHT-10;
	}


//	groundBackCtx[curBackBuffInd].fillStyle = "#f00";
//	groundBackCtx[curBackBuffInd].fillRect(Player.pos.x - lastRenderX -1, Player.pos.y -lastRenderY -1, 3,3);

//	mountainCtx.clearRect(0,0,WIDTH,HEIGHT)	
//	drawToBackBuff(mountainCtx, OffsetX/CELL_SIZE|0, OffsetY/CELL_SIZE|0, 0,0, BB_WIDTH,BB_HEIGHT);
	redrawDirty();
	scrollBackground(Player.pos.x, Player.pos.y);
	
	
    RQ(animFrame);
    
    frameCount++;
    // TODO: remove later
    if (DBG) {
    	mountainCtx.font="20px Verdana";
    	mountainCtx.fillStyle = '#fff';
    	text= "Wind: "+wind;
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
		mountainCtx.fillText(text, 10,50);
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
	setTimeout(initialize, todo[3] || 0);
};


initFu("Ready!", 10, function() {
	DC.getElementById('overlay').style.display = "none"; // TODO: add class for fade transition
	RQ(animFrame);
})

initialize();