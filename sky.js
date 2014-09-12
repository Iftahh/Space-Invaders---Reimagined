var sky_canvas,
	cloud_images={},
	
getCloudImg = function(brightness) {
	brightness = minmax(6,29, brightness);
	var img = cloud_images[brightness].shift()
	cloud_images[brightness].push(img);
	return img;
};

initFu("Painting Sky", 10, function() {
	
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

initFu("Blowing Clouds", 10, function() {
	var size = 60, rad1 = size*50/200, rad2 = 1.5*rad1;
	for (var brightness=6; brightness<30; brightness++) {
		cloud_images[brightness] = [];
		var b0 = 30+brightness*4;
		for (var cloudInd=0; cloudInd<CLOUDS_ALTERNATIONS; cloudInd++) {
			var img = createCanvas(size*2, size),
				ctx = Ctx(img);
			ctx.scale(2,1);
			for (var ball=0; ball<4; ball++) {
				var bx = irndab(rad2,size-rad2), by = irndab(rad2,size-rad2),
					radgrad = ctx.createRadialGradient( bx,by, rad1, bx,by, rad2),
					b = b0 + irndab(-10,10),
					col1 = 'rgba('+b+','+b+','+b+',.8)',
					col2 = 'rgba('+b+','+b+','+b+',0)';
				radgrad.addColorStop( 0, col1 );   
				radgrad.addColorStop( 1, col2 );
				ctx.fillStyle = radgrad;
				//ctx.fillRect(0,0,size, size);
				ctx.arc(bx,by, rad1*2, 0, TPI);
				ctx.fill()
			}
			
			
			cloud_images[brightness].push(img);
		}
	}
	
	addWaveFrame()
})

