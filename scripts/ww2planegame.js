// Global Constants
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 926;
const FRAME_RATE = 30;
const TICK_RATE = 64; // APPROXIMATE

// Physics
const GRAVITY = 9.81;
// NOTE: Currently collision is checking per tick meaning if something moves through an object between ticks the collision is ignored


// Global variables
var scene;
var lastTick = Date.now();
//var setupDone = false;

// Functions

function tick(){
    let currentMS = Date.now();
    let timeDiff = currentMS - lastTick;
    lastTick = currentMS;
    scene.tick(timeDiff);
}

function loadPlanes(){
    for (const [planeName, planeDetails] of Object.entries(fileData["plane_data"])) {
        loadRotatedImages(planeName);
    }
}

function setup() {
    loadPlanes();
    console.log("After load planes...")
    scene = new Scene(CANVAS_WIDTH, CANVAS_HEIGHT);
    scene.setBackground("clouds");
    let fighterPlane = new HumanFighterPlane("republic_p_47");
    //let fighterPlane = new BotFighterPlane("spitfire");
    fighterPlane.setCenterX(11000);
    fighterPlane.setCenterY(11000);
    scene.addEntity(fighterPlane);

    // Testing
    
    /*let botFighterPlane1 = new BotFighterPlane("republic_p_47");
    botFighterPlane1.setCenterX(11000);
    botFighterPlane1.setCenterY(111000);
    scene.addEntity(botFighterPlane1);
    
    let botFighterPlane2 = new BotFighterPlane("a6m_zero");
    botFighterPlane2.setCenterX(10000);
    botFighterPlane2.setCenterY(110000);
    scene.addEntity(botFighterPlane2);

    let botFighterPlane3 = new BotFighterPlane("spitfire");
    botFighterPlane3.setCenterX(12000);
    botFighterPlane3.setCenterY(110000);
    scene.addEntity(botFighterPlane3);
    

    let botFighterPlane4 = new BotFighterPlane("me_bf_109");
    botFighterPlane4.setCenterX(10000);
    botFighterPlane4.setCenterY(112000);
    scene.addEntity(botFighterPlane4);

    let botFighterPlane5 = new BotFighterPlane("republic_p_47");
    botFighterPlane5.setCenterX(12000);
    botFighterPlane5.setCenterY(112000);
    scene.addEntity(botFighterPlane5);

    let botFighterPlane6 = new BotFighterPlane("spitfire");
    botFighterPlane6.setCenterX(12000);
    botFighterPlane6.setCenterY(112000);
    scene.addEntity(botFighterPlane6);*/
    
    
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT); // TODO: Wrong order of parameters?
    frameRate(FRAME_RATE);
    setInterval(tick, Math.floor(1000 / TICK_RATE));
    //setupDone = true;
}

function draw() {
    /*if (!setupDone){
        return;
    }*/
    clear();
    scene.display();
    let x = 0;
    let y = 0;
    let planeSpeed = 0;
    let throttle = 0;
    if (scene.hasEntityFocused()){
        let focusedEntity = scene.getFocusedEntity();
        if (!(focusedEntity instanceof FighterPlane)){
            return;
        }
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