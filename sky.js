
var sky_width = 250;

// TODO: imgData pattern helpers
sky_canvas = r2c(sky_width, HEIGHT, function(ctx, canvas) {
	var imgData=ctx.createImageData(sky_width,HEIGHT);
    var d = imgData.data;
    
    var i=0; // pixel index
    range(sky_width, function(x) {
    	d[i++] = 40; // red
		d[i++] = 50; // green
		d[i++] = 80; // blue;    		
		d[i++] = U8;
    })
    var row_offset = sky_width*4; // 4 bytes per pixel
    duRange(sky_width, HEIGHT-1, function() {
		d[i] =  (d[i-4]+d[i-row_offset] >> 1) + max(0,irndab(-5,3));
		i++;
		d[i] = (d[i-4]+d[i-row_offset] >> 1) + max(0,irndab(-5,3));
		i++;
		d[i] = (d[i-4]+d[i-row_offset] >> 1) + max(0,irndab(-5,3));
		i++;
		d[i++] = U8;    	
    });
    ctx.putImageData(imgData,0,0);
})

var sky_pattern = skyCtx.createPattern(sky_canvas, 'repeat-x');
