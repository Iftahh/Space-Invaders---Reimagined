
DC = document;


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
FdC = contexts[1]
C = FdC; // current canvas to draw to - may toggle around for double buffering

// Background context
BgC = contexts[0]

// Top context (overlay)
Tch = contexts[2]


rnd = Math.random;
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


//render to canvas - creates a canvas, render to it with a renderFunction,
//and return it with added draw(x,y,w,h) method that draws the canvas to the main one
var r2c=function (width, height, renderFunction) {
 var canvas = createCanvas(width, height)
 renderFunction(canvas.getContext('2d'), canvas);
 canvas.draw = function(x,y,w,h) { C.drawImage(this, x,y,w,h) }
 return canvas;
}
