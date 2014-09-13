
var updateWaves = function(dt) {
	var Spread = 0.25,
		mx_v = 0;

	each(springs, function($) {
		updateSpring($, dt, 0.04, 0.025, water_y);
		mx_v = max(mx_v, abs($.velocity))
	})
	 
	     
	if (mx_v > 1) { 
		var leftDeltas = [],
		rightDeltas = [];
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
},

renderWater = function() {
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
	waterCtx.stroke()
},

waterPixels,
initWaterPixels = function() {
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
},
addWaveFrame = function() {
	if (water_frames.length < WATER_FRAMES) {
		if (!waterPixels) { initWaterPixels(); }
		water_frames.push(waterCtx.createPattern(water_canvas(water_frames.length * TPI/WATER_FRAMES), 'repeat'));
	}
},


water_canvas = function(P) {
	return render2pixels(WIDTH, HEIGHT, function(d) {
	    
	    var displace_x = new Int8Array(WIDTH*HEIGHT),
	    	displace_y = new Int8Array(WIDTH*HEIGHT),
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
	    
		})
};

initFu("Waving waves", 10, function() {
	range(WATER_FRAMES-water_frames.length, function(i) {
		addWaveFrame()
	})
	waterPixels = null; // clean memory
})

waterCtx.strokeStyle = "rgba(200,200,250,0.3)";
waterCtx.lineWidth = 3;

//based on water tutorial 
//http://gamedevelopment.tutsplus.com/tutorials/make-a-splash-with-dynamic-2d-water-effects--gamedev-236

var updateSpring = function(spring, dt, tension, damping, target_height) {
	var x = spring.height - target_height;
	var acceleration = -tension * x -damping*spring.velocity;
	
	spring.velocity += dt*acceleration;
	spring.height += spring.velocity*dt;
},


WATER_SPRING_DX = 10, // water spring every 10 pixels

springs = [];
range(WIDTH/WATER_SPRING_DX+1, function() {
	springs.push({
		height: water_y,
		velocity: 0
	})
})

