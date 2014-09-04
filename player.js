

yellow_man = red_man = 0;

man_canvas = createCanvas(96,48);

var	ctx=Ctx(man_canvas),
	manImage = new Image();
manImage.onload = function() {
  ctx.drawImage(manImage, 0, 0, 96,48);
  yellow_man = createCanvas(96,48);
  red_man = createCanvas(96,48);
  var rctx = Ctx(red_man);
  var bctx = Ctx(yellow_man);
  var pixels = ctx.getImageData(0,0,96,48).data;
  var redid = rctx.createImageData(96,48);
  var yellowid = bctx.createImageData(96,48);
  var red = redid.data;
  var yellow = yellowid.data;
  var i=0;
  duRange(96,48, function() {
	  red[i] = yellow[i] = pixels[i];
	  i++;
	  red[i]=pixels[i]/2;
	  yellow[i]=pixels[i];
	  i++;
	  red[i]=yellow[i]=pixels[i]/2;
	  i++;
	  red[i]=yellow[i]=pixels[i];
	  i++;
  });
  rctx.putImageData(redid,0,0)
  bctx.putImageData(yellowid,0,0)
};
manImage.src = './man.gif';


draw_man = function(color, v, angle) {
	var man = color ? red_man: yellow_man;
	spritesCtx.save();
	spritesCtx.translate(v.x-24,v.y-48);
	if (Player.leftFace) {
		spritesCtx.translate(48,0);
		spritesCtx.scale(-1,1);
		angle = PI - angle;
	}
	spritesCtx.drawImage(man, 0,0, 48,48, 0, 0, 48,48);
	spritesCtx.translate(16+5,16);
	spritesCtx.rotate(angle);
	spritesCtx.drawImage(man, 48,0, 48,48, -16, -16, 48,48);
	spritesCtx.restore();
//	C.fillStyle= "#f00";
//	C.fillRect(v.x-1, v.y-1, 3,3)
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

