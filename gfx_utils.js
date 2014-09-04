

var painty = function(buffer, width,height, base_min, base_top, mndirx,mxdirx, mndiry, mxdiry, color_step, seed_chance) {
	var fu = function(x,y) {
		var ei=y*width+x;
		try {
			return buffer[ei] ?
						buffer[ei] :
						buffer[ei]= irnda(seed_chance) ? 
									minmax(0, U8, (irnda(color_step)+fu((width+x-irndab(mndirx,mxdirx)) %width, 
											(height+y-irndab(mndiry,mxdiry))%height)))
									: irndab(base_min,base_top);
		}
		catch(e) {
			if (DBG) console.log(e)
			return buffer[ei]= irndab(base_min,base_top);
		}
	}
	return fu;
}


rgb2hsv = function(r,g,b) {
    r /= U8;
    g /= U8;
    b /= U8;
    var rr, gg, bb,
        h, s,
        v = Math.max(r, g, b),
        diff = v - Math.min(r, g, b),
        diffc = function(c){
            return (v - c) / 6 / diff + 1 / 2;
        };

    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(r);
        gg = diffc(g);
        bb = diffc(b);

        if (r === v) {
            h = bb - gg;
        }else if (g === v) {
            h = (1 / 3) + rr - bb;
        }else { // if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h++;
        }else if (h > 1) {
            h--;
        }
    }
    return {
        h: h,
        s: s,
        v: v
    };
}

hsv2rgb = function(h, s, v) {
    if (s === undefined) {
        s = h.s, v = h.v, h = h.h;
    }
    var i = (h * 6)|0,
    	f = h * 6 - i,
    	p = v * (1 - s),
    	q = v * (1 - f * s),
    	t = v * (1 - (1 - f) * s),
    	r, g, b;
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: (r * U8)|0,
        g: (g * U8)|0,
        b: (b * U8)|0
    };
}

applyHSVFilter = function(ctx, fu) {
	var pixels = getPixels(ctx),
		d=pixels.data,
		i=0;
	range(pixels.width*pixels.height, function() {
		var hsv= rgb2hsv(d[i],d[i+1],d[i+2]),
			rgb = fu(hsv);
		d[i++] = rgb.r;
		d[i++] = rgb.g;
		d[i++] = rgb.b;
		i++;
	})
	ctx.putImageData(pixels,0,0)
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




//rdp = [148, 1000, 500, 400];
//grp = [610, 60, 864, 860];
//blp = [180, 100, 503, 103];
//
//wavy = function(x,y,p, yp1, yp2){
//  return 63*(((sqrt(sq(p[0]-x)+yp1)+1)/((abs(sin((sqrt(sq(p[2]-x)+yp2))/115)))+1)/200)|0);
//}

//
//wavy_canvas = r2c(WIDTH, HEIGHT, function(ctx, canvas) {
//	var imgData=ctx.createImageData(WIDTH,HEIGHT);
//  var d = imgData.data;
//  var i=0; // pixel index
//  for (var y=0;y<HEIGHT;y++) {
//  	for (var x=0; x<WIDTH; x++) {
//  		d[i++] = wavy(x,y, rdp);
//  		d[i++] = wavy(x,y, grp);
//  		d[i++] = wavy(x,y, blp);
// 		
//  		d[i++] = U8;
//  	}
//  }
//  ctx.putImageData(imgData,0,0);
//})


//based on http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
_convulate = function(pixels, dst, weights) {
	  
    side = round(sqrt(weights.length)),
  	halfSide = side/2|0,
  	src = pixels.data,
  	sw = pixels.width,
  	sh = pixels.height;
  // go through the destination image pixels
  //var alphaFac = opaque ? 1 : 0;
  var dstOff = 0;
  duRange(sw,sh, function(x,y) {
      // calculate the weighed sum of the source image pixels that
      // fall under the convolution matrix
      var r=0, g=0, b=0;//, a=0;
      duRange(side, side, function(cx,cy) {
          var scy = y + cy - halfSide;
          var scx = x + cx - halfSide;
          scy += sh*10;
          scy %= sh;
          scx += sw*10;
          scx %= sw;
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
}

convolute = function(ctxIn, ctxOut, weights) {
  var  pixels = getPixels(ctxIn),
  	   output = (ctxOut || ctxIn).createImageData(pixels.width, pixels.height);
 
  _convulate(pixels, output.data, weights);
  if (!ctxOut) {
	  return output;
  }
  ctxOut.putImageData(output, 0, 0)
}



emboss = function(ctx) {
	var w=ctx.canvas.width, h=ctx.canvas.height;
	
	// find top-left edges
	var edges1 = createCanvas(w,h)
	convolute(ctx, Ctx(edges1),  
			[-1,  0,  0,  0,  0,
		     0, -2,  0,  0,  0,
		     0,  0,  3,  0,  0,
		     0,  0,  0,  0,  0,
		     0,  0,  0,  0, 0]
			);

	
	// find the bottom-right edges
	var filtered = convolute(ctx, 0,
			[0,  0,  0,  0,  0,
		     0, 0,  0,  0,  0,
		     0,  0,  3,  0,  0,
		     0,  0,  0,  -2,  0,
		     0,  0,  0,  0, -1]
		),
		i=0, 
		data = filtered.data;
	// inverse r,g,b 
	range(w*h, function() {
		range(3,function() {
			data[i] = U8-data[i];
			i++;
		})
		i++;
	})
	
	var edges2 = createCanvas(w,h); 
	Ctx(edges2).putImageData(filtered, 0, 0);

	// draw the bottom-right darker
	ctx.globalCompositeOperation = "darken"; 
	ctx.drawImage(edges2,0,0,w,h);

	// draw the top-left lighter
	ctx.globalCompositeOperation = "lighter";
	ctx.drawImage(edges1,0,0,w,h);
}