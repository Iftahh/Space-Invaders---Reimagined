
var Player = {
	pos: vector_create(50*CELL_SIZE, 900*CELL_SIZE),   // start position
	v: vector_create()
},



yellow_man = red_man = 0,
MAN_IMG_SIZE = 64*SIZE_FACTOR |0,

man_canvas = createCanvas(2*MAN_IMG_SIZE, MAN_IMG_SIZE),

ctx=Ctx(man_canvas),
	manImage = new Image();

manImage.onload = function() {
  ctx.drawImage(manImage, 0, 0, 2*MAN_IMG_SIZE,MAN_IMG_SIZE);
  yellow_man = createCanvas( 2*MAN_IMG_SIZE,MAN_IMG_SIZE);
//  red_man = createCanvas( 2*MAN_IMG_SIZE,MAN_IMG_SIZE);
//  var rctx = Ctx(red_man);
  var bctx = Ctx(yellow_man),
  	pixels = ctx.getImageData(0,0, 2*MAN_IMG_SIZE,MAN_IMG_SIZE).data,
//  redid = rctx.createImageData( 2*MAN_IMG_SIZE,MAN_IMG_SIZE),
  	yellowid = bctx.createImageData( 2*MAN_IMG_SIZE,MAN_IMG_SIZE),
//  red = redid.data,
  	yellow = yellowid.data,
  	i=0;
  duRange( 2*MAN_IMG_SIZE,MAN_IMG_SIZE, function() {
//	  red[i] = 
		  yellow[i] = pixels[i];
	  i++;
//	  red[i]=pixels[i]/2;
	  yellow[i]=pixels[i];
	  i++;
//	  red[i]=
		  yellow[i]=pixels[i]/2;
	  i++;
//	  red[i]=
		  yellow[i]=pixels[i];
	  i++;
  });
//  rctx.putImageData(redid,0,0)
  bctx.putImageData(yellowid,0,0);
};
manImage.src = './man.gif';


var draw_man = function(color, v, angle) {
	var man = color ? red_man: yellow_man;
	spritesCtx.save();
	spritesCtx.translate(v.x-MAN_IMG_SIZE/2,v.y-MAN_IMG_SIZE);
	if (Player.leftFace) {
		spritesCtx.translate(MAN_IMG_SIZE,0);
		spritesCtx.scale(-1,1);
		angle = PI - angle;
	}
	spritesCtx.drawImage(man, 0,0, MAN_IMG_SIZE,MAN_IMG_SIZE, 0, 0, MAN_IMG_SIZE,MAN_IMG_SIZE);
	spritesCtx.translate(MAN_IMG_SIZE/3+MAN_IMG_SIZE/9,MAN_IMG_SIZE/3);
	spritesCtx.rotate(angle);
	spritesCtx.drawImage(man, MAN_IMG_SIZE,0, MAN_IMG_SIZE,MAN_IMG_SIZE, -MAN_IMG_SIZE/3, -MAN_IMG_SIZE/3, MAN_IMG_SIZE,MAN_IMG_SIZE);
	spritesCtx.restore();
//	C.fillStyle= "#f00";
//	C.fillRect(v.x-1, v.y-1, 3,3)
},

// hack to keep on the ground few ticks even when in air
 leftGround = 0, 
/***
 * Updates player location/speed for collision with mountain
 * @returns True if standing on ground (colliding down feet-floor)
 */
checkPlayerCollision = function() {
	var cell = getCellType(Player.pos.x / CELL_SIZE|0, (Player.pos.y-MAN_IMG_SIZE*.4)/CELL_SIZE|0),
		deepCollide = headCollide = feetCollide = false,
		horizOffset = 0,
		toMoveX=0;
	
	Player.inWind = cell == AIR || cell == GRASS || cell == BURNED_GRASS;
	if (Player.v.x > 0) {
		horizOffset = MAN_IMG_SIZE/4;
		toMoveX = -Player.pos.x%CELL_SIZE;
	}
	if (Player.v.x < 0) {
		horizOffset = MAN_IMG_SIZE/-4;
		toMoveX = -Player.pos.x%CELL_SIZE+CELL_SIZE;
	}
	
	// simple collision check
	
	// check collision at head level
	if (isCollide((Player.pos.x+horizOffset) / CELL_SIZE |0, (Player.pos.y-MAN_IMG_SIZE*.8)/CELL_SIZE|0)) {
		headCollide = true;
		if (isCollide(
				(Player.pos.x+horizOffset) / CELL_SIZE |0, (Player.pos.y-MAN_IMG_SIZE*.6)/CELL_SIZE|0)) {
			// deep collide - bounce back x and move back player
			deepCollide = true;
		}
	}
	// check at feet level - only if going down
	if (Player.v.y >= 0 && isCollide((Player.pos.x+horizOffset) / CELL_SIZE |0, (Player.pos.y+2*CELL_SIZE)/CELL_SIZE|0)) {
		feetCollide = true;
		// collide at feet level - check slightly above and lift if ok
		if (isCollide((Player.pos.x+horizOffset) / CELL_SIZE |0, (Player.pos.y)/CELL_SIZE|0)) {
			deepCollide = true;
		}
	}
	
	if (feetCollide || headCollide) {
		if (deepCollide) {
			// deep collide - bounce back 
			Player.v.x *= -.3;
			Player.pos.x += toMoveX;
		}

		if (abs(Player.v.y) < .3) {
			Player.v.y = 0;
		}
		else {
			Player.v.y *= -.3;
		}
		
		if (headCollide) {
			Player.pos.y += CELL_SIZE-(Player.pos.y%CELL_SIZE);
			if (!deepCollide) {
				Player.pos.y += CELL_SIZE;
			}
			Player.v.x *= .2; // friction with ceiling - remove for ice?
		}
		if (feetCollide) {
			
			Player.pos.y -= Player.pos.y%CELL_SIZE;
			if (deepCollide) {
				Player.pos.y -= CELL_SIZE;
			}
			Player.onGround =  true;
			leftGround = 0;
			return;
		}
	}
	
	// hack: stay on ground for 6 ticks even if not feet collided
	if (leftGround++ > 6) {
		Player.onGround = false;
	}
},

SPACE = 32
KEYS={},

updateFromKeys = function(e) {
    KEYS[e.keyCode]=  e.type == "keydown";
    if (e.keyCode == 32 || e.keyCode >=37 && e.keyCoe <= 40)
        e.preventDefault();
},
isLeftPressed = function() {
	return KEYS[37] || // left arrow
	 	 KEYS[65] || KEYS[83]  // 'a' or 's';
},
isRightPressed = function() {
	return KEYS[39]  || // right arrow
		KEYS[68] || KEYS[70]  // 'd' or 'f'
};

DC.addEventListener('keydown', updateFromKeys)
DC.addEventListener('keyup', updateFromKeys)

DC.body.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, false);

var MOUSE_POS = {x:0, y:0};
canvases[canvases.length-1].addEventListener('mousemove', function(evt) {
	var rect = canvases[1].getBoundingClientRect();
	MOUSE_POS = {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}, false);

canvases[canvases.length-1].addEventListener('onmousedown', function(evt) {
	
})

var last = [],
	laserGraveyard = [],



updatePlayer = function(dt) {
	var WATER_FRICTION = 0.76,
		AIR_FRICTION = .99;
	
	var speed = KEYS[SPACE] ? 1.65 : 0.6;
	if (isLeftPressed()) {
		Player.v.x = max(-10, Player.v.x-speed);
		Player.leftFace = true;
	}
	else if (isRightPressed()) {
		Player.v.x = min(10, Player.v.x+speed);
		Player.leftFace = false;
	}
	else {
		Player.leftFace = Player.angle > PI/2 || Player.angle < -PI/2
	}
	if (!Player.onGround && Player.inWind) {
		Player.v.x += windForce(Wind(), Player.v.x, .02);
	}

	jetpack.active = KEYS[SPACE];
	var above = Player.pos.y < water_y;
	Player.v.scale(above? AIR_FRICTION : WATER_FRICTION) // air or water friction

	// gravity or jetpack  -  higher gravity while "onGround" to allow going down diagonal without hopping
	Player.v.y = minmax(-10,20, Player.v.y + (KEYS[SPACE] ? -.25 : (Player.onGround ? 0.8 : .5)));
	var dist = vector_multiply(Player.v, dt)
	Player.pos.add(dist);
	
	
	if (Player.pos.y > water_y) {
		if (above) {
			var x = WIDTH/2;//Player.pos.x;
//			if (x < WIDTH && x>0)
				springs[springs.length*(1-x/WIDTH) |0].velocity = 22*Player.v.y;
				console.log("wave "+22*Player.v.y)
			// splash some droplets
			water.active = true;
			water.position.x = Player.pos.x;
			water.position.y = Player.pos.y+MAN_IMG_SIZE-8;
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

	checkPlayerCollision();
	if (Player.onGround) {
		 // friction with ground - for ice do not alter v.x
		if (abs(Player.v.x) < .3) {
			Player.v.x = 0;
		}
		else {
			Player.v.x *= .8;
		}
	}
};
