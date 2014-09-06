
DBG = true; // change to false before release!


// patterns dimensions: - smaller is more repetitions, larger is more memory consumption
sky_width = 250;  		   // width of sky pattern
ground_pattern_size = 400; // size of pattern (with&height) for ground   
WATER_FRAMES = 10;         // number of frames in water animation - more for smoother animation but more memory and slower startup
WAVE_PASSES = 8;		   // more passes - smoother waves, more cpu  		

//level map dimensions - will be scaled xCELL_SIZE for actual background canvas
levelWidth = 2048; // must be power of 2 for fractal mountain
levelHeight = 1000;

// These will change below to fit in screen
CELL_SIZE = 7;
WIDTH = 10e6;
HEIGHT = 0;


if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
//if (true) {
	// change to fit slower, less memory devices
	sky_width = 200;
	ground_pattern_size = 300;
	WATER_FRAMES = 5;
	WAVE_PASSES = 4;
}

// Lower the resolution until it fits on screen -
// show the same number of cells on screen, but make them smaller
// assuming landscape mode
while ((HEIGHT > innerHeight || WIDTH > innerWidth) && CELL_SIZE > 3) {
	CELL_SIZE--;
	SIZE_FACTOR = CELL_SIZE/7;
	WIDTH = 1715 * SIZE_FACTOR | 0;   
	HEIGHT = 1400 * SIZE_FACTOR | 0;
}

WORLD_WIDTH = CELL_SIZE * levelWidth;
WORLD_HEIGHT = CELL_SIZE * levelHeight;

/*************************************
 * These are not constants - their values may change in game
 */
// globals
water_y = WORLD_HEIGHT-150;  // start above bottom of map 
wind = 1.5;


//var fcurCameraX, fcurCameraY; //  fcur-camera defines what is being viewed - needed to be float in order not to lock
OffsetX = OffsetY = 0; //  is the integer round of fcur - needed to be int in order to avoid fuzzy drawimage for images

