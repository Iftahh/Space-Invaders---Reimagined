

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
},


rgb2hsv = function(r,g,b) {
	if (DBG && (r>U8 || g>U8 || b>U8)) { alert("bad rgb")}
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
},

hsv2rgb = function(h, s, v) {
	if (DBG && (h>1 || s>1 || v>1)) { alert("bad hsv")}
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
},

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
},


// displace bitmap pixels
displace = function(displace_x, displace_y, pixel_data, new_data, width, height) {
	var di = 0, // destination index
		i=0,
		w20 = 20*width,
		h20 = 20*height;
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
},




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
	  
    var side = round(sqrt(weights.length)),
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
      var r=0, g=0, b=0, a=src[(y*sw+x)*4+3];
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
      dst[dstOff++] = a;//U8;//a + alphaFac*(255-a);
  })
},

convolute = function(ctxIn, ctxOut, weights) {
  var  pixels = getPixels(ctxIn),
  	   output = (ctxOut || ctxIn).createImageData(pixels.width, pixels.height);
 
  _convulate(pixels, output.data, weights);
  if (ctxOut) {
	  ctxOut.putImageData(output, 0, 0)
  }
  return output;
},



emboss = function(ctx, bottomRightBright) {
	var w=ctx.canvas.width, h=ctx.canvas.height,
	
	// find top-left edges
		edgesTopLeft = createCanvas(w,h),
	tl = convolute(ctx, Ctx(edgesTopLeft),  
			[-1,  0,  0,  0,  0,
		     0, -2,  0,  0,  0,
		     0,  0,  3,  0,  0,
		     0,  0,  0,  0,  0,
		     0,  0,  0,  0, 0]
			),

	
	// find the bottom-right edges
	edgesBottomRight = createCanvas(w,h),
	br = convolute(ctx, Ctx(edgesBottomRight),
			[0,  0,  0,  0,  0,
		     0, 0,  0,  0,  0,
		     0,  0,  3,  0,  0,
		     0,  0,  0,  -2,  0,
		     0,  0,  0,  0, -1]
		),
		i=0, 
		imgData = bottomRightBright ? tl : br,
		data = imgData.data,
		lighter = edgesTopLeft,
		darker = edgesBottomRight;
	
	// inverse r,g,b 
	range(w*h, function() {
		range(3,function() {
			data[i] = U8-data[i];
			i++;
		})
		i++;
	})
	
	if (bottomRightBright) {
		lighter = edgesBottomRight;
		darker = edgesTopLeft;
	}
	Ctx(darker).putImageData(imgData, 0, 0);

	// draw the bottom-right darker
	ctx.globalCompositeOperation = "darken"; 
	ctx.drawImage(darker,0,0,w,h);

	// draw the top-left lighter
	ctx.globalCompositeOperation = "lighter";
	ctx.drawImage(lighter,0,0,w,h);
},




intArrayToImg = function(arr, width,height, rgbBits) {
	return render2pixels(width,height, function(d) {
		var i=0;
		
		for (var j=0; j<height*width; ) {
			var num = arr[i++];
			for (var b=0; b<16; b++) {  // each num is a strip of 16 pixels
				var val = (num & 3) * U8/3 |0,
					offset = (j+15-b)*4;
				num >>= 2;
				d[offset++] = (~rgbBits&1)? val/2 : val;
				d[offset++] = (~rgbBits&2)? val/2 : val;
				d[offset++] = (~rgbBits&4)? val/2 : val;
				d[offset++] = (val == 0) ? 0: U8; // alpha is all or nothing
			}
			j+=16;
		} 
	})
}

if (DBG) {
	/**
	 * Convert img to byte string - 2bits per pixel  - 00 = transparent, 1,2,3 - different levels of gray
	 * width*height should be divisible by 16
	 */
	convertImgToIntArray = function(img) {
		// convert Image to Canvas
		var canvas = createCanvas(img.width, img.height);
			ctx = Ctx(canvas);
		ctx.drawImage(img, 0,0, img.width, img.height );
		
		var	pixels = getPixels(ctx).data,
			result = [], 
			i=0; // pixels byte index
		var collector = 0;
		for (var j=0; j<img.height*img.width; j++) {
			var r = pixels[i++],
				g = pixels[i++],
				b = pixels[i++],
				a = pixels[i++];
			if (a > 10) {
				var p = (r+g+b)/3;
				if (p > .66*U8) {
					twobit = 3;
				}
				else if (p > U8/3) {
					twobit = 2;
				}
				else twobit = 1;
				
				collector += twobit;
			}
			if ((j+1) % 16 == 0) {
				result.push(collector);
				collector = 0;
			}
			collector <<= 2;
		}
		return result;
	}
}

