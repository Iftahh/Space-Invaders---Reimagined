var SZ = ground_pattern_size;
var TXT = "Chiseling rocks"

var renderByRGB = function( red, green, blue) {
	return render2pixels(SZ, SZ, function(d) {
	    var i=0; // pixel index
	    duRange(SZ, SZ, function(x,y) {
	    	d[i++] = red(x,y);
			d[i++] = green(x,y);
			d[i++] = blue(x,y);    		
			d[i++] = U8;
	    });
	})
} 

initFu(TXT, 10, function() {

	cave_canvas = renderByRGB(
			painty([], SZ, SZ,  120,180, -3,3, -3,3, -1, 200),  // red
			painty([], SZ, SZ,70,130, -3,3, -3,3, -1, 100),   // green
			painty([], SZ, SZ, 40, 80, -3,3, -3,3, -2, 100)); // blue


	var grass_canvas = renderByRGB(
			painty([], SZ, SZ, 60,180, -1,2, 1,3, -2, 100),
			painty([], SZ, SZ, 70,220, -1,2, 1,3, -1, 200),
			painty([], SZ, SZ, 70, 100, -1,2, 1,3, -3, 100));

	// global
	grass_pattern = mountainCtx.createPattern(grass_canvas, 'repeat');
});

// drawImg(mountainCtx, cave_canvas, 0,0);
initFu(TXT, 6, function() {

	ground_canvas = renderByRGB(
			painty([], SZ, SZ,  80,140, -4,4, -4,4, 2, 300),
			painty([], SZ, SZ,  80,140, -4,4, -4,4, -1, 300),
			painty([], SZ, SZ,  40, 80, -4,4, -4,4, -2, 300));
	
	ground_ctx = Ctx(ground_canvas)
	cave_ctx = Ctx(cave_canvas);
	// blur the cave and ground canvas
	each([ground_ctx, cave_ctx], function(ctx) {
		convolute(ctx, ctx,
			  [   .1,  .1,  .1,
			      .1, .2, .1,
			     .1, .1, .1 ]
			);
	})
}, 100);


//drawImg(mountainCtx, cave_canvas, 0,0);
initFu(TXT, 3, function() {
	var shiftHSV = function(h,s,v) {
		return function(hsv) {
			// some pixels are not brownish despite the shift!
			// not sure why, maybe some overflow?  for now use the min(.4) hack - 
			// the hack produces bright green pixels instead of blue, still bad but not too much
			var rgb = hsv2rgb(avg(min(hsv.h,.4), h), avg(hsv.s, s), avg(hsv.v, v))
			
			return rgb;
		}
	}
	
	emboss(ground_ctx);
	applyHSVFilter(ground_ctx, shiftHSV(.1, .76, .34))
	emboss(cave_ctx);
	applyHSVFilter(cave_ctx, shiftHSV(.08, .31, .16))
	cave_pattern = mountainCtx.createPattern(cave_canvas, 'repeat');
	ground_pattern = mountainCtx.createPattern(ground_canvas, 'repeat');

	cave_canvas = ground_canvas =ground_ctx= cave_ctx= 0; // free mem

}, 100);
