
DC = document;

RNG = {
	setSeed: function(seed) {
	    seed = (seed < 1 ? 1/seed : seed);
	
	    this._seed = seed;
	    this._s0 = (seed >>> 0) * this._frac;
	
	    seed = (seed*69069 + 1) >>> 0;
	    this._s1 = seed * this._frac;
	
	    seed = (seed*69069 + 1) >>> 0;
	    this._s2 = seed * this._frac;
	
	    this._c = 1;
	    return this;
	},
		
    _s0: 0,
    _s1: 0,
    _s2: 0,
    _c: 0,
    _frac: 2.3283064365386963e-10 /* 2^-32 */
}

/**
 * @returns {float} Pseudorandom value [0,1), uniformly distributed
 */
rnd= function() {
    var t = 2091639 * RNG._s0 + RNG._c * RNG._frac;
    RNG._s0 = RNG._s1;
    RNG._s1 = RNG._s2;
    RNG._c = t | 0;
    RNG._s2 = t - RNG._c;
    return RNG._s2;
}


RNG.setSeed(5)

range = function(maxInt,iterFu) {
    for (var i=0; i<maxInt; i++)
        iterFu(i)
}
// breaking-range - will return non-false value from iterator and break the loop
brrange = function(maxInt,iterFu) {
    for (var i=0; i<maxInt; i++) {
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

minmax = function(mn, mx, v) { return min(mx, max(mn, v))}

duRange = function(w,h, fu) {
	for (var y=0; y<h; y++)
		for (var x=0; x<w; x++)
			fu(x,y);
}


createCanvas = function(w,h) {
	  var c = DC.createElement('canvas');
	  c.width = w || WIDTH;
	  c.height = h || HEIGHT;
	  return c;
	}

avg = function(a,b) { return (a+b)/2 }

// LAYERS
canvases = [];
contexts = [];


Ctx = function(canvas) {
	return canvas.getContext('2d')
}

var cont =  DC.getElementById('canvas_cont');
range(4, function(i) { 
   var canvas = createCanvas();
   cont.appendChild(canvas);
   canvases.push(canvas);
   contexts.push(Ctx(canvas))
});

 // current canvas to draw to - may toggle around for double buffering

skyCtx = contexts[0]
mountainCtx = contexts[1]
spritesCtx = contexts[2]
waterCtx = contexts[3]
// Overlay context (overlay)


abs = Math.abs;
min = Math.min;
max = Math.max;
sin= Math.sin;
round = Math.round;
sqrt=Math.sqrt;
sq=function(x){return x*x}
U8 = 255; // max unsigned 8bit
PI = Math.PI;
TPI = 2*PI;


// random in range [0,a)
rnda = function(a) { return rnd()*a}
// random integer in range [0,a-1]
irnda = function(a) { return rnda(a)|0}
// random in range [a,b)
rndab = function(a,b) { return a+rnda(b-a)}
// random integer in range [a,b-1] 
irndab = function(a,b) { return rndab(a,b)|0 }


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


// get img data from 
getPixels= function(ctx) {
  return ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height);
}


var render2pixels=function(width, height, renderFunction) {
	var canvas = createCanvas(width, height), ctx=Ctx(canvas)
		imgData=getPixels(ctx),
	    d = imgData.data;
	renderFunction(d,ctx,canvas);
    ctx.putImageData(imgData,0,0);
	return canvas;
}

drawImg = function(ctx, img, x,y) {
	ctx.drawImage(img, x,y, img.width, img.height);
}



initQueue = []
initFu = function(text, pg, fu, dl) {
	initQueue.push([text,pg,fu, dl])
}

