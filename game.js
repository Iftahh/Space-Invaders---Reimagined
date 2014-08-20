

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
each = function(collection, iterFu) {
    for (var i=0; i<collection.length; i++) {
        var $=collection[i];
        iterFu($,i);
    }
}
//breaking-each - will return non-false value from iterator and break the loop
breach = function(collection, iterFu) { // breaking each: collection, iterator   
	return brrange(collection.length, function(i) {var $=collection[i]; return iterFu($,i);})
}


canvases = [];
each(['b','c',/*'d'*/'voronoiCanvas'], function($) { canvases.push(DC.getElementById($))});
width = canvases[0].width; // todo: hard code ?
height = canvases[0].height;

// Forward (front) Context
FdC = canvases[1].getContext("2d")
C=FdC; // current canvas to draw to
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


var fcurCameraX, fcurCameraY; //  fcur-camera defines what is being viewed - needed to be float in order not to lock

var OffsetX = OffsetY = 0; //  is the integer round of fcur - needed to be int in order to avoid fuzzy drawimage for images

//var trns = function(hscale,hskew,vskew,vscale,x,y) { C.setTransform(hscale,hskew,vskew,vscale,x-OffsetX,y-OffsetY) }  //



// render to canvas - creates a canvas, render to it with a renderFunction,
// and return it with added draw(x,y,w,h) method that draws the canvas to the main one
var r2c=function (width, height, renderFunction) {
    var canvas = DC.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    renderFunction(canvas.getContext('2d'), canvas);
    canvas.draw = function(x,y,w,h) { C.drawImage(this, x,y,w,h) }
    return canvas;
}



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

	createCanvas: function(w,h) {
	  var c = DC.createElement('canvas');
	  c.width = w;
	  c.height = h;
	  return c;
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
		  for (var y=0; y<h; y++) {
		    for (var x=0; x<w; x++) {
		      var sy = y;
		      var sx = x;
		      // calculate the weighed sum of the source image pixels that
		      // fall under the convolution matrix
		      var r=0, g=0, b=0;//, a=0;
		      for (var cy=0; cy<side; cy++) {
		        for (var cx=0; cx<side; cx++) {
		          var scy = sy + cy - halfSide;
		          var scx = sx + cx - halfSide;
		          scy += height*10;
		          scy %= height;
		          scx += width*10;
		          scx %= width;
		          //if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
		            var srcOff = (scy*sw+scx)*4;
		            var wt = weights[cy*side+cx];
		            r += src[srcOff] * wt;
		            g += src[srcOff+1] * wt;
		            b += src[srcOff+2] * wt;
		            //a += src[srcOff+3] * wt;
		          //}
		        }
		      }
		      dst[dstOff++] = r;
		      dst[dstOff++] = g;
		      dst[dstOff++] = b;
		      dst[dstOff++] = OA;//a + alphaFac*(255-a);
		    }
		  }
		  return output;
		}
};
Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');


// pattern of stones
var stone_canvas = r2c(256, 256, function(context, canvas) {
	
})


var painty = function(buffer, base_min, base_top, mndirx,mxdirx, mndiry, mxdiry, color_step, seed_chance) {
	var fu = function(x,y) {
		var ei=y*width+x;
		try {
			return buffer[ei] ?
						buffer[ei] :
						buffer[ei]= irnda(seed_chance) ? 
									255 & max(0, (irnda(color_step)+fu((x-irndab(mndirx,mxdirx)) %width, 
											(y-irndab(mndiry,mxdiry))%height)))
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
		for (var x=0; x<LevelW; x+= 5) {
			ctx.lineTo(x, irndab(2,10)+(1-sq(sin(PI*x/LevelW))+.1*sq(sin(6*TPI*x/LevelW)))*LevelH);
		}
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
			var _y = round(height*y/LevelH);
			for (var x=0; x<LevelW; x++) {
				var site = {x: round(width*x/LevelW) + irndab(-1,2), 
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
				VoronoiDemo.sites.push(site);
				i += 4;
			}
		}
		VoronoiDemo.diagram = VoronoiDemo.voronoi.compute(VoronoiDemo.sites, VoronoiDemo.bbox);
		VoronoiDemo.render();
	});
	//level.draw(0,0,LevelW, LevelH);
}
enable_voronoi = true;



var sky_width = 250;

sky_canvas = r2c(sky_width, height, function(ctx, canvas) {
	var imgData=ctx.createImageData(sky_width,height);
    var d = imgData.data;
    
    var i=0; // pixel index
    for (var x=0; x<sky_width; x++) {
    	d[i++] = 40; // red
		d[i++] = 50; // green
		d[i++] = 80; // blue;    		
		d[i++] = OA;
    }
    var row_offset = sky_width*4; // 4 bytes per pixel
    for (var y=1;y<height;y++) {
    	for (var x=0; x<sky_width; x++) {
    		d[i] = (d[i-4]+d[i-row_offset] >> 1) + max(0,irndab(-4,3));
    		i++;
    		d[i] = (d[i-4]+d[i-row_offset] >> 1) + max(0,irndab(-4,3));
    		i++;
    		d[i] = (d[i-4]+d[i-row_offset] >> 1) + max(0,irndab(-4,3));
    		i++;
    		d[i++] = OA;
    	}
    }
    ctx.putImageData(imgData,0,0);
})

var sky_pattern = C.createPattern(sky_canvas, 'repeat-x');

if (enable_voronoi) {


	
	//
	ice_canvas = r2c(width, height, function(ctx, canvas) {
		var imgData=ctx.createImageData(width,height);
	    var d = imgData.data;
	    var red = painty([], 60,110, 1,3, 1,3, -4, 100);
	    var green = painty([], 80,160, 1,3, 1,3, -2, 500);
	    var blue = painty([], 20, 40, 1,3, 1,3, 3, 1000);
	    var i=0; // pixel index
	    for (var y=0;y<height;y++) {
	    	for (var x=0; x<width; x++) {
	    		d[i++] = red(x,y);
	    		d[i++] = green(x,y);
	    		d[i++] = blue(x,y);    		
	    		d[i++] = OA;
	    	}
	    }
	    ctx.putImageData(imgData,0,0);
	})
	
	
	
	grass_canvas = r2c(width, height, function(ctx, canvas) {
		var imgData=ctx.createImageData(width,height);
	    var d = imgData.data;
	    var red = painty([], 60,150, -3,-1, 1,3, -2, 100);
	    var green = painty([], 40,90, -3,-1, 1,3, 3, 200);
	    var blue = painty([], 70, 120, -3,-1, 1,3, -3, 100);
	    var i=0; // pixel index
	    for (var y=0;y<height;y++) {
	    	for (var x=0; x<width; x++) {
	    		d[i++] = red(x,y)
	    		d[i++] = green(x,y);
	    		d[i++] = blue(x,y);    		
	    		d[i++] = OA;
	    	}
	    }
	    ctx.putImageData(imgData,0,0);
	})

}

rdp = [148, 1000, 500, 400];
grp = [610, 60, 864, 860];
blp = [180, 100, 503, 103];

wavy = function(x,y,p, yp1, yp2){
    return 63*(((sqrt(sq(p[0]-x)+yp1)+1)/((abs(sin((sqrt(sq(p[2]-x)+yp2))/115)))+1)/200)>>0);
}

//
//wavy_canvas = r2c(width, height, function(ctx, canvas) {
//	var imgData=ctx.createImageData(width,height);
//    var d = imgData.data;
//    var i=0; // pixel index
//    for (var y=0;y<height;y++) {
//    	for (var x=0; x<width; x++) {
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

water_y = height-10;

var springs = [];
range(width/10+1, function() {
	springs.push({
		height: water_y,
		velocity: 0,
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
	for (var j = 0; j < 8; j++)
	{
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
	}
}

function renderWater() {

	C.clearRect(0,0,width,height);
	C.beginPath();
	C.moveTo(width, height);
	C.lineTo(0, height);
	var x=0;
	each(springs, function($) {
		C.lineTo(x, $.height + 4*sin(TPI*((frameCount+x)/100)))
		x+= 10;
	})
	C.closePath();
	C.fill();
}

// displace bitmap pixels
function displace(displace_x, displace_y, pixel_data, new_data, width, height) {
	var di = 0; // destination index
	var i=0;
	var w20 = 20*width;
	var h20 = 20*height;
	for (var y=0; y<height; y++) {
		for (var x=0; x<width; x++)  {
			var dx = displace_x[i];
			var dy = displace_y[i];
			i++;
			// adding 20*width to avoid negative array index even for large dx (the modulo width makes it correct)
			var oi = 4*((x-dx+w20)%width + ((y-dy+h20)%height)*width);
			new_data[di++] = pixel_data[oi++];
			new_data[di++] = pixel_data[oi++];
			new_data[di++] = pixel_data[oi++];
			new_data[di++] = pixel_data[oi];
		}
	}
}

var waterPixels=[];
var red = painty([], 60,110, -2,2, 1,4, -4, 100);
var green = painty([], 80,160, -2,2, 1,4, -2, 500);
var blue = painty([], 20, 40, -2,2, 1,4, 3, 1000);
var i=0; // pixel index
for (var y=0;y<height;y++) {
	var prevR = irndab(5,25);
	var prevG = irndab(10,35);
	var prevB = irndab(20,40);
	for (var x=0; x<width; x++) {
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

// blur the water
var res = Filters.convolute({data:waterPixels, width:width, height:height},
		  [   .1, .1, .1,
		      .1, .2, .1,
 		      .1, .1, .1 ], true
		);
waterPixels = res.data;

water_canvas = function(P) {
	return r2c(width, height, function(ctx, canvas) {
	
	    
	    var displace_x = [];
	    var displace_y = [];
	    i=0; // pixel index
	    for (var y=0;y<height;y++) {
	    	for (var x=0; x<width; x++) {
	    		displace_x[i] = round(5*(x-width/2)/(3*y/height+0.6) + 
	    								5*sin(P+TPI*(x+2*y)/width)
	    								+3*sin(P+TPI*2*(x+y)/width)
	    							);
	    		displace_y[i] = round( 5*(2*(y)/height+0.6) * 
	    					sin(P+TPI*4*(x+y/2)/width)*
	    					sin(P+TPI*3.5*(x+y)/width));
//	    		displace_x[i] = 0;
//	    		displace_y[i] = 0;
	    		i++;
	    	}
	    }
	    
		var imgData=ctx.createImageData(width,height);
	    var d = imgData.data;
	    
	    displace(displace_x, displace_y, waterPixels, d, width, height);
	    
//	    var i=0; // pixel index
//		for (var y=0;y<height;y++) {
//			var s=3/(y+250);
//			var yy0 = sq(y-700)*5;
//		    for (var x=0; x<width; x++) {
//		    	var yy=(y+sin((x*x + yy0)/100/height+P)*15)*s;
//		    	
//		    	var _x = (width*(x-yy)/s)<<0;
//		    	var _y = (height*(y-yy)/s)<<0;
//		    	
//		    	
//		    	d[i++] = waterPixels[_x+_y*width]//( (((x+width)*s+yy)&1)+(((2*width-x)*s+yy)&1))*127;
//		    	d[i++] = waterPixels[_x+_y*width+1]//( ((5*((x+width)*s+yy))&1) + ((5*((width*2-x)*s+yy))&1))*127;
//		  		d[i++] = waterPixels[_x+_y*width+2]//(((29*((x+width)*s+yy))&1)+((29*((width*2-x)*s+yy))&1))*127;
//		    	// flat
//	//	    	d[i++] = ( (((x+width)*s)&1)+(((2*width-x)*s)&1))*127;
//	//	    	d[i++] = ( ((5*((x+width)*s))&1) + ((5*((width*2-x)*s))&1))*127;
//	//	  		d[i++] = (((29*((x+width)*s))&1)+((29*((width*2-x)*s))&1))*127;
//	//	 		
//		  		d[i++] = OA;
//		  	}
//		  }
		  ctx.putImageData(imgData,0,0);
		})
}

//
//MOUSE_POS = {x:0, y:0}
//rect = canvases[2].getBoundingClientRect();
//canvases[2].addEventListener('mousemove', function(evt) {
//	MOUSE_POS = {
//      x: evt.clientX - rect.left,
//      y: evt.clientY - rect.top
//    };
//}, false);


// two background buffers - for animation
//buffers = [];
//for (var i=0; i<10; i++) {
//	buffers[i] = BgC.createImageData(width,height);
//}



if (enable_voronoi) {
	
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

	VoronoiDemo.init();
	
	initLevel();
}	

water_frames = [];
frameCount = 0;
var prevCount = frameCount;
var t0 = -1;
BgC.fillStyle = sky_pattern;
BgC.fillRect(0,0,width,height);
var prevFrameInd;

var animFrame = function(t) {
	var frameInd = ((frameCount/6)<<0) % 20;
	if (!water_frames[frameInd]) {
		water_frames[frameInd] = C.createPattern(water_canvas(frameInd * TPI/20), 'no-repeat');
	}

	if (prevFrameInd != frameInd) {
		C.fillStyle = water_frames[frameInd];
		prevFrameInd = frameInd;
	}
	
	updateWater();
	renderWater();
	
	
	//water_frames[frameInd].draw(0,water_y, width, height);
	water_y -= 0.01;
	if (water_y<200) {
		water_y = height-10;
	}

	
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
//if (enable_voronoi)
//	RQ(animFrame);
//else
//water_canvas(0).draw(0,0, width, height)
