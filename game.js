


MOUSE_POS = {x:0, y:0}
rect = canvases[1].getBoundingClientRect();
canvases[canvases.length-1].addEventListener('mousemove', function(evt) {
	MOUSE_POS = {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}, false);

	

frameCount = 0;

var prevCount = frameCount;
var t0 = -1;

var prevFrameInd;
waterCtx.globalAlpha = 0.9;

WIND = function() {return wind; }

// based on http://stackoverflow.com/questions/4412345/implementing-wind-speed-in-our-projectile-motion
windForce=  function(wind, speed, area) {
	var dv = wind - speed;
	return minmax(-10,10, abs(dv)*dv*area);
}


Player = {
	pos: vector_create(WIDTH/2, HEIGHT/2),
	v: vector_create()
}

jetpack = ParticlePointEmitter(250, {
	position: vector_create(WIDTH/2, HEIGHT/2),
	angle: 90,
	angleRandom: 10,
	duration: -1,
	finishColor: [200, 45, 10, 0],
	finishColorRandom: [40,40,40,0],
	gravity: vector_create(0,.03),
	lifeSpan: 1,
	lifeSpanRandom: 0,
	positionRandom: vector_create(3,3),
	sharpness: 12,
	sharpnessRandom: 12,
	size: 20,
	finishSize: 50,
	colorEdge: 'rgba(40,20,10,0)',
	sizeRandom: 4,
	speed: 4,
	speedRandom: 1,
	startColor: [220, 188, 88, 1],
	startColorRandom: [32, 35, 38, 0],
	updateParticle: function(particle) {
		if (particle.position.y > water_y) {
			particle.timeToLive = 0;
			var smokePar = smoke.addParticle();
			if (smokePar) {
				var x = particle.position.x;
				smokePar.position.x = x;
				smokePar.position.y = particle.position.y;
				var spring = springs[springs.length*(1-x/WIDTH) |0 + irndab(-1,2)];
				if (spring) {
					spring.velocity += 1;
				}
			}
		}
	},
	wind: WIND,
	area: 0.1
});

smoke = ParticlePointEmitter(250, {
	active:false,
	position: vector_create(),
	angle: -90,
	angleRandom: 20,
	duration: 10,
	finishColor: [40, 40, 40, 0],
	finishColorRandom: [10,10,10,0],
	gravity: vector_create(0,-.03),
	lifeSpan: .8,
	lifeSpanRandom: 0.2,
	positionRandom: vector_create(2,2),
	sharpness: 12,
	sharpnessRandom: 12,
	size: 30,
	finishSize: 40,
	sizeRandom: 4,
	colorEdge: 'transparent',
	speed: 1,
	speedRandom: 0,
	startColor: [220, 220, 220, 1],
	startColorRandom: [22, 22, 22, 0],
	wind: WIND,
	area: 0.8
});


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
	wind: WIND,
	area: 0.05
});

//waterY = function(x) {
//	var m = (x%WATER_SPRING_DX)/WATER_SPRING_DX;
//	return springs[x/WATER_SPRING_DX | 0].height * m + (1-m)* springs[1+(x/WATER_SPRING_DX | 0)].height;
//}


var prev_t = 0;

var animFrame = function(t) {
	var dt = min(3.5, (t - prev_t)/32);
	prev_t = t;
	var frameInd = (frameCount/6 |0) % WATER_FRAMES;


	var speed = KEYS[SPACE] ? 1.65 : 0.6;
	if (KEYS[LEFT]) {
		Player.v.x = max(-12, Player.v.x-speed);
		Player.leftFace = true;
	}
	else if (KEYS[RIGHT]) {
		Player.v.x = min(9, Player.v.x+speed);
		Player.leftFace = false;
	}
	else {
		Player.leftFace = Player.angle > PI/2 || Player.angle < -PI/2
	}
	Player.v.x += windForce(WIND(), Player.v.x, .02);
//	if (KEYS[UP]) {
//		Player.v.y = max(-3, Player.v.y-.1);
//	}
//	if (KEYS[DOWN]) {
//		Player.v.y = min(3, Player.v.y+.1);
//	}
	jetpack.active = KEYS[SPACE];
	var above = Player.pos.y < water_y;
	Player.v.scale(above? .99 : 0.76) // air or water friction
	// gravity or jetpack
	Player.v.y = minmax(-12,22, Player.v.y + (KEYS[SPACE] ? -.2 : .5));
	var dist = vector_multiply(Player.v, dt)
	Player.pos.add(dist);
	
	
	if (Player.pos.y > water_y) {
		if (above) {
			var x = Player.pos.x;
			if (x < WIDTH && x>0)
				springs[springs.length*(1-x/WIDTH) |0].velocity = 22*Player.v.y;
			water.active = true;
			water.position.x = x;
			water.position.y = Player.pos.y+40;
			water.speed = 0.75*Player.v.y;
			water.emissionRate = 20*abs(Player.v.y);
			//water.angle = Math.atan2(-abs(Player.v.y), 2*Player.v.x) * 180/PI;
		}
		if (Player.pos.y> water_y+HEIGHT*.5)
			Player.pos.y = 0;
	}
	if (Player.pos.x > WORLD_WIDTH+WIDTH) {
		Player.pos.x = -WIDTH;
	}
	if (Player.pos.x < -WIDTH) {
		Player.pos.x = WORLD_WIDTH+WIDTH;
	} 
	
	// no more updates to player pos at this frame - update camera to point to player
	
	OffsetY = Player.pos.y - HEIGHT/2 |0;
	OffsetX = Player.pos.x - WIDTH/2 |0;
	waterCtx.setTransform(1,0,0,1,-OffsetX, -OffsetY);
	spritesCtx.setTransform(1,0,0,1,-OffsetX, -OffsetY)

	jetpack.position.x = Player.pos.x; // WIDTH/2-(Player.leftFace ? 5: 15);
	jetpack.position.y = Player.pos.y; //HEIGHT/2-25;
	
	updateWater(dt);
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

	if (red_man) {
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

//	var dx=dy = 0;
//	if (MOUSE_POS.x > WIDTH - 20 && OffsetX < CELL_SIZE*levelWidth-WIDTH) {
//		dx = 5;
//	}
//	if (MOUSE_POS.x < 20 && OffsetX > 0) {
//		dx = -5;
//	}
//	if (MOUSE_POS.y > HEIGHT - 20 && OffsetY < CELL_SIZE*levelHeight-HEIGHT) {
//		dy = 5;
//	}
//	if (MOUSE_POS.y < 20 && OffsetY > 0) {
//		dy = -5;
//	}
//	if (dx || dy) {
//		OffsetX += dx;
//		OffsetY += dy;
//		mountainCtx.translate(-dx, -dy);
//		mountainCtx.clearRect(OffsetX,OffsetY,WIDTH,HEIGHT)
//		drawImg(mountainCtx, level, 0,0)
		mountainCtx.clearRect(0,0,WIDTH,HEIGHT)
		drawToBackBuff(OffsetX/5|0, OffsetY/5|0, 0,0, BB_WIDTH,BB_HEIGHT);
		drawImg(mountainCtx, groundBackBuffs[curBackBuffInd], 0,0)

	//}
	
    RQ(animFrame);
    
    // TODO: remove later
    frameCount++;
    if (DBG) {
    	mountainCtx.font="20px Verdana";
    	mountainCtx.fillStyle = '#fff';
    	text= "Wind: "+wind;
    	text+= "  Player: "+Player.pos.x.toFixed(2)+","+Player.pos.y.toFixed(2);
		if (t - t0 > 10000) {
			t0 = t;
			//wind = rndab(-10,10)
			//console.log((frameCount-prevCount)/10, " avg FPS, wind:", wind);
			text += "  FPS: "+(frameCount-prevCount)/10
			prevCount = frameCount;
		}
		mountainCtx.fillText(text, 10,50);
    }
};

initFu("Ready!", 10, function() {
	DC.getElementById('overlay').style.display = "none"; // TODO: add class for fade transition
	RQ(animFrame);
})

progress = 0;
var initialize = function() {
	if (initQueue.length == 0)
		return;
	var todo = initQueue.shift();
	var text = todo[0];
	var pg = todo[1];
	DC.getElementById("text").textContent= text;
	progress+=pg;
	console.log("Progress: "+progress+"  text: "+text+"  "+Date())
	if (DBG && progress > 100) alert("prgs at "+progress+" text is "+text);
	DC.getElementById('pbar-in').style.width = (progress*2)+'px'

	todo[2]();
	setTimeout(initialize, todo[3] || 0);
}
initialize();