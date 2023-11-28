// Global Constants
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 800;
const FRAME_RATE = 30;
const TICK_RATE = 64; // APPROXIMATE

// Physics
const GRAVITY = 9.81;
// NOTE: Currently collision is checking per tick meaning if something moves through an object between ticks the collision is ignored


// Global variables
var scene;
var lastTick = Date.now();

// Functions

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
    loadRotatedImages("a6m_zero");
    let fighterPlane = new HumanFighterPlane("a6m_zero");
    //let fighterPlane = new BotFighterPlane("spitfire");
    fighterPlane.setCenterX(CANVAS_WIDTH / 2 * 3);
    fighterPlane.setCenterY(CANVAS_HEIGHT / 2);
    scene.addEntity(fighterPlane);

    // Testing
    let botFighterPlane = new BotFighterPlane("spitfire");
    botFighterPlane.setCenterX(CANVAS_WIDTH / 2);
    botFighterPlane.setCenterY(CANVAS_HEIGHT / 2);
    scene.addEntity(botFighterPlane);

    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT); // TODO: Wrong order of parameters?
    frameRate(FRAME_RATE);
    setInterval(tick, Math.floor(1000 / TICK_RATE));
}

function draw() {
    clear();
    scene.display();
    let x = 0;
    let y = 0;
    let planeSpeed = 0;
    let throttle = 0;
    if (scene.hasEntityFocused()){
        let focusedEntity = scene.getFocusedEntity();
        x = focusedEntity.getX();
        y = focusedEntity.getY();
        planeSpeed = focusedEntity.getSpeed();
        throttle = focusedEntity.getThrottle();
    }
    textSize(20);
    fill("green");
    text(`x: ${x}`, 10, 20);
    text(`y: ${y}`, 10, 40);
    text(`Speed: ${planeSpeed}`, 10, 60);
    text(`Throttle: ${throttle}`, 10, 80);
}