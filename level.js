


// fractal mountain based on http://www.gameprogrammer.com/fractal.html#ptII

initFu("Chiseling Mountains", 10, function() {
	

// Make level form the same every time to avoid bad levels
RNG.setSeed(1)

/*
 * fill1DFractArray - Tessalate an array of values into an
 * approximation of fractal Brownian motion.
 */
fill1DFractArray =function(heights, heightScale, h) {


	/*
	 * avgEndpoints - Given the i location and a stride to the data
	 * values, return the average those data values. "i" can be thought of
	 * as the data value in the center of two line endpoints. We use
	 * "stride" to get the values of the endpoints. Averaging them yields
	 * the midpoint of the line.
	 *
	 * Called by fill1DFractArray.
	 */
	var avgEndpoints = function(i, stride) {
	    return (heights[i-stride] + heights[i+stride]) /2;
	}
    /* subSize is the dimension of the array in terms of connected line
       segments, while size is the dimension in terms of number of
       vertices. */
	var size = heights.length-1;
    var subSize = size;
    size++;
    
	/* Set up our roughness constants.
	   Random numbers are always generated in the range 0.0 to 1.0.
	   'scale' is multiplied by the randum number.
	   'ratio' is multiplied by 'scale' after each iteration
	   to effectively reduce the randum number range.
	   */
	var ratio = Math.pow (2, -h);
	var scale = heightScale * ratio;
	

    /* Seed the endpoints of the array. To enable seamless wrapping,
       the endpoints need to be the same point. */
    var stride = subSize / 2;
    heights[0] = heights[subSize] = 0;

    while (stride) {
		for (var i=stride; i<subSize; i+=2*stride) {
			heights[i] = scale * rndab(.2,1) +
				avgEndpoints (i, stride);

		}
		/* reduce random number range */
		scale *= ratio;
		stride >>= 1;
    }
}



level_img = createCanvas(LevelW, LevelH)
//level_collision = createCanvas(LevelW, LevelH)

level = r2c(LevelW, LevelH, function(ctx, canvas) {
	ctx.lineWidth = 6;
	ctx.strokeStyle = "#ddd";
	ctx.textAlign = 'center';
	ctx.font = "bold 80px Arial";
	ctx.fillStyle = cave_pattern;

	// text air wrapper
	var T = "JS13KGAMES 2014";
	ctx.miterLimit=2;
	ctx.strokeText(T,LevelW/2, LevelH - 250);
	
	// mountain
	ctx.beginPath();
	heights = []
	heights[LevelW] = 0;
	fill1DFractArray(heights, LevelH, .7);
	//var prev = LevelH;
	ctx.lineTo(0,LevelH);
	range(LevelW, function(x) {
		//var cur = (prev +10-20*(prev/LevelH)+rndab(-2,2)+rndab(-2,2))|0;
		//prev = cur;
		if (!heights[x]) {
			console.log(x, heights[x])
		}
		ctx.lineTo(x, LevelH-(heights[x] +
				(.4*LevelH *  sq(sin(2*TPI*x/LevelW)) *sq(sin(PI+3*TPI*x/LevelW))))
		);
//		ctx.lineTo(x, irndab(2,20)+
//					  (LevelH-30)*	(.5+.4*sin(0.6+6*TPI*x/WIDTH))
//						  				   *(.5 -.3*(  sin(1.3+ (1.2+sin(0.4+TPI*x/LevelW)) *TPI*x/LevelW)) 
//						  					   +.2*sq(sin(0.7+3*TPI*x/LevelW)))
//				  );
	});
	ctx.lineTo(LevelW+1,LevelH);
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
	
	// text full inner
	ctx.fillStyle = "#000";
	ctx.fillText(T,LevelW/2, LevelH - 250);
	ctx.fillStyle = "#fff";
	

	ctx.fillStyle = "#ddd";
	T = "ISLAND WAR";
	ctx.fillText(T,LevelW/2, LevelH - 150);
	
//		var pixels = ctx.getImageData(0,0,LevelW, LevelH).data;
//		var i=0;
//		for (var y=0; y<LevelH; y++) {
//			var _y = round(HEIGHT*y/LevelH);
//			for (var x=0; x<LevelW; x++) {
//				var site = {x: round(WIDTH*x/LevelW) + irndab(-1,2), 
//							y: _y+irndab(-1,2) 
//							}
//					if (pixels[i] > 210 && pixels[i] < 235) {
//					// air
//					site.c = 0;
//				}
//				else  if (pixels[i] > 150 && pixels[i] < 180) {
//					// dirt
//					site.c = 1;
//				}
//				else if (pixels[i] < 30) {
//					site.c = 2;
//				}
//				else {
//					i+=4;
//					continue;
//				}
//				//VoronoiDemo.sites.push(site);
//				i += 4;
//			}
//		}
	drawImg(groundCtx, canvas, 0,0)

});
})
