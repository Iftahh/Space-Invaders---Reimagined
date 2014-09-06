
function updateWaves(dt) {
	var Spread = 0.25;
	
	var mx_v = 0;
	each(springs, function($) {
		updateSpring($, dt, 0.04, 0.025, water_y);
		mx_v = max(mx_v, abs($.velocity))
	})
	 
	var leftDeltas = [];
	var rightDeltas = [];
	     
	if (mx_v > 1) { 
		// do some passes where springs pull on their neighbours
		range(WAVE_PASSES, function() {
		    for (var i = 0; i < springs.length; i++)
		    {
		        if (i > 0) {
		            leftDeltas[i] = Spread * (springs[i].height - springs [i - 1].height);
		            springs[i - 1].velocity += leftDeltas[i];
		        }
		        if (i < springs.length - 1)
		        {
		            rightDeltas[i] = Spread * (springs[i].height - springs [i + 1].height);
		            springs[i + 1].velocity += rightDeltas[i];
		        }
		    }
		 
		    for (var i = 0; i < springs.length; i++)
		    {
		        if (i > 0)
		            springs[i - 1].height += leftDeltas[i];
		        if (i < springs.length - 1)
		            springs[i + 1].height += rightDeltas[i];
		    }
		})
	}
}

function renderWater() {
	if (OffsetY + 2*HEIGHT < water_y) {
		// no need rendering water if the camera is pointing above it
		return;
	}
	waterCtx.translate(OffsetX, 0);
	waterCtx.beginPath();
	waterCtx.moveTo(WIDTH, OffsetY+HEIGHT);
	waterCtx.lineTo(0, OffsetY+HEIGHT);
	var x=0;
	each(springs, function($) {
		waterCtx.lineTo(x, $.height + 3*sin(TPI*((x-3.5*frameCount*wind)/322) 
							   + 4*sin(TPI*((x-2*frameCount*wind)/511))
							   + 4*sin(TPI*((x-frameCount*wind)/733))
				
				))
		x+= WATER_SPRING_DX;
	})
	waterCtx.closePath();
	waterCtx.fill();
	waterCtx.strokeStyle = "#eef";
	waterCtx.stroke()
}

initFu("Raining water", 3, function() {

	waterPixels=[];
	//var red = painty([], 60,110, -2,2, 1,4, -4, 100);
	//var green = painty([], 80,160, -2,2, 1,4, -2, 500);
	//var blue = painty([], 20, 40, -2,2, 1,4, 3, 1000);
	var i=0; // pixel index
	for (var y=0;y<HEIGHT;y++) {
		var prevR = irndab(5,25);
		var prevG = irndab(10,35);
		var prevB = irndab(20,40);
		for (var x=0; x<WIDTH; x++) {
			var curR = irndab(25,50);
			var curG = irndab(30,65);
			var curB = irndab(70,120);
	
			waterPixels[i++] = 20+(curR+prevR >>1) + round(sin(y*TPI/10)*5); //red(x,y)
			waterPixels[i++] = 25+(curG+prevG >>1) +round(sin(y*TPI/12)*5);//+((x/20)&7)*10 + ((y/20)&7)*10;//green(x,y);
			waterPixels[i++] = 30+(curB+prevB >>1) +round(sin(y*TPI/13)*8);//+((x/30)&15)*10 + ((y/30)&15)*10;//blue(x,y);    		
			waterPixels[i++] = U8;
			
			prevR = curR;
			prevG = curG;
			prevB = curB;
		}
	}
	
	
	
	//blur the water
	var res = []
	_convulate({data:waterPixels, width:WIDTH, height:HEIGHT}, res,
			  [   .1, .1, .1,
			      .1, .2, .1,
			      .1, .1, .1 ]
			);
	waterPixels = res;
}, 1200)

water_canvas = function(P) {
	return render2pixels(WIDTH, HEIGHT, function(d) {
	    
	    var displace_x = [];
	    var displace_y = [];
	    i=0; // pixel index
	    duRange(WIDTH, HEIGHT, function(x,y) {
	    	displace_x[i] = round(5*(x-WIDTH/2)/(3*y/HEIGHT+0.6) + 
					5*sin(P+TPI*(x+2*y)/WIDTH)
					+3*sin(P+TPI*2*(x+y)/WIDTH)
				);
			displace_y[i] = round( 5*(2*(y)/HEIGHT+0.6) * 
					sin(P+TPI*4*(x+y/2)/WIDTH)*
					sin(P+TPI*3.5*(x+y)/WIDTH));
			//displace_x[i] = 0;
			//displace_y[i] = 0;
			i++;
	    })
	    
	    displace(displace_x, displace_y, waterPixels, d, WIDTH, HEIGHT);
	    
//	    var i=0; // pixel index
//		for (var y=0;y<HEIGHT;y++) {
//			var s=3/(y+250);
//			var yy0 = sq(y-700)*5;
//		    for (var x=0; x<WIDTH; x++) {
//		    	var yy=(y+sin((x*x + yy0)/100/HEIGHT+P)*15)*s;
//		    	
//		    	var _x = WIDTH*(x-yy)/s|0;
//		    	var _y = HEIGHT*(y-yy)/s|0;
//		    	
//		    	
//		    	d[i++] = waterPixels[_x+_y*WIDTH]//( (((x+WIDTH)*s+yy)&1)+(((2*WIDTH-x)*s+yy)&1))*127;
//		    	d[i++] = waterPixels[_x+_y*WIDTH+1]//( ((5*((x+WIDTH)*s+yy))&1) + ((5*((WIDTH*2-x)*s+yy))&1))*127;
//		  		d[i++] = waterPixels[_x+_y*WIDTH+2]//(((29*((x+WIDTH)*s+yy))&1)+((29*((WIDTH*2-x)*s+yy))&1))*127;
//		    	// flat
//	//	    	d[i++] = ( (((x+WIDTH)*s)&1)+(((2*WIDTH-x)*s)&1))*127;
//	//	    	d[i++] = ( ((5*((x+WIDTH)*s))&1) + ((5*((WIDTH*2-x)*s))&1))*127;
//	//	  		d[i++] = (((29*((x+WIDTH)*s))&1)+((29*((WIDTH*2-x)*s))&1))*127;
//	//	 		
//		  		d[i++] = U8;
//		  	}
//		  }
		})
}

water_frames = [];

range(WATER_FRAMES, function(i) {
	initFu("Waving waves", 3, (function(_i) {
			return function() {
				water_frames[_i] = waterCtx.createPattern(water_canvas(_i * TPI/WATER_FRAMES), 'repeat');
			}
		})(i)
	)
})
initFu("Waving waves", 0, function() {waterPixels = null;}) // clean memory


//based on water tutorial 
//http://gamedevelopment.tutsplus.com/tutorials/make-a-splash-with-dynamic-2d-water-effects--gamedev-236

function updateSpring(spring, dt, tension, damping, target_height) {
	var x = spring.height - target_height;
	var acceleration = -tension * x -damping*spring.velocity;
	
	spring.velocity += dt*acceleration;
	spring.height += spring.velocity*dt;
}


WATER_SPRING_DX = 10; // water spring every 10 pixels


var springs = [];
range(WIDTH/WATER_SPRING_DX+1, function() {
	springs.push({
		height: water_y,
		velocity: 0
	})
})

