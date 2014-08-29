

var painty = function(buffer, base_min, base_top, mndirx,mxdirx, mndiry, mxdiry, color_step, seed_chance) {
	var fu = function(x,y) {
		var ei=y*WIDTH+x;
		try {
			return buffer[ei] ?
						buffer[ei] :
						buffer[ei]= irnda(seed_chance) ? 
									minmax(0, 255, (irnda(color_step)+fu((x-irndab(mndirx,mxdirx)) %WIDTH, 
											(y-irndab(mndiry,mxdiry))%HEIGHT)))
									: irndab(base_min,base_top);
		}
		catch(e) {
			return buffer[ei]= irndab(base_min,base_top);
		}
	}
	return fu;
}








// displace bitmap pixels
function displace(displace_x, displace_y, pixel_data, new_data, width, height) {
	var di = 0; // destination index
	var i=0;
	var w20 = 20*width;
	var h20 = 20*height;
	duRange(width, height, function(x,y) {
		var dx = displace_x[i];
		var dy = displace_y[i];
		i++;
		// adding 20*width to avoid negative array index even for large dx (the modulo width makes it correct)
		var oi = 4*((x-dx+w20)%width + ((y-dy+h20)%height)*width);
		new_data[di++] = pixel_data[oi++];
		new_data[di++] = pixel_data[oi++];
		new_data[di++] = pixel_data[oi++];
		new_data[di++] = pixel_data[oi];
	})
}



//taken from http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
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

	tmpCanvas: DC.createElement('canvas'),
	
	createImageData: function(w,h) {
	  return this.tmpCtx.createImageData(w,h);
	},
	
	convolute: function(pixels, weights, wrap) {
		  var side = round(sqrt(weights.length));
		  var halfSide = side/2|0;
		  var src = pixels.data;
		  var sw = pixels.width;
		  var sh = pixels.height;
		  // pad output by the convolution matrix
		  var w = sw;
		  var h = sh;
		  var output = Filters.createImageData(w, h);
		  var dst = output.data;
		  // go through the destination image pixels
		  //var alphaFac = opaque ? 1 : 0;
		  var dstOff = 0;
		  duRange(w,h, function(x,y) {
		      var sy = y;
		      var sx = x;
		      // calculate the weighed sum of the source image pixels that
		      // fall under the convolution matrix
		      var r=0, g=0, b=0;//, a=0;
		      duRange(side, side, function(cx,cy) {
		          var scy = sy + cy - halfSide;
		          var scx = sx + cx - halfSide;
		          scy += HEIGHT*10;
		          scy %= HEIGHT;
		          scx += WIDTH*10;
		          scx %= WIDTH;
		          //if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
		            var srcOff = (scy*sw+scx)*4;
		            var wt = weights[cy*side+cx];
		            r += src[srcOff] * wt;
		            g += src[srcOff+1] * wt;
		            b += src[srcOff+2] * wt;
		            //a += src[srcOff+3] * wt;
		          //}
		      })
		      dst[dstOff++] = r;
		      dst[dstOff++] = g;
		      dst[dstOff++] = b;
		      dst[dstOff++] = U8;//a + alphaFac*(255-a);
		  })
		  return output;
		}
};
Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');
