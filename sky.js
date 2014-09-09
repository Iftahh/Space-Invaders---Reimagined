var sky_canvas;

initFu("Painting Sky", 5, function() {
	
	sky_canvas = render2pixels(sky_width, HEIGHT, function(d) {
	    
	    var i=0; // pixel index
	    range(sky_width, function(x) {
	    	d[i++] = 40; // red
			d[i++] = 50; // green
			d[i++] = 80; // blue;    		
			d[i++] = U8;
	    })
	    // need on average for all 3 components to get to 255 when y=HEIGHT
	    // 255-40 = 210  --> need average 210/HEIGHT  colors per pixel 
	    // to give more "painty" look, don't make it linear but random jumps
	    var chance = 210/HEIGHT,
	    	row_offset = sky_width*4; // 4 bytes per pixel
	    duRange(sky_width, HEIGHT-1, function(x,y) {
			d[i] =  (d[i-4]+d[i-row_offset]+irnda(2) >> 1) + (rnd()<chance?irnda(2):0);
			i++;
			d[i] = (d[i-4]+d[i-row_offset]+irnda(2) >> 1) + (rnd()<chance?irnda(2):0);
			i++;
			d[i] = (d[i-4]+d[i-row_offset]+irnda(2) >> 1) + (rnd()<chance?irnda(2):0);
			i++;
			d[i++] = U8;    	
	    });
	})
	
	skyCtx.fillStyle = skyCtx.createPattern(sky_canvas, 'repeat-x');;
	skyCtx.fillRect(0,0,WIDTH,HEIGHT);

	addWaveFrame()
})

