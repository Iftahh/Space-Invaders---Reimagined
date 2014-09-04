
DBG = true; // change to false before release!

// constants - change for smaller weaker devices
WIDTH = 1024;
HEIGHT = 768;

// patterns dimensions: - smaller is more repetitions, larger is more memory consumption
sky_width = 250;  		   // width of sky pattern
ground_pattern_size = 400; // size of pattern (with&height) for ground   

WATER_FRAMES = 2//10          // number of frames in water animation - more for smoother animation but more memory and slower startup

//level map dimensions - will be scaled x3 for actual background canvas
levelWidth = 2048; // must be power of 2 for fractal mountain
levelHeight = 1000;


CELL_SIZE = 5; // may want to lower for low resolution screen
WORLD_WIDTH = CELL_SIZE * levelWidth;
WORLD_HEIGHT = CELL_SIZE * levelHeight;

/*************************************
 * These are not constants - their values may change in game
 */
// globals
water_y = levelHeight*CELL_SIZE-50;  // start 50px above bottom of map 
wind = 1.5;


//var fcurCameraX, fcurCameraY; //  fcur-camera defines what is being viewed - needed to be float in order not to lock
OffsetX = OffsetY = 0; //  is the integer round of fcur - needed to be int in order to avoid fuzzy drawimage for images

