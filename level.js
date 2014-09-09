var levelPixels,
	/*****
	 * Backbuffers allow efficient conversion from level to bitmap only when necessary
	 */
	PAD = 200, // padding to allow some scroll without any redraw
	BB_WIDTH = WIDTH+2*PAD, // backbuffer width = width+padding from left and right
	BB_HEIGHT = HEIGHT+2*PAD,
	_noise = [], NoiseLen=80,
	curBackBuffInd = 0,
	groundBackBuffs = [],
	groundBackCtx = [],
noiseX = function(x,y) {
	return _noise[abs(x*11+y*3)%NoiseLen]
},
noiseY = function(x,y) {
	return _noise[abs(x*9+y*7)%NoiseLen]
};



// fractal mountain based on http://www.gameprogrammer.com/fractal.html#ptII

initFu("Digging Caves", 10, function() {
	
	
	// Make level form the same every time to avoid bad levels
	RNG.setSeed(1)
	
	/*
	 * fill1DFractArray - Tessalate an array of values into an
	 * approximation of fractal Brownian motion.
	 */
	var fill1DFractArray =function(heights, heightScale, h) {
	
	
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
		    return avg(heights[i-stride], heights[i+stride]);
		}
	    /* subSize is the dimension of the array in terms of connected line
	       segments, while size is the dimension in terms of number of
	       vertices. */
		var size = heights.length-1,
	    	subSize = size;
	    size++;
	    
		/* Set up our roughness constants.
		   Random numbers are always generated in the range 0.0 to 1.0.
		   'scale' is multiplied by the randum number.
		   'ratio' is multiplied by 'scale' after each iteration
		   to effectively reduce the randum number range.
		   */
		var ratio = Math.pow (2, -h),
			scale = heightScale * ratio,
		
	
	    /* Seed the endpoints of the array. To enable seamless wrapping,
	       the endpoints need to be the same point. */
	       stride = subSize / 2;
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
	
	
	
	/***
	 * Generate level map by drawing different colors in a small canvas
	 * see constants above
	 */
	var level = createCanvas(levelWidth, levelHeight),
		ctx = Ctx(level),
		//these colors in level indicate what kind of cell to draw in background canvas
		//Note: red channel need to be x<<5  from the cell type!
		C_AIR = 'rgba(0,0,0,0)',
		C_VEGETATION = '#400000',
		C_GROUND = '#600000',
		C_CAVE_FLOOR = '#800000',
		C_CAVE = '#a00000',  // underground AIR
		C_ROCK = '#c00000'; // unbreakable
	
	
	ctx.fillStyle = C_AIR;
	ctx.fillRect(0,0, levelWidth, levelHeight);
		
	
	ctx.shadowColor = C_VEGETATION;
	ctx.shadowBlur = 0;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = -14;
	ctx.fillStyle = C_GROUND;
	
	//	ctx.textAlign = 'center';
	//	ctx.font = "bold 80px Arial";
	//
	//	// text VEGETATION wrapper
	//	var T = "JS13KGAMES 2014";
	//	ctx.miterLimit=2;
	//ctx.strokeText(T,levelWidth/2, levelHeight - 250);
	
	// fractal mountain
	var heights = [];
	heights[levelWidth] = 0;
	fill1DFractArray(heights, levelHeight*1.5, .7);
	
	ctx.beginPath();
	ctx.lineTo(0,levelHeight);
	
	range(levelWidth, function(x) {
		// add sinuses on top of the fractal
		heights[x] += .4*levelHeight *  sq(sin(2*TPI*x/levelWidth)) *sq(sin(PI+3*TPI*x/levelWidth))
		// lower a bit the left/right edges of level
		heights[x] *= 1/(1+sq(.001*(x-levelWidth/2)))
	
		// make the mountain path
		ctx.lineTo(x, levelHeight-heights[x]);
	})
	
	ctx.lineTo(levelWidth+1,levelHeight);
	ctx.closePath();
	ctx.fill();
	
	ctx.clip();
	
	ctx.shadowOffsetY = 3;
	ctx.lineWidth = 22;
	ctx.shadowColor = C_CAVE_FLOOR;
	ctx.beginPath();
	ctx.strokeStyle = C_CAVE;
	// draw caves
	ctx.moveTo(0,levelHeight * .6);
	ctx.lineTo(levelWidth, levelHeight *.9);
	ctx.moveTo(0,levelHeight * .9);
	ctx.lineTo(levelWidth, levelHeight *.6);
	ctx.moveTo(levelWidth*.1,0);
	ctx.lineTo(levelWidth*.7, levelHeight*.81)
	ctx.moveTo(levelWidth*.9,0)
	ctx.lineTo(levelWidth*.3, levelHeight*.81)
	ctx.stroke()
	
	ctx.beginPath()
	ctx.fillStyle = C_CAVE;
	ctx.arc(levelWidth*.10, levelHeight*.75, 30, 0, TPI)
	ctx.arc(levelWidth*.90, levelHeight*.75, 30, 0, TPI)
	ctx.fill();
	
	// text full inner
	//	ctx.fillStyle = C_ROCK;
	//	ctx.fillText(T,levelWidth/2, levelHeight - 250);
	//	ctx.fillStyle = C_CAVE;
	//	T = "ISLAND WAR";
	//	ctx.fillText(T,levelWidth/2, levelHeight - 150);
	
	//	drawImg(mountainCtx, canvas, 0,0)
	
	levelPixels = new Uint8Array(levelWidth*levelHeight);
	var d = ctx.getImageData(0,0,levelWidth, levelHeight).data,
		i=0,j=0;
	duRange(levelWidth, levelHeight, function(x,y) {
		// examining "R" in RGBA of the color
		// the other (G,B,A) channels may be used later (ie. deadly, hidden passage, etc..)
		
		//Note: canvas automatically has anti-alias :(  so can't rely on exact values.
		//that is why not using the lower 5 binary digits
		var res = d[i+= 4] >> 5;
		var py = y/levelHeight;
		if (py < .4 && (res == GRASS || res == GROUND) && (y < levelHeight-heights[x] + 100*(.4-py))) {
			res = ICE;
		}
		levelPixels[j++] = res;
	});
})


range(2, function() {
	var canv = createCanvas(BB_WIDTH, BB_HEIGHT);
	groundBackBuffs.push(canv);
	groundBackCtx.push(canv.getContext('2d'))
})


range(NoiseLen,function() {
	_noise.push(irndab(-(CELL_SIZE>>1),1+(CELL_SIZE>>1)));  // should be at most CELL_SIZE/2
})

/*************************************************
 * drawToBackBuff
 * ---------------
 * Generate textured bitmap from level info
 * -----------------------------------------
 * 
 * cx,cy = top left corner camera
 * x,y = destination left corner in back buffer
 * w,h = width,height of section in back buffer to draw
 * 
 *  Note: assumes the x,y map to beginning of 4x4 cell (see CELL_SIZE in globals.js)
 * for each pixel in level draw 4x4 cell according to type
 */
var drawToBackBuff = function(ctx, cx,cy, x,y, w,h) {
	var cellsPerRow = w/CELL_SIZE|0, 
		numRows = h/CELL_SIZE|0,
		lvlX=cx/CELL_SIZE|0,
		lvlY=cy/CELL_SIZE|0,
		x0=lastRenderX,//lvlX*CELL_SIZE,	// how much to offset for patterns to stay at same place
		y0=lastRenderY;////lvlY*CELL_SIZE;
	ctx.save()
	ctx.translate(-x0,-y0); // need to translate to avoid patterns staying the same place on screen
//	ctx.clearRect(x0,y0,w,h); // no need clearing here- already cleared all ctx
	ctx.rect(x0+x,y0+y, w,h);
	ctx.clip();

	x -= CELL_SIZE;
	x -= x%CELL_SIZE;
	y -= CELL_SIZE;
	y -= y%CELL_SIZE;
	cellsPerRow+=4;	
	numRows+=2;
	x0+=x;
	var curY=y0+y;
	
	for (var ly=lvlY; ly<lvlY+numRows; ly++) {
		var prevType = getPattern(lvlX, ly),
			leftX=0; // beginning of rectangle
		range(cellsPerRow, function(lx){
			// find horizontal strips- make rectangles of them
			var curType = getPattern(lvlX+lx, ly);
			if (DBG && (curType === undefined)){ //|| curType == '#433')) {
				console.log(curType+" pixel at y="+ly.toFixed(1)+" x="+(lx+lvlX).toFixed(1));
			}
			if ((curType != prevType) || lx>=cellsPerRow-1) {
				if (prevType) {
					ctx.fillStyle = prevType;
//					ctx.fillRect(x0+leftX*CELL_SIZE, curY, (lx-leftX)*CELL_SIZE, CELL_SIZE);
					//console.log("Filling rect at "+(x+leftX*CELL_SIZE)+','+ curY+ ' w:'+((lx-leftX)*CELL_SIZE+ '  color: '+curType));
					ctx.beginPath()
					ctx.moveTo(x0+leftX*CELL_SIZE+noiseX(leftX, ly), curY+noiseY(leftX, ly))
					for (var xx=leftX+1; xx<=lx; xx++) {
						ctx.lineTo(x0+xx*CELL_SIZE+noiseX(xx, ly), curY+noiseY(xx, ly))
					}
					xx--;
					ctx.lineTo(x0+xx*CELL_SIZE+noiseX(xx, ly+1), 1+curY+CELL_SIZE+noiseY(xx, ly+1))
					for (; xx>=leftX; xx--) {
						ctx.lineTo(x0+xx*CELL_SIZE+noiseX(xx, ly+1), 1+curY+CELL_SIZE+noiseY(xx, ly+1))
					}
					ctx.closePath();
					ctx.fill()
				}
				leftX = lx;
			}
			prevType = curType;
		})
		curY += CELL_SIZE;
	}
	ctx.restore()
},

/****
 * Convert from level to canvas fillStyle that will be used to draw to the canvas
 */
 typeMap = {},
 minDirtyX=minDirtyY=10e6,
 maxDirtyX=maxDirtyY=-10e6,
setCellType = function(x,y,t) {
	levelPixels[y*levelWidth+x]  = t;
	x*=CELL_SIZE;
	y*=CELL_SIZE;
	minDirtyX = min(minDirtyX, x-CELL_SIZE*2);
	minDirtyY = min(minDirtyY, y-CELL_SIZE*2);
	maxDirtyX = max(maxDirtyX, x+CELL_SIZE*2);
	maxDirtyY = max(maxDirtyY, y+CELL_SIZE*2);
},
redrawDirty = function() {
	if (minDirtyX < 10e6) {
		groundBackCtx[curBackBuffInd].clearRect(minDirtyX - lastRenderX, minDirtyY - lastRenderY, maxDirtyX-minDirtyX-2, maxDirtyY-minDirtyY-2)
		drawToBackBuff(groundBackCtx[curBackBuffInd], 
				minDirtyX, minDirtyY, 
				minDirtyX - lastRenderX-1, minDirtyY - lastRenderY-1,  maxDirtyX-minDirtyX, maxDirtyY-minDirtyY);
		
		minDirtyX=minDirtyY=10e6;
		maxDirtyX=maxDirtyY=-10e6;
	}
},
getCellType = function(x,y) {
	if (y<0) { 
		return AIR; // above level is only AIR
	}
	if (x<0) {
		return (y>=levelHeight-.4*x) ? ROCK : AIR;
	}
	if (x>=levelWidth) {
		return (y>= levelHeight+.4*(x-levelWidth)) ? ROCK : AIR;
	}
	if (y>=levelHeight) {
		return ROCK;
	}
	return levelPixels[y*levelWidth+x]  
},
getPattern = function(x,y) {
	var res = typeMap[getCellType(x,y)];
	return res === undefined ? CAVE_FLOOR : res;  // can't use the "||" trick because it might be zero
},

isCollide = function(x,y) {
	return isCollideType(getCellType(x,y));
	
},
isCollideType = function(t) {
	return t == ROCK || t== GROUND || t==ICE;
},

AIR = 0,
BURNED_GRASS = 1,
GRASS = 2,
GROUND = 3,
CAVE_FLOOR = 4,
CAVE = 5,
ROCK = 6,
ICE = 7;


initFu("Digging Caves", 10, function() {
	// order matters - to avoid anti alias throwing to far away cell type
	typeMap = [ 
		0,				
		burned_grass_pattern, 
		grass_pattern,// VEGETATION   
		ground_pattern, // GROUND   
		cave_floor_pattern, //CAVE_FLOOR #888
		cave_pattern, //CAVE
		'#333', 	//ROCK
		ice_pattern
	]
	addWaveFrame()
});



lastRenderX = lastRenderY = 10e6,

scrollBackground = function(cx,cy) { // center camera on cx,cy  (world coordinates)
	cx-=BB_WIDTH/2; 	// change to top left corner of back buffer
	cy-=BB_HEIGHT/2;
	var ctx = groundBackCtx[curBackBuffInd],
		dx = cx-lastRenderX,
		dy = cy-lastRenderY,
		adx = abs(dx),
		ady = abs(dy);
	if (!adx && !ady) {
		return;
	}
	if (adx > BB_WIDTH || ady > BB_HEIGHT) {
		lastRenderX = cx;
		lastRenderY = cy;
		// scrolled too far, can't reuse at all
		drawToBackBuff(ctx, cx, cy, 0, 0, BB_WIDTH,BB_HEIGHT);
	}
	else if (adx > PAD || ady > PAD) {
		// scrolled too far, must redraw but can reuse some of the old drawn 
		lastRenderX = cx;
		lastRenderY = cy;
		
        // already has image in cache
        var x,sx, y,sy,
        	screenOffsetY = 0;

        if (dx < 0) {
            // moved to left - set screen x to dx and source-x to 0
            x = adx;
            sx = 0;
        }
        else {
            // moved to right
            x = 0;
            sx = adx;
        }
        if (dy < 0) {
            // moved to top
            y = ady;
            sy = 0;
        }
        else {
            // moved to bottom
            sy = ady;
            y = 0;
        }
        
        var reuseWidth = BB_WIDTH - adx,
        	reuseHeight = BB_HEIGHT - ady,

        	otherInd = 1-curBackBuffInd,
        	cctx2 = groundBackCtx[otherInd];

        if (DBG) console.log("reuse drawing at "+x.toFixed(1)+", "+y.toFixed(1)+ "   sxy="+sx.toFixed(1)+","+sy.toFixed(1)+ " wh:"+reuseWidth.toFixed(1)+","+reuseHeight.toFixed(1));
        cctx2.clearRect(0,0,BB_WIDTH, BB_HEIGHT);
        cctx2.drawImage( groundBackBuffs[curBackBuffInd],sx,sy, reuseWidth, reuseHeight,
            x, y, reuseWidth, reuseHeight);


        var top = cy, left=cx;
        
        if (dy < 0) {
            // draw horizontal strip at top of buffer
            if (DBG) console.log("horiz strip at "+left.toFixed(1)+", "+top.toFixed(1)+ "   w,h="+BB_WIDTH+","+ady.toFixed(1)+ " (top of buffer)");
//            _drawBackground(cctx2, left, top,       BB_WIDTH, ady);
            drawToBackBuff(cctx2, left, top, 0, 0, BB_WIDTH,ady);
            // the vertical strip should DY down
            screenOffsetY = ady;
            top += ady;
        }
        else {
            if (DBG) console.log("horiz strip at "+left.toFixed(1)+", "+(top+BB_HEIGHT-ady).toFixed(1)+ "   w,h="+BB_WIDTH+","+ady.toFixed(1) + " (bottom of buffer)");
            // draw horizontal strip at bottom of buffer
//            _drawBackground(cctx2, left, top+BB_HEIGHT-ady, BB_WIDTH, ady);
            drawToBackBuff(cctx2, left, top+BB_HEIGHT-ady, 
            		0, BB_HEIGHT-ady,
            		BB_WIDTH,ady);
            // the vertical strip should start at top - no need for modifying top or translating context
        }

        if (dx < 0) {
//            left -= PAD;
            if (DBG) console.log("vert strip at "+left.toFixed(1)+", "+top.toFixed(1)+ "   w,h="+adx.toFixed(1)+","+(BB_HEIGHT-ady).toFixed(1) + " (left of buffer)");
            // draw vertical strip on the left of buffer
            //_drawBackground(cctx2, left, top, adx, BB_HEIGHT-ady);
            drawToBackBuff(cctx2, left, top,
            		0, screenOffsetY,
            		adx, BB_HEIGHT-ady);
        }
        else {
            left += BB_WIDTH-adx;
            if (DBG) console.log("vert strip at "+left.toFixed(1)+", "+top.toFixed(1)+ "   w,h="+adx.toFixed(1)+","+(BB_HEIGHT-ady).toFixed(1) + " (right of buffer)");
            // draw vertical strip on the right of buffer
            //_drawBackground(cctx2, left, top, adx, BB_HEIGHT-ady);
            drawToBackBuff(cctx2, left, top, 
            		BB_WIDTH-adx, screenOffsetY,
            		adx, BB_HEIGHT-ady);
        }


        curBackBuffInd = otherInd;
        dx=dy=0;
    }
	mountainCtx.clearRect(0,0,WIDTH,HEIGHT)
//	mountainCtx.globalCompositeOperation = 'copy'; 
	mountainCtx.drawImage(groundBackBuffs[curBackBuffInd], PAD+dx, PAD+dy, WIDTH, HEIGHT, 0,0, WIDTH,HEIGHT)
}

