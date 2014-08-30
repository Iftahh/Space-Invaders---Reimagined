
initFu("Digging caves", 10, function() {

	cave_canvas = r2c(ground_pattern_size, ground_pattern_size, function(ctx, canvas) {
		var imgData=ctx.createImageData(ground_pattern_size,ground_pattern_size);
	    var d = imgData.data;
	    var red = painty([], ground_pattern_size, ground_pattern_size,  80,140, -3,3, -3,3, 2, 200);
	    var green = painty([], ground_pattern_size, ground_pattern_size,80,140, -3,3, -3,3, -1, 100);
	    var blue = painty([], ground_pattern_size, ground_pattern_size, 40, 80, -3,3, -3,3, -2, 100);
	    var i=0; // pixel index
	    duRange(ground_pattern_size, ground_pattern_size, function(x,y) {
	    	d[i++] = red(x,y);
			d[i++] = green(x,y);
			d[i++] = blue(x,y);    		
			d[i++] = U8;
	    });
	    ctx.putImageData(imgData,0,0);
	})

});

//grass_canvas = r2c(WIDTH, HEIGHT, function(ctx, canvas) {
//	var imgData=ctx.createImageData(WIDTH,HEIGHT);
//    var d = imgData.data;
//    var red = painty([], WIDTH, HEIGHT, 60,150, -3,-1, 1,3, -2, 100);
//    var green = painty([], WIDTH, HEIGHT,40,90, -3,-1, 1,3, 3, 200);
//    var blue = painty([], WIDTH, HEIGHT, 70, 120, -3,-1, 1,3, -3, 100);
//    var i=0; // pixel index
//    duRange(WIDTH,HEIGHT, function(x,y) {
//    	d[i++] = red(x,y);
//		d[i++] = green(x,y);
//		d[i++] = blue(x,y);    		
//		d[i++] = U8;
//    })
//    ctx.putImageData(imgData,0,0);
//})

// drawImg(groundCtx, cave_canvas, 0,0);
initFu("Digging caves", 3, function() {

	var filtered = Filters.filterCanvas(Filters.convolute, cave_canvas,
			  [   .1,  .1,  .1,
			      .1, .2, .1,
			     .1, .1, .1 ]
			);
	
	// blur the cave canvas
	cave_ctx = cave_canvas.getContext('2d');
	cave_ctx.putImageData(filtered, 0, 0);
}, 100);

//drawImg(groundCtx, cave_canvas, 0,0);
initFu("Digging caves", 3, function() {
	
	// find left top edges
	filtered = Filters.filterCanvas(Filters.convolute, cave_canvas,
			[-1,  0,  0,  0,  0,
		     0, -2,  0,  0,  0,
		     0,  0,  3,  0,  0,
		     0,  0,  0,  0,  0,
		     0,  0,  0,  0, 0]
			);
	
	edges1 = createCanvas(ground_pattern_size, ground_pattern_size)
	var ctx1 = edges1.getContext('2d')
	ctx1.putImageData(filtered, 0, 0);
}, 100);

initFu("Digging caves", 3, function() {
	filtered = Filters.filterCanvas(Filters.convolute, cave_canvas,
			[0,  0,  0,  0,  0,
		     0, 0,  0,  0,  0,
		     0,  0,  3,  0,  0,
		     0,  0,  0,  -2,  0,
		     0,  0,  0,  0, -1]
			);
	var i=0;
	var data = filtered.data;
	range(sq(ground_pattern_size), function() {
		range(3,function() {
			data[i] = U8-data[i];
			i++;
		})
		i++;
	})
	
	edges2 = createCanvas(ground_pattern_size, ground_pattern_size)
	var ctx2 = edges2.getContext('2d')
	ctx2.putImageData(filtered, 0, 0);
}, 100)

initFu("Digging caves", 3, function() {

cave_ctx.globalCompositeOperation = "darken"; 
cave_ctx.drawImage(edges2,0,0,ground_pattern_size,ground_pattern_size);

//groundCtx.drawImage(cave_canvas, 0,0,ground_pattern_size,ground_pattern_size)

cave_ctx.globalCompositeOperation = "lighter";
cave_ctx.drawImage(edges1,0,0,ground_pattern_size,ground_pattern_size);

cave_ctx=edges2=edges1=ct1=ctx2 = null; // free mem

cave_pattern = groundCtx.createPattern(cave_canvas, 'repeat');

}, 100);
//groundCtx.drawImage(cave_canvas, 0,0,ground_pattern_size,ground_pattern_size)

