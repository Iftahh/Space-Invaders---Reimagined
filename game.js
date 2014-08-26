

DC = document;


range = function(maxInt,iterFu,increment) {
    increment = increment || 1;
    for (var i=0; i<maxInt; i += increment)
        iterFu(i)
}
// breaking-range - will return non-false value from iterator and break the loop
brrange = function(maxInt,iterFu,increment) {
    increment = increment || 1;
    for (var i=0; i<maxInt; i += increment) {
        var res = iterFu(i)
        if (res) return res;
    }
}

// return non-false value from iterator will break the loop
each = function(collection, iterFu) {
	// looping from end to start - to allow easy removal of iterated element without skipping 
    for (var i=collection.length-1; i>=0; i--) {
        var $=collection[i];
        if (iterFu($,i)) {
        	return;
        }
    }
}

duRange = function(w,h, fu) {
	for (var y=0; y<h; y++)
		for (var x=0; x<w; x++)
			fu(x,y);
}

WIDTH = 1024;
HEIGHT = 768;

createCanvas = function(w,h) {
	  var c = DC.createElement('canvas');
	  c.width = w || WIDTH;
	  c.height = h || HEIGHT;
	  return c;
	}


// LAYERS
canvases = [];
contexts = [];


var cont =  DC.getElementById('canvas_cont');
range(3, function(i) { 
   var canvas = createCanvas();
   cont.appendChild(canvas);
   canvases.push(canvas);
   contexts.push(canvas.getContext("2d"))
});

// Forward (front) Context
FdC = canvases[1].getContext("2d")
C = FdC; // current canvas to draw to - may toggle around for double buffering

// Background context
BgC = canvases[0].getContext("2d")

// Top context (overlay)
Tch = canvases[2].getContext("2d")


rnd = Math.random;
abs = Math.abs;
min = Math.min;
max = Math.max;
sin= Math.sin;
round = Math.round;
sqrt=Math.sqrt;
sq=function(x){return x*x}
OA = 255; // opaque alpha
PI = Math.PI;
TPI = 2*PI;



// random in range [0,a)
rnda = function(a) { return rnd()*a}
// random integer in range [0,a-1]
irnda = function(a) { return rnda(a) << 0}
// random in range [a,b)
rndab = function(a,b) { return a+rnda(b-a)}
// random integer in range [a,b-1] 
irndab = function(a,b) { return rndab(a,b)<<0 }


// polyfill RequestAnimFrame
suffix = 'equestAnimationFrame';
RQ= window['r'+suffix] || window['mozR'+suffix] || window['webkitR'+suffix]
if (!RQ) {
    var lastTime = 0;
    RQ = function(callback) {
        var currTime = Date.now();
        var timeToCall = max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
            timeToCall);
        lastTime = currTime + timeToCall;
    }
}


//var fcurCameraX, fcurCameraY; //  fcur-camera defines what is being viewed - needed to be float in order not to lock

var OffsetX = OffsetY = 0; //  is the integer round of fcur - needed to be int in order to avoid fuzzy drawimage for images

//var trns = function(hscale,hskew,vskew,vscale,x,y) { C.setTransform(hscale,hskew,vskew,vscale,x-OffsetX,y-OffsetY) }  //



// render to canvas - creates a canvas, render to it with a renderFunction,
// and return it with added draw(x,y,w,h) method that draws the canvas to the main one
var r2c=function (width, height, renderFunction) {
    var canvas = createCanvas(width, height)
    renderFunction(canvas.getContext('2d'), canvas);
    canvas.draw = function(x,y,w,h) { C.drawImage(this, x,y,w,h) }
    return canvas;
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


// taken from http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
Filters = {
	getPixels: function(c) {
	  var ctx = c.getContext('2d');
	  return ctx.getImageData(0,0,c.width,c.height);
	},
		
	filterCanvas: function(filter, c, var_args) {
	  var args = [Filters.getPixels(c)];
	  for (var i=2; i<arguments.length; i++) {
	    args.push(arguments[i]);
	  }
	  return filter.apply(null, args);
	},

	tmpCanvas: DC.createElement('canvas'),
	
	createImageData: function(w,h) {
	  return this.tmpCtx.createImageData(w,h);
	},
	
	convolute: function(pixels, weights, wrap) {
		  var side = round(sqrt(weights.length));
		  var halfSide = (side/2)<<0;
		  var src = pixels.data;
		  var sw = pixels.width;
		  var sh = pixels.height;
		  // pad output by the convolution matrix
		  var w = sw;
		  var h = sh;
		  var output = Filters.createImageData(w, h);
		  var dst = output.data;
		  // go through the destination image pixels
		  //var alphaFac = opaque ? 1 : 0;
		  var dstOff = 0;
		  duRange(w,h, function(x,y) {
		      var sy = y;
		      var sx = x;
		      // calculate the weighed sum of the source image pixels that
		      // fall under the convolution matrix
		      var r=0, g=0, b=0;//, a=0;
		      duRange(side, side, function(cx,cy) {
		          var scy = sy + cy - halfSide;
		          var scx = sx + cx - halfSide;
		          scy += HEIGHT*10;
		          scy %= HEIGHT;
		          scx += WIDTH*10;
		          scx %= WIDTH;
		          //if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
		            var srcOff = (scy*sw+scx)*4;
		            var wt = weights[cy*side+cx];
		            r += src[srcOff] * wt;
		            g += src[srcOff+1] * wt;
		            b += src[srcOff+2] * wt;
		            //a += src[srcOff+3] * wt;
		          //}
		      })
		      dst[dstOff++] = r;
		      dst[dstOff++] = g;
		      dst[dstOff++] = b;
		      dst[dstOff++] = OA;//a + alphaFac*(255-a);
		  })
		  return output;
		}
};
Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');

//
//// pattern of stones
//var stone_canvas = r2c(256, 256, function(context, canvas) {
//	
//})
//

var painty = function(buffer, base_min, base_top, mndirx,mxdirx, mndiry, mxdiry, color_step, seed_chance) {
	var fu = function(x,y) {
		var ei=y*WIDTH+x;
		try {
			return buffer[ei] ?
						buffer[ei] :
						buffer[ei]= irnda(seed_chance) ? 
									255 & max(0, (irnda(color_step)+fu((x-irndab(mndirx,mxdirx)) %WIDTH, 
											(y-irndab(mndiry,mxdiry))%HEIGHT)))
									: irndab(base_min,base_top);
		}
		catch(e) {
			return buffer[ei]= irndab(base_min,base_top);
		}
	}
	return fu;
}


// build level map
var LevelW = 400;
var LevelH = 100;
function initLevel() {
	level = r2c(LevelW, LevelH, function(ctx, canvas) {
		ctx.fillStyle = "#fff";
		ctx.lineWidth = 6;
		ctx.fillRect(0,0,LevelW,LevelH);
		ctx.strokeStyle = "#ddd";
		ctx.textAlign = 'center';
		ctx.font = "bold 30px Arial";
		ctx.fillStyle = "#aaa";

		// text air wrapper
		var T = "JS13KGAMES 2014";
		ctx.strokeText(T,200,50);
		
		// mountain
		ctx.beginPath();
		var prev = LevelH;
		ctx.lineTo(0,prev);
		range(LevelW, function(x) {
			ctx.lineTo(x, irndab(2,10)+(1-sq(sin(PI*x/LevelW))+.1*sq(sin(6*TPI*x/LevelW)))*LevelH);
		}, 5);
		ctx.lineTo(LevelW,LevelH);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		
		// text full inner
		ctx.fillStyle = "#000";
		ctx.fillText(T,200,50);
		ctx.fillStyle = "#fff";
		

		ctx.fillStyle = "#ddd";
		T = "ISLAND WAR";
		ctx.fillText(T,200,86);
		
		var pixels = ctx.getImageData(0,0,LevelW, LevelH).data;
		var i=0;
		for (var y=0; y<LevelH; y++) {
			var _y = round(HEIGHT*y/LevelH);
			for (var x=0; x<LevelW; x++) {
				var site = {x: round(WIDTH*x/LevelW) + irndab(-1,2), 
							y: _y+irndab(-1,2) 
							}
					if (pixels[i] > 210 && pixels[i] < 235) {
					// air
					site.c = 0;
				}
				else  if (pixels[i] > 150 && pixels[i] < 180) {
					// dirt
					site.c = 1;
				}
				else if (pixels[i] < 30) {
					site.c = 2;
				}
				else {
					i+=4;
					continue;
				}
				//VoronoiDemo.sites.push(site);
				i += 4;
			}
		}
	});
	//level.draw(0,0,LevelW, LevelH);
}

yellow_man = red_man = 0;

man_canvas = r2c(96,48, function(ctx) {
	var manImage = new Image();
	manImage.onload = function() {
	  ctx.drawImage(manImage, 0, 0, 96,48);
	  yellow_man = createCanvas(96,48);
	  red_man = createCanvas(96,48);
	  var rctx = red_man.getContext('2d');
	  var bctx = yellow_man.getContext('2d');
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
})

draw_man = function(color, x,y,angle) {
	var man = color ? red_man: yellow_man;
	C.save();
	C.translate(x-24,y-48);
	if (Player.flipped = angle > PI/2 || angle < -PI/2) {
		C.translate(48,0);
		C.scale(-1,1);
		angle = PI - angle;
	}
	C.drawImage(man, 0,0, 48,48, 0, 0, 48,48);
	C.translate(16+5,16);
	C.rotate(angle);
	C.drawImage(man, 48,0, 48,48, -16, -16, 48,48);
	C.restore();
	C.fillStyle= "#f00";
	C.fillRect(x-1, y-1, 3,3)
}

var sky_width = 250;

sky_canvas = r2c(sky_width, HEIGHT, function(ctx, canvas) {
	var imgData=ctx.createImageData(sky_width,HEIGHT);
    var d = imgData.data;
    
    var i=0; // pixel index
    range(sky_width, function(x) {
    	d[i++] = 40; // red
		d[i++] = 50; // green
		d[i++] = 80; // blue;    		
		d[i++] = OA;
    })
    var row_offset = sky_width*4; // 4 bytes per pixel
    duRange(sky_width, HEIGHT-1, function() {
		d[i] =  (d[i-4]+d[i-row_offset] >> 1) + max(0,irndab(-5,3));
		i++;
		d[i] = (d[i-4]+d[i-row_offset] >> 1) + max(0,irndab(-5,3));
		i++;
		d[i] = (d[i-4]+d[i-row_offset] >> 1) + max(0,irndab(-5,3));
		i++;
		d[i++] = OA;    	
    });
    ctx.putImageData(imgData,0,0);
})

var sky_pattern = C.createPattern(sky_canvas, 'repeat-x');

if (false) {


	
	//
	ice_canvas = r2c(WIDTH, HEIGHT, function(ctx, canvas) {
		var imgData=ctx.createImageData(WIDTH,HEIGHT);
	    var d = imgData.data;
	    var red = painty([], 60,110, 1,3, 1,3, -4, 100);
	    var green = painty([], 80,160, 1,3, 1,3, -2, 500);
	    var blue = painty([], 20, 40, 1,3, 1,3, 3, 1000);
	    var i=0; // pixel index
	    duRange(WIDTH, HEIGHT, function(x,y) {
	    	d[i++] = red(x,y);
    		d[i++] = green(x,y);
    		d[i++] = blue(x,y);    		
    		d[i++] = OA;
	    });
	    ctx.putImageData(imgData,0,0);
	})
	
	
	
	grass_canvas = r2c(WIDTH, HEIGHT, function(ctx, canvas) {
		var imgData=ctx.createImageData(WIDTH,HEIGHT);
	    var d = imgData.data;
	    var red = painty([], 60,150, -3,-1, 1,3, -2, 100);
	    var green = painty([], 40,90, -3,-1, 1,3, 3, 200);
	    var blue = painty([], 70, 120, -3,-1, 1,3, -3, 100);
	    var i=0; // pixel index
	    duRange(WIDTH,HEIGHT, function(x,y) {
	    	d[i++] = red(x,y)
    		d[i++] = green(x,y);
    		d[i++] = blue(x,y);    		
    		d[i++] = OA;
	    })
	    ctx.putImageData(imgData,0,0);
	})

}

//rdp = [148, 1000, 500, 400];
//grp = [610, 60, 864, 860];
//blp = [180, 100, 503, 103];
//
//wavy = function(x,y,p, yp1, yp2){
//    return 63*(((sqrt(sq(p[0]-x)+yp1)+1)/((abs(sin((sqrt(sq(p[2]-x)+yp2))/115)))+1)/200)>>0);
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
//    		d[i++] = OA;
//    	}
//    }
//    ctx.putImageData(imgData,0,0);
//})

// based on water tutorial 
// http://gamedevelopment.tutsplus.com/tutorials/make-a-splash-with-dynamic-2d-water-effects--gamedev-236

function updateSpring(spring, tension, damping, target_height) {
	var x = spring.height - target_height;
	var acceleration = -tension * x -damping*spring.velocity;
	
	spring.velocity += acceleration;
	spring.height += spring.velocity;
}

water_y = HEIGHT-50;

var springs = [];
range(WIDTH/10+1, function() {
	springs.push({
		height: water_y,
		velocity: 0
	})
})

function updateWater() {
	var Spread = 0.25;
	
	each(springs, function($) {
		updateSpring($, 0.020, 0.025, water_y);
	})
	 
	var leftDeltas = [];
	var rightDeltas = [];
	             
	// do some passes where springs pull on their neighbours
	range(8, function() {
	    for (var i = 0; i < springs.length; i++)
	    {
	        if (i > 0) {
	            leftDeltas[i] = Spread * (springs[i].height - springs [i - 1].height);
	            springs[i - 1].velocity += leftDeltas[i];
	        }
	        if (i < springs.length - 1)
	        {
	            rightDeltas[i] = Spread * (springs[i].height - springs [i + 1].height);
	            springs[i + 1].velocity += rightDeltas[i];
	        }
	    }
	 
	    for (var i = 0; i < springs.length; i++)
	    {
	        if (i > 0)
	            springs[i - 1].height += leftDeltas[i];
	        if (i < springs.length - 1)
	            springs[i + 1].height += rightDeltas[i];
	    }
	})
}

function renderWater() {

	Tch.beginPath();
	Tch.moveTo(WIDTH, HEIGHT);
	Tch.lineTo(0, HEIGHT);
	var x=0;
	each(springs, function($) {
		Tch.lineTo(x, $.height + 4*sin(TPI*((frameCount+x)/100)))
		x+= 10;
	})
	Tch.closePath();
	Tch.fill();
}

// displace bitmap pixels
function displace(displace_x, displace_y, pixel_data, new_data, width, height) {
	var di = 0; // destination index
	var i=0;
	var w20 = 20*width;
	var h20 = 20*height;
	duRange(width, height, function(x,y) {
		var dx = displace_x[i];
		var dy = displace_y[i];
		i++;
		// adding 20*width to avoid negative array index even for large dx (the modulo width makes it correct)
		var oi = 4*((x-dx+w20)%width + ((y-dy+h20)%height)*width);
		new_data[di++] = pixel_data[oi++];
		new_data[di++] = pixel_data[oi++];
		new_data[di++] = pixel_data[oi++];
		new_data[di++] = pixel_data[oi];
	})
}

var waterPixels=[];
var red = painty([], 60,110, -2,2, 1,4, -4, 100);
var green = painty([], 80,160, -2,2, 1,4, -2, 500);
var blue = painty([], 20, 40, -2,2, 1,4, 3, 1000);
var i=0; // pixel index
for (var y=0;y<HEIGHT;y++) {
	var prevR = irndab(5,25);
	var prevG = irndab(10,35);
	var prevB = irndab(20,40);
	for (var x=0; x<WIDTH; x++) {
		var curR = irndab(25,50);
		var curG = irndab(30,65);
		var curB = irndab(70,120);

		waterPixels[i++] = 20+(curR+prevR >>1) + round(sin(y*TPI/10)*5); //red(x,y)
		waterPixels[i++] = 25+(curG+prevG >>1) +round(sin(y*TPI/12)*5);//+((x/20)&7)*10 + ((y/20)&7)*10;//green(x,y);
		waterPixels[i++] = 30+(curB+prevB >>1) +round(sin(y*TPI/13)*8);//+((x/30)&15)*10 + ((y/30)&15)*10;//blue(x,y);    		
		waterPixels[i++] = OA;
		
		prevR = curR;
		prevG = curG;
		prevB = curB;
	}
}


//
MOUSE_POS = {x:0, y:0}
rect = canvases[1].getBoundingClientRect();
canvases[2].addEventListener('mousemove', function(evt) {
	MOUSE_POS = {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}, false);


// two background buffers - for animation
//buffers = [];
//for (var i=0; i<10; i++) {
//	buffers[i] = BgC.createImageData(WIDTH,HEIGHT);
//}



if (false) {
	
	var filtered = Filters.filterCanvas(Filters.convolute, ice_canvas,
			  [   .1,  .1,  .1,
			      .1, .2, .1,
			     .1, .1, .1 ]
			);

	// blur the ice canvas
	ice_canvas.width = filtered.width;
	ice_canvas.height = filtered.height;
	var ctx = ice_canvas.getContext('2d');
	ctx.putImageData(filtered, 0, 0);
	
	//test.draw(0,0, width, height);

	initLevel();
}	

// copy background to water pixels



//var bgPixels = VoronoiDemo.canvas.getContext('2d').getImageData(0,0,WIDTH,HEIGHT).data;
//var i=0;
//for (var y=0; y<HEIGHT; y++) {
//	for (var x=0; x<WIDTH; x++) {
//		for (var j=0; j<4; j++) {
//			waterPixels[i] = waterPixels[i]*.85 + bgPixels[i] * 0.15;
//			i++;
//		}
//	}
//}


//blur the water
var res = Filters.convolute({data:waterPixels, width:WIDTH, height:HEIGHT},
		  [   .1, .1, .1,
		      .1, .2, .1,
		      .1, .1, .1 ], true
		);
waterPixels = res.data;

water_canvas = function(P) {
	return r2c(WIDTH, HEIGHT, function(ctx, canvas) {
	    
	    var displace_x = [];
	    var displace_y = [];
	    i=0; // pixel index
	    duRange(WIDTH, HEIGHT, function(x,y) {
	    	displace_x[i] = round(5*(x-WIDTH/2)/(3*y/HEIGHT+0.6) + 
					5*sin(P+TPI*(x+2*y)/WIDTH)
					+3*sin(P+TPI*2*(x+y)/WIDTH)
				);
			displace_y[i] = round( 5*(2*(y)/HEIGHT+0.6) * 
					sin(P+TPI*4*(x+y/2)/WIDTH)*
					sin(P+TPI*3.5*(x+y)/WIDTH));
			//displace_x[i] = 0;
			//displace_y[i] = 0;
			i++;
	    })
		var imgData=ctx.createImageData(WIDTH,HEIGHT);
	    var d = imgData.data;
	    
	    displace(displace_x, displace_y, waterPixels, d, WIDTH, HEIGHT);
	    
//	    var i=0; // pixel index
//		for (var y=0;y<HEIGHT;y++) {
//			var s=3/(y+250);
//			var yy0 = sq(y-700)*5;
//		    for (var x=0; x<WIDTH; x++) {
//		    	var yy=(y+sin((x*x + yy0)/100/HEIGHT+P)*15)*s;
//		    	
//		    	var _x = (WIDTH*(x-yy)/s)<<0;
//		    	var _y = (HEIGHT*(y-yy)/s)<<0;
//		    	
//		    	
//		    	d[i++] = waterPixels[_x+_y*WIDTH]//( (((x+WIDTH)*s+yy)&1)+(((2*WIDTH-x)*s+yy)&1))*127;
//		    	d[i++] = waterPixels[_x+_y*WIDTH+1]//( ((5*((x+WIDTH)*s+yy))&1) + ((5*((WIDTH*2-x)*s+yy))&1))*127;
//		  		d[i++] = waterPixels[_x+_y*WIDTH+2]//(((29*((x+WIDTH)*s+yy))&1)+((29*((WIDTH*2-x)*s+yy))&1))*127;
//		    	// flat
//	//	    	d[i++] = ( (((x+WIDTH)*s)&1)+(((2*WIDTH-x)*s)&1))*127;
//	//	    	d[i++] = ( ((5*((x+WIDTH)*s))&1) + ((5*((WIDTH*2-x)*s))&1))*127;
//	//	  		d[i++] = (((29*((x+WIDTH)*s))&1)+((29*((WIDTH*2-x)*s))&1))*127;
//	//	 		
//		  		d[i++] = OA;
//		  	}
//		  }
		  ctx.putImageData(imgData,0,0);
		})
}

water_frames = [];
frameCount = 0;
var prevCount = frameCount;
var t0 = -1;
BgC.fillStyle = sky_pattern;
BgC.fillRect(0,0,WIDTH,HEIGHT);
var prevFrameInd;
Tch.globalAlpha = 0.9;

WATER_FRAMES = 2;//20
range(WATER_FRAMES, function(i) {
	water_frames[i] = C.createPattern(water_canvas(i * TPI/WATER_FRAMES), 'no-repeat');
})

Player = {
	x: WIDTH/2,
	y: HEIGHT/2,
	vx: 0,
	vy: 0
}

emit = ParticlePointEmitter();
emit.init(250, {
	position: [WIDTH/2, HEIGHT/2],
	angle: 90,
	angleRandom: 10,
	duration: -1,
	finishColor: [255, 45, 10, 0],
	finishColorRandom: [40,40,40,0],
	forcePoints: [],
	gravity: [0,.03],
	lifeSpan: 1,
	lifeSpanRandom: 0,
	positionRandom: [3,3],
	sharpness: 15,
	sharpnessRandom: 12,
	size: 20,
	finishSize: 40,
	sizeRandom: 4,
	speed: 5,
	speedRandom: 1,
	startColor: [220, 188, 88, 1],
	startColorRandom: [32, 35, 38, 0]
})


var animFrame = function(t) {
	var frameInd = ((frameCount/6)<<0) % WATER_FRAMES;

	if (prevFrameInd != frameInd) {
		Tch.fillStyle = water_frames[frameInd];
		prevFrameInd = frameInd;
	}


	var speed = KEYS[SPACE] ? 0.35 : 0.2;
	if (KEYS[LEFT]) {
		Player.vx = max(-10, Player.vx-speed);
	}
	if (KEYS[RIGHT]) {
		Player.vx = min(10, Player.vx+speed);
	}
//	if (KEYS[UP]) {
//		Player.vy = max(-3, Player.vy-.1);
//	}
//	if (KEYS[DOWN]) {
//		Player.vy = min(3, Player.vy+.1);
//	}
	emit.active = KEYS[SPACE];
	Player.vx *= .95;
	Player.vy *= .95;
	Player.x += Player.vx;
	Player.y += Player.vy;
	Player.vy += KEYS[SPACE] ? -.3 : .7;
	if (Player.y > HEIGHT+150) Player.y = 0;

	emit.position[0] = Player.x-(Player.flipped? 5: 15);
	emit.position[1] = Player.y-25;
	
	updateWater();
	emit.update(16);

	
	Tch.clearRect(0,0,WIDTH,HEIGHT);
	C.clearRect(0,0,WIDTH,HEIGHT);

	C.save()
	C.globalCompositeOperation = "lighter";
	emit.renderParticles(C);
	C.restore()

	if (red_man) {
		var angle = Math.atan2(MOUSE_POS.y - Player.y, MOUSE_POS.x - Player.x);
		draw_man(0, Player.x, Player.y, angle);
	}

	renderWater();
	
	//water_frames[frameInd].draw(0,water_y, WIDTH, HEIGHT);
	water_y -= 0.01;
	if (water_y<200) {
		water_y = HEIGHT-10;
	}

	var delta = 0;
	if (MOUSE_POS.x > WIDTH - 20 && OffsetX < WIDTH) {
		delta = 5;
	}
	if (MOUSE_POS.x < 20 && OffsetX > 0) {
		delta = -5;
	}
//	if (enable_voronoi &&  delta) {
//		OffsetX += delta;
//		FdC.setTransform(1,0,0,1,-OffsetX,-OffsetY);
//		VoronoiDemo.render();
//	}
	
    RQ(animFrame);
    
    // TODO: remove later
    frameCount++;
	if (t - t0 > 10000) {
		t0 = t;
		console.log(frameCount-prevCount, Date());
		prevCount = frameCount;
	}    
};

RQ(animFrame);
