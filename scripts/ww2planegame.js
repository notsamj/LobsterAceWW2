// Global Constants
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 800;
const FRAME_RATE = 30;
const TICK_RATE = 128; // APPROXIMATE

// Physics
const GRAVITY = 9.81;
// NOTE: Currently collision is checking per tick meaning if something moves through an object between ticks the collision is ignored


// Global variables
var scene;
var lastTick = Date.now();

// Functions

function toRadians(degrees){
    return degrees * Math.PI / 180;
}

function tick(){
    let currentMS = Date.now();
    let timeDiff = currentMS - lastTick;
    lastTick = currentMS;
    scene.tick(timeDiff);
}

function setup() {
    //loadRotatedImages("me_309");
    scene = new Scene(CANVAS_WIDTH, CANVAS_HEIGHT);
    scene.setBackground("clouds");
    loadRotatedImages("spitfire");
    let fighterPlane = new FighterPlane("spitfire");
    fighterPlane.setCenterX(CANVAS_WIDTH / 2);
    fighterPlane.setCenterY(CANVAS_HEIGHT / 2);
    scene.addEntity(fighterPlane);

    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT); // TODO: Wrong order of parameters?
    frameRate(FRAME_RATE);
    setInterval(tick, Math.floor(1000 / TICK_RATE));
}

function draw() {
    clear();
    scene.display();
    let x = 0;
    let y = 0;
    let xVelocity = 0;
    let yVelocity = 0;
    let xAcceleration = 0;
    let yAcceleration = 0;
    if (scene.hasEntityFocused()){
        let focusedEntity = scene.getFocusedEntity();
        x = focusedEntity.getX();
        y = focusedEntity.getY();
        xVelocity = focusedEntity.getXVelocity();
        yVelocity = focusedEntity.getYVelocity();
        xAcceleration = focusedEntity.getXAcceleration();
        yAcceleration = focusedEntity.getYAcceleration();
    }
    textSize(20);
    fill("green");
    //text(`x: ${x} y: ${y}`, 10, 20);
    //text(`xV: ${xVelocity} yV: ${yVelocity}`, 10, 40);
    //text(`xA: ${xAcceleration} yA: ${yAcceleration}`, 10, 60);
    text(`x: ${x}`, 10, 20);
    text(`y: ${y}`, 10, 40);
    text(`xV: ${xVelocity}`, 10, 60);
    text(`yV: ${yVelocity}`, 10, 80);
    text(`xA: ${xAcceleration}`, 10, 100);
    text(`yA: ${yAcceleration}`, 10, 120);
}