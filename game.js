

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




var painty = function(buffer, base_min, base_top, dirx, diry, color_step, seed_chance) {
	var fu = function(x,y) {
		var ei=y*width+x;
		return buffer[ei] ?
					buffer[ei] :
					buffer[ei]= irnda(seed_chance) ? 
								255 & max(0, (irnda(color_step)+fu((x-irndab(1,dirx)) %width, 
										(y-irndab(1,diry))%height)))
								: irndab(base_min,base_top);
	}
	return fu;
}


//
ice_canvas = r2c(width, height, function(ctx, canvas) {
	var imgData=ctx.createImageData(width,height);
    var d = imgData.data;
    var red = painty([], 60,110, 3,3, -4, 100);
    var green = painty([], 80,160, 3,3, -2, 500);
    var blue = painty([], 20, 40, 3,3, 3, 1000);
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
    var red = painty([], 60,150, -3,3, -2, 100);
    var green = painty([], 40,90, -3,3, 3, 200);
    var blue = painty([], 70, 120, -3,3, -3, 100);
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
	
	convolute: function(pixels, weights, opaque) {
		  var side = Math.round(Math.sqrt(weights.length));
		  var halfSide = Math.floor(side/2);
		  var src = pixels.data;
		  var sw = pixels.width;
		  var sh = pixels.height;
		  // pad output by the convolution matrix
		  var w = sw;
		  var h = sh;
		  var output = Filters.createImageData(w, h);
		  var dst = output.data;
		  // go through the destination image pixels
		  var alphaFac = opaque ? 1 : 0;
		  for (var y=0; y<h; y++) {
		    for (var x=0; x<w; x++) {
		      var sy = y;
		      var sx = x;
		      var dstOff = (y*w+x)*4;
		      // calculate the weighed sum of the source image pixels that
		      // fall under the convolution matrix
		      var r=0, g=0, b=0, a=0;
		      for (var cy=0; cy<side; cy++) {
		        for (var cx=0; cx<side; cx++) {
		          var scy = sy + cy - halfSide;
		          var scx = sx + cx - halfSide;
		          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
		            var srcOff = (scy*sw+scx)*4;
		            var wt = weights[cy*side+cx];
		            r += src[srcOff] * wt;
		            g += src[srcOff+1] * wt;
		            b += src[srcOff+2] * wt;
		            a += src[srcOff+3] * wt;
		          }
		        }
		      }
		      dst[dstOff] = r;
		      dst[dstOff+1] = g;
		      dst[dstOff+2] = b;
		      dst[dstOff+3] = a + alphaFac*(255-a);
		    }
		  }
		  return output;
		}
};
Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');

var filtered = Filters.filterCanvas(Filters.convolute, ice_canvas,
		  [   .1,  .1,  .1,
		      .1, .2, .1,
		     .1, .1, .1 ]
		);

ice_canvas.width = filtered.width;
ice_canvas.height = filtered.height;
var ctx = ice_canvas.getContext('2d');
ctx.putImageData(filtered, 0, 0);

//test.draw(0,0, width, height);


VoronoiDemo.init();

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
	
	VoronoiDemo.render();
	
    RQ(animFrame);
    
    // TODO: remove later
    frameCount++;
	if (t - t0 > 10000) {
		t0 = t;
		console.log(frameCount, Date());
		frameCount = 0;
	}    
};

RQ(animFrame);