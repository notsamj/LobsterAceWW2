// Global Constants
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 800;
const FRAME_RATE = 240;


// Global variables
var scene;

// Functions

function setup() {
    //loadRotatedImages("me_309");
    scene = new Scene(CANVAS_WIDTH, CANVAS_HEIGHT);
    loadRotatedImages("spitfire");
    let fighterPlane = new FighterPlane("spitfire");
    fighterPlane.setCenterX(CANVAS_WIDTH / 2);
    fighterPlane.setCenterY(CANVAS_HEIGHT * 2 / 3);
    scene.addEntity(fighterPlane);

    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT); // TODO: Wrong order of parameters?
    frameRate(FRAME_RATE);
}

function draw() {
    clear();
    scene.display();
}