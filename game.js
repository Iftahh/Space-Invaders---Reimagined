

//var fcurCameraX, fcurCameraY; //  fcur-camera defines what is being viewed - needed to be float in order not to lock

var OffsetX = OffsetY = 0; //  is the integer round of fcur - needed to be int in order to avoid fuzzy drawimage for images

//var trns = function(hscale,hskew,vskew,vscale,x,y) { C.setTransform(hscale,hskew,vskew,vscale,x-OffsetX,y-OffsetY) }  //






	



//rdp = [148, 1000, 500, 400];
//grp = [610, 60, 864, 860];
//blp = [180, 100, 503, 103];
//
//wavy = function(x,y,p, yp1, yp2){
//    return 63*(((sqrt(sq(p[0]-x)+yp1)+1)/((abs(sin((sqrt(sq(p[2]-x)+yp2))/115)))+1)/200)|0);
//}

//
//wavy_canvas = r2c(WIDTH, HEIGHT, function(ctx, canvas) {
//	var imgData=ctx.createImageData(WIDTH,HEIGHT);
//    var d = imgData.data;
//    var i=0; // pixel index
//    for (var y=0;y<HEIGHT;y++) {
//    	for (var x=0; x<WIDTH; x++) {
//    		d[i++] = wavy(x,y, rdp);
//    		d[i++] = wavy(x,y, grp);
//    		d[i++] = wavy(x,y, blp);
//   		
//    		d[i++] = U8;
//    	}
//    }
//    ctx.putImageData(imgData,0,0);
//})




//
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
skyCtx.fillStyle = sky_pattern;
skyCtx.fillRect(0,0,WIDTH,HEIGHT);
var prevFrameInd;
waterCtx.globalAlpha = 0.9;

WIND = function() {return wind; }

// based on http://stackoverflow.com/questions/4412345/implementing-wind-speed-in-our-projectile-motion
windForce=  function(wind, speed, area) {
	var dv = wind - speed;
	return minmax(-10,10, abs(dv)*dv*area);
}

WATER_FRAMES = 2// 20
range(WATER_FRAMES, function(i) {
	water_frames[i] = waterCtx.createPattern(water_canvas(i * TPI/WATER_FRAMES), 'no-repeat');
})

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


drawImg(groundCtx, level, 0,0)

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
		if (Player.pos.y> water_y+100)
			Player.pos.y = 0;
	}
	if (Player.pos.x > WIDTH+10) {
		Player.pos.x = 0;
	}
	if (Player.pos.x < -10) {
		Player.pos.x = WIDTH;
	} 

	jetpack.position.x = Player.pos.x-(Player.leftFace ? 5: 15);
	jetpack.position.y = Player.pos.y-25;
	
	updateWater(dt);
	jetpack.update(dt);
	smoke.update(dt);
	water.update(dt);

	
	waterCtx.clearRect(0,0,WIDTH,HEIGHT);

	spritesCtx.clearRect(0,0,WIDTH,HEIGHT);

	spritesCtx.save()
	spritesCtx.globalCompositeOperation = "lighter";
	jetpack.renderParticles(spritesCtx);
	spritesCtx.restore()
	smoke.renderParticles(spritesCtx);

	if (red_man) {
		Player.angle = Math.atan2(MOUSE_POS.y - Player.pos.y, MOUSE_POS.x - Player.pos.x);
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
	if (water_y<200) {
		water_y = HEIGHT-10;
	}

	var dx=dy = 0;
	if (MOUSE_POS.x > WIDTH - 20 && OffsetX < LevelW-WIDTH) {
		dx = 5;
	}
	if (MOUSE_POS.x < 20 && OffsetX > 0) {
		dx = -5;
	}
	if (MOUSE_POS.y > HEIGHT - 20 && OffsetY < LevelH-HEIGHT) {
		dy = 5;
	}
	if (MOUSE_POS.y < 20 && OffsetY > 0) {
		dy = -5;
	}
	if (dx || dy) {
		OffsetX += dx;
		OffsetY += dy;
		groundCtx.translate(-dx, -dy);
		groundCtx.clearRect(OffsetX,OffsetY,WIDTH,HEIGHT)
		drawImg(groundCtx, level, 0,0)
	}
	
    RQ(animFrame);
    
    // TODO: remove later
    frameCount++;
	if (t - t0 > 10000) {
		t0 = t;
		wind = rndab(-10,10)
		console.log((frameCount-prevCount)/10, " avg FPS, wind:", wind);
		prevCount = frameCount;
	}    
};

RQ(animFrame);
