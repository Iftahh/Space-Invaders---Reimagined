
Player = {
	pos: vector_create(50*CELL_SIZE, 900*CELL_SIZE),   // start position
	v: vector_create()
}



yellow_man = red_man = 0;
MAN_IMG_SIZE = 64*SIZE_FACTOR |0

man_canvas = createCanvas(2*MAN_IMG_SIZE, MAN_IMG_SIZE);

var	ctx=Ctx(man_canvas),
	manImage = new Image();
manImage.onload = function() {
  ctx.drawImage(manImage, 0, 0, 2*MAN_IMG_SIZE,MAN_IMG_SIZE);
  yellow_man = createCanvas( 2*MAN_IMG_SIZE,MAN_IMG_SIZE);
//  red_man = createCanvas( 2*MAN_IMG_SIZE,MAN_IMG_SIZE);
//  var rctx = Ctx(red_man);
  var bctx = Ctx(yellow_man);
  var pixels = ctx.getImageData(0,0, 2*MAN_IMG_SIZE,MAN_IMG_SIZE).data;
//  var redid = rctx.createImageData( 2*MAN_IMG_SIZE,MAN_IMG_SIZE);
  var yellowid = bctx.createImageData( 2*MAN_IMG_SIZE,MAN_IMG_SIZE);
//  var red = redid.data;
  var yellow = yellowid.data;
  var i=0;
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
  bctx.putImageData(yellowid,0,0)
};
manImage.src = './man.gif';


draw_man = function(color, v, angle) {
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
}

// hack to keep on the ground few ticks even when in air
var leftGround = 0; 
/***
 * Updates player location/speed for collision with mountain
 * @returns True if standing on ground (colliding down feet-floor)
 */
checkPlayerCollision = function() {
	Player.inWind = 0 == getCellType(Player.pos.x / CELL_SIZE|0, (Player.pos.y-MAN_IMG_SIZE/3)/CELL_SIZE|0);
	// simple collision check
	if (Player.v.x > 0) {
		// check right side collision
		var cell = getCellType((Player.pos.x+MAN_IMG_SIZE/4) / CELL_SIZE |0, Player.pos.y/CELL_SIZE|0)
		if (cell >= 5) {
			// collide at feet level - check slightly above and lift if ok
			var cell = getCellType((Player.pos.x+MAN_IMG_SIZE/4) / CELL_SIZE |0, (Player.pos.y-MAN_IMG_SIZE/3)/CELL_SIZE|0)
			if (cell < 5) {
				Player.pos.y -= CELL_SIZE;
			}
			else {
				Player.v.x *= -.2;
				Player.pos.x -= Player.pos.x%CELL_SIZE;
			}
		}
	}
	if (Player.v.x < 0) {
		// check left side collision
		var cell = getCellType((Player.pos.x-MAN_IMG_SIZE/4) / CELL_SIZE |0, Player.pos.y/CELL_SIZE|0)
		if (cell >= 5) {
			// collide
			var cell = getCellType((Player.pos.x-MAN_IMG_SIZE/4) / CELL_SIZE |0, (Player.pos.y-MAN_IMG_SIZE/3)/CELL_SIZE|0)
			if (cell < 5) {
				Player.pos.y -= CELL_SIZE;
			}
			else {
				Player.v.x *= -.2;
				Player.pos.x += CELL_SIZE-(Player.pos.x%CELL_SIZE);
			}
		}
	}
	if (Player.v.y < 0) {
		// check head collision
		var cell = getCellType(Player.pos.x / CELL_SIZE |0, (Player.pos.y-MAN_IMG_SIZE*.9)/CELL_SIZE|0)
		if (cell >= 5) {
			// collide
			if (Player.v.y > -.3) {
				Player.v.y = 0;
			}
			else {
				Player.v.y *= -.3;
			}
			Player.pos.y += CELL_SIZE-(Player.pos.y%CELL_SIZE);
			Player.v.x *= .2;
		}
	}
	if (Player.v.y > 0) {
		// check feet collision
		var cell = getCellType(Player.pos.x / CELL_SIZE |0, Player.pos.y/CELL_SIZE|0)
		if (cell >= 5) {
			// collide
			if (Player.v.y < .3) {
				Player.v.y = 0;
			}
			else {
				Player.v.y *= -.3;
			}
			Player.pos.y -= Player.pos.y%CELL_SIZE; 
			Player.onGround =  true;
			leftGround = 0;
			return;
		}
	}
	if (leftGround++ > 6) {
		Player.onGround = false;
	}
}

LEFT = 37;
RIGHT = 39;
UP = 38;
DOWN = 40;
SPACE = 32;
var KEYS={}

var updateFromKeys = function(e) {
    KEYS[e.keyCode]=  e.type == "keydown";
    if (e.keyCode == 32 || e.keyCode >=37 && e.keyCoe <= 40)
        e.preventDefault();
}
DC.addEventListener('keydown', updateFromKeys)
DC.addEventListener('keyup', updateFromKeys)

DC.body.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, false);



updatePlayer = function(dt) {
	var WATER_FRICTION = 0.76,
		AIR_FRICTION = .99;
	
	var speed = KEYS[SPACE] ? 1.65 : 0.6;
	if (KEYS[LEFT]) {
		Player.v.x = max(-10, Player.v.x-speed);
		Player.leftFace = true;
	}
	else if (KEYS[RIGHT]) {
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
	Player.v.y = minmax(-10,20, Player.v.y + (KEYS[SPACE] ? -.2 : (Player.onGround ? 0.9 : .5)));
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
}