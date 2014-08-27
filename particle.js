/*
 Particle Emitter
	Based on Parcycle: by Mr Speaker - www.mrspeaker.net
	which is based on the code from 71squared.com iPhone tutorials

  Modified:
    forcePoints to push and pull particles
    wind function
    render particle method
*/



/* Vector Helper */
vector_create=function( x, y ){
    return {x:x || 0,y: y || 0,
    	scale: function(s) { this.x *= s; this.y *= s},
    	add: function(v) {this.x += v.x; this.y += v.y}
//    	,len2: function() {return sq(this.x)+sq(this.y)}
    }
}

vector_multiply= function( vector, scaleFactor ){
    return vector_create(vector.x * scaleFactor,
            vector.y * scaleFactor);
}
vector_add = function( vector1, vector2 ){
    return vector_create(vector1.x + vector2.x,
            vector1.y + vector2.y);
}
vector_sub = function (vector1, vector2) {
    return vector_create(vector1.x - vector2.x,
            vector1.y - vector2.y);
}
//vector_len2= function(vector) {
//    return sq(vector.x) + sq(vector.y);
//}


// Individual particle
Particle = function() {
	return {
		// really everything is overwritten - no need setting defaults
	    position: vector_create(0,0),
//	    direction: [0,0],
//	    size: 0,
//	    sizeSmall: 0,
//	    timeToLive: 0,
	    color: [],
//	    drawColor: "",
	    deltaColor: [],
//	    deltaSize: 0,
//	    sharpness: 0,
	    
	    // allow to override render
	    render: function(context) {
            var size = this.size;
			var halfSize = size >> 1;
			var x = ~~this.position.x;
			var y = ~~this.position.y;
					
			var radgrad = context.createRadialGradient( x + halfSize, y + halfSize, this.sizeSmall, x + halfSize, y + halfSize, halfSize);  
			radgrad.addColorStop( 0, this.drawColor );   
			radgrad.addColorStop( 1, 'rgba(0,0,0,0)' );
			context.fillStyle = radgrad;
		  	context.fillRect( x, y, size, size );
	    }
	}
}




ParticlePointEmitter = function(maxParticles, options) {
	res = {
//	    particles: null,
//	    maxParticles: null,
	    // Default Properties
//	    size: 30,
//	    sizeRandom: 12,
//	    speed: 6,
//	    speedRandom: 2,
//	    angle: 0,
//	    angleRandom: 180,
//	    lifeSpan: 8,
//	    lifeSpanRandom: 6,
//	    startColor: [ 220, 208, 88, 1 ],
//	    startColorRandom: [ 52, 55, 58, 0 ],
//	    finishColor: [ 255, 45, 10, 0 ],
//	    finishColorRandom: [ 40, 40, 40, 0 ],
//	    sharpness: 35,
//	    sharpnessRandom: 12,
	    forcePoints: [], // pairs of weight and location.  positive weight attracts, negative weight pushes
	    wind: null, // function returning value of wind - can change over time
	    area: 0.3, // used to calculate wind affect
	
	    updateParticle: function() {},
	
	    init: function(maxParticles, options) {
			this.setOptions({
		        maxParticles: maxParticles,
		        particles: [],
		        graveyard: [],
		        active: true,

		//        this.position = vector_create(300, 300);
		        positionRandom:  vector_create(12, 12),
		        gravity:  vector_create( 0.0, 0.3),
		
		        elapsedTime: 0,
		        duration: -1,
		        emissionRate:0,
		        emitCounter: 0,
		
				emitCounter: 0				
			})
	        this.setOptions(options || {})
		},
	
	    setOptions: function(options) {
	        for (var k in options) {
	            this[k] = options[k];
	        }
	        if (!this.finishSize) {
	        	this.finishSize = this.size;
	        }
	        this.emissionRate = this.maxParticles / this.lifeSpan;
	    },
		
		addParticle: function(){
			if(this.particles.length == this.maxParticles) {
				return null;
			}
			
			// Take the next particle out of the particle pool we have created and initialize it
			
			var particle = this.graveyard.shift() || Particle();
			this.initParticle( particle );
	        this.particles.push(particle);
			return particle;
		},
		
		initParticle: function( particle ){
	
			particle.position.x = this.position.x + this.positionRandom.x * rndab(-1,1);
			particle.position.y = this.position.y + this.positionRandom.y * rndab(-1,1);
	
			var newAngle = (this.angle + this.angleRandom * rndab(-1,1) ) * ( PI / 180 ); // convert to radians
			var vector = vector_create(Math.cos( newAngle ), sin( newAngle ));
			var vectorSpeed = this.speed + this.speedRandom * rndab(-1,1);
			particle.direction = vector_multiply( vector, vectorSpeed );
	
			particle.size = this.size + this.sizeRandom * rndab(-1,1);
			particle.size = particle.size <= 1 ? 1 : ~~particle.size;
			particle.finishSize = this.finishSize + this.sizeRandom * rndab(-1,1);
			
			particle.timeToLive = this.lifeSpan + this.lifeSpanRandom * rndab(-1,1);
			
			particle.sharpness = this.sharpness + this.sharpnessRandom * rndab(-1,1);
			particle.sharpness = particle.sharpness > 100 ? 100 : particle.sharpness < 0 ? 0 : particle.sharpness;
			// internal circle gradient size - affects the sharpness of the radial gradient
			particle.sizeSmall = ~~( ( particle.size / 200 ) * particle.sharpness ); //(size/2/100)
	
			var start = [
				this.startColor[ 0 ] + this.startColorRandom[ 0 ] * rndab(-1,1),
				this.startColor[ 1 ] + this.startColorRandom[ 1 ] * rndab(-1,1),
				this.startColor[ 2 ] + this.startColorRandom[ 2 ] * rndab(-1,1),
				this.startColor[ 3 ] + this.startColorRandom[ 3 ] * rndab(-1,1)
			];
	
			var end = [
				this.finishColor[ 0 ] + this.finishColorRandom[ 0 ] * rndab(-1,1),
				this.finishColor[ 1 ] + this.finishColorRandom[ 1 ] * rndab(-1,1),
				this.finishColor[ 2 ] + this.finishColorRandom[ 2 ] * rndab(-1,1),
				this.finishColor[ 3 ] + this.finishColorRandom[ 3 ] * rndab(-1,1)
			];
	
	
		    particle.color = start;
	        if (isNaN(particle.color[ 2 ]) ) {
	            console.log("Error");
	        }
			particle.deltaColor[ 0 ] = ( end[ 0 ] - start[ 0 ] ) / particle.timeToLive;
			particle.deltaColor[ 1 ] = ( end[ 1 ] - start[ 1 ] ) / particle.timeToLive;
			particle.deltaColor[ 2 ] = ( end[ 2 ] - start[ 2 ] ) / particle.timeToLive;
			particle.deltaColor[ 3 ] = ( end[ 3 ] - start[ 3 ] ) / particle.timeToLive;
			particle.deltaSize = (particle.finishSize - particle.size) / particle.timeToLive;
	
	        if (isNaN(particle.deltaColor[ 2 ]) ) {
	            console.log("Error");
	        }
		},
		
		update: function( delta ){
	        delta = delta/1000;
			if( this.active && this.emissionRate > 0 ){
				var rate = 1 / this.emissionRate;
				this.emitCounter += delta;
				while( this.particles.length < this.maxParticles && this.emitCounter > rate ){
					this.addParticle();
					this.emitCounter -= rate;
				}
				this.elapsedTime += delta;
				if( this.duration != -1 && this.duration < this.elapsedTime ){
					this.stopParticleEmitter();
				}
			}
	
	        var that = this;
	        each(this.particles, function(currentParticle, particleIndex) {
	
				// If the current particle is alive then update it
				if( currentParticle.timeToLive > 0 ){
	
					// Calculate the new direction based on gravity
	                if (that.gravity)
					    currentParticle.direction = vector_add( currentParticle.direction, that.gravity );
	                
	                // wind speed - only horizontal
	                if (that.wind) {
	                	currentParticle.direction.x += windForce(that.wind(currentParticle),
	                											 currentParticle.direction.x,
	                											 that.area);
	                }
	
	                for (var i=0; i<that.forcePoints.length; i++) {
	                    var fp = that.forcePoints[i];
	                    var weight = fp[0];
	                    var location = fp[1];
	                    var dir = vector_sub(currentParticle.position, location);
	//                    var dist = vector_len(dir);
	//                    if (dist == 0) {
	//                        continue;
	//                    }
	                    // todo: force may depend on dist (ie. farther is weaker or other)
	                    var force = vector_multiply(dir, weight/**1/dist*/);
	                    currentParticle.direction = vector_add( currentParticle.direction, force);
	                }
					currentParticle.position.add( currentParticle.direction );
					currentParticle.timeToLive -= delta;
					
					currentParticle.size += currentParticle.deltaSize * delta;
					currentParticle.sizeSmall = ~~( ( currentParticle.size / 200 ) * currentParticle.sharpness ); //(size/2/100)
	
//	                if (isNaN(currentParticle.color[ 2 ]) ) {
//	                    console.log("Error");
//	                }
//	                if (isNaN(currentParticle.deltaColor[ 2 ]) ) {
//	                    console.log("Error");
//	                }
					// Update colors based on delta
					var r = currentParticle.color[ 0 ] += ( currentParticle.deltaColor[ 0 ] * delta );
					var g = currentParticle.color[ 1 ] += ( currentParticle.deltaColor[ 1 ] * delta );
					var b = currentParticle.color[ 2 ] += ( currentParticle.deltaColor[ 2 ] * delta );
					var a = currentParticle.color[ 3 ] += ( currentParticle.deltaColor[ 3 ] * delta );
//	                if (isNaN(a) ) {
//	                    console.log("Error");
//	                }
					// Calculate the rgba string to draw.
					var draw = [];
					draw.push("rgba(" + minmax(0,255, ~~r) );
					draw.push( minmax(0,255, ~~g));
					draw.push( minmax(0,255, ~~b));
					draw.push( minmax(0,1, a.toFixed(2)) + ")");
					currentParticle.drawColor = draw.join( "," );
					
					that.updateParticle(currentParticle);
	
				} else {
					that.particles.splice(particleIndex,1);
					that.graveyard.push(currentParticle);
				}
	        });
		},
		
		stopParticleEmitter: function(){
			this.active = false;
			this.elapsedTime = 0;
			this.emitCounter = 0;
		},
		
		renderParticles: function( context ){
	        each(this.particles, function(particle, particleIndex) {
	        	particle.render(context);
	            //context.arc(x,y, halfSize, Math.PI*2, false);
			});
		}
	}
	res.init(maxParticles, options);
	return res;
}