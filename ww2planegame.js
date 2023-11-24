// Global Constants
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 800;
const FRAME_RATE = 240;


// Global variables
var fighterPlane = null;


// Functions

function setup() {
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT); // TODO: Wrong order of parameters?
    frameRate(FRAME_RATE);
    fighterPlane = new LiveImage("images/me_309_small.png", CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
}

function draw() {
    if (fighterPlane == null){ return; }
    clear();
    fighterPlane.display();
}