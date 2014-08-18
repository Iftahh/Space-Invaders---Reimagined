

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




rnda = function(a) { return rnd()*a}
irnda = function(a) { return rnda(a) << 0}
// random in range
rndab = function(a,b) { return a+rnda(b-a)}
// random in range - integer
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
				var site = {x: round(width*x/LevelW) + irndab(-2,3), y: _y+irndab(-2,3)  }
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



if (enable_voronoi) {


	var sky = function(buffer, mnp, mxp) {
		var fu = function(x,y) {
			var p = irndab(mnp, mxp);
			buffer[x] = (x& buffer[x]) ? (buffer[x]+buffer[x-1])/2 : (x?buffer[x-1]: 127);
			buffer[x] *= 2;
			if (p>0) {
				buffer[x] += p;
			}
			return buffer[x]? buffer[x]<255? buffer[x]:255:0;
		};
		return fu;
	}

	
	sky_canvas = r2c(width, height, function(ctx, canvas) {
		var imgData=ctx.createImageData(width,height);
	    var d = imgData.data;
	    var red = sky([], -4,5);
	    var green = sky([], -3,4);
	    var blue = sky([], -7,8);
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
	    		d[i++] = red(x,y)
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

function displace(displace_x, displace_y, pixel_data, new_data, width, height) {
	var di = 0; // destination index
	var i=0;
	for (var y=0; y<height; y++) {
		for (var x=0; x<width; x++)  {
			var dx = displace_x[i];
			var dy = displace_y[i];
			i++;
			var oi = 4*((x-dx+20*width)%width + ((y-dy+20*height)%height)*width);
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
	for (var x=0; x<width; x++) {
		waterPixels[i++] = irndab(30,50)+round(sin(x*TPI/60)*10 +((y/(20*(y+50)/height))&1)*25); //red(x,y)
		waterPixels[i++] = irndab(100,140)+round(sin(x*TPI/80)*10 +((y/(15*(y+50)/height))&1)*25);//+((x/20)&7)*10 + ((y/20)&7)*10;//green(x,y);
		waterPixels[i++] = irndab(160,170)+round(sin(x*TPI/90)*25 +((y/(30*(y+50)/height))&1)*25);//+((x/30)&15)*10 + ((y/30)&15)*10;//blue(x,y);    		
//		waterPixels[i++] = red(x,y);
//		waterPixels[i++] = green(x,y);
//		waterPixels[i++] = blue(x,y);
		waterPixels[i++] = OA;
	}
}

// blur the water
var res = Filters.convolute({data:waterPixels, width:width, height:height},
		  [   .1,  .1,  .1,
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
	    								8*sin(P+TPI*3*(x+2*y)/width)
	    								+4*sin(P+TPI*7*(x+y)/width)
	    							);
	    		displace_y[i] = round( 6*(2*(y)/height+0.6) * 
	    					sin(P+TPI*5*(x+y/2)/width)*
	    					sin(P+TPI*3*(x+y)/width));
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


MOUSE_POS = {x:0, y:0}
rect = canvases[2].getBoundingClientRect();
canvases[2].addEventListener('mousemove', function(evt) {
	MOUSE_POS = {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}, false);


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

	VoronoiDemo.init(false);
	
	initLevel();
}

water_frames = [];
frameCount = 0;
var t0 = -1;
var animFrame = function(t) {
//	var bgInd = frameCount++ % buffers.length;
//	if (frameCount <= buffers.length) {
//		var d = buffers[bgInd].data;
//		var i =0;
//		for (var y=0;y<height;y++) {
//	    	for (var x=0; x<width; x++) {
//	    		d[i++] = d[i++] = d[i++] = irnda(256);
//	    		
//	    		d[i++] = OA;
//	    	}
//		}
//	}
//    BgC.putImageData(buffers[bgInd],0,0);
	if (enable_voronoi) {
		VoronoiDemo.render();
	}
	else {
		var frameInd = ((frameCount/6)<<0) % 10;
		if (!water_frames[frameInd]) {
			water_frames[frameInd] = water_canvas(frameInd * TPI/10);
		}
		water_frames[frameInd].draw(0,0, width, height);
	}

	
    RQ(animFrame);
    
    // TODO: remove later
    frameCount++;
	if (t - t0 > 10000) {
		t0 = t;
		console.log(frameCount, Date());
		frameCount = 0;
	}    
};

//RQ(animFrame);
//if (enable_voronoi)
//	RQ(animFrame);
//else
//water_canvas(0).draw(0,0, width, height)
