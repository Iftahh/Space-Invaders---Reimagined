
DBG = true; // change to false before release!

// constants - change for smaller weaker devices
WIDTH = 1024;
HEIGHT = 768;

// patterns dimensions: - smaller is more repetitions, larger is more memory consumption
sky_width = 250;  		   // width of sky pattern
ground_pattern_size = 400; // size of pattern (with&height) for ground   


//build level map
var LevelW = 2048;
var LevelH = 1000;



// globals
water_y = HEIGHT-50;  // 50px above screen
wind = 1.5;


//var fcurCameraX, fcurCameraY; //  fcur-camera defines what is being viewed - needed to be float in order not to lock
var OffsetX = OffsetY = 0; //  is the integer round of fcur - needed to be int in order to avoid fuzzy drawimage for images

