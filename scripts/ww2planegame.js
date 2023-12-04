// Global Constants
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 927;
const FRAME_RATE = 30;
const TICK_RATE = 64; // APPROXIMATE

// Physics
const GRAVITY = 9.81;
// NOTE: Currently collision is checking per tick meaning if something moves through an object between ticks the collision is ignored


// Global variables
var scene;
var lastTick = Date.now();
var setupDone = false;
var iLF = new InfiniteLoopFinder(1000000);

// Functions

function tick(){
    let currentMS = Date.now();
    let timeDiff = currentMS - lastTick;
    lastTick = currentMS;
    scene.tick(timeDiff);
}

async function setup() {
    await loadPlanes();
    await loadToImages("radar_outline");
    await loadToImages("radar_blip");
    await loadToImages("radar_blip_friendly");
    await loadToImages(fileData["bullet_data"]["picture"]);
    await loadToImages(fileData["background"]["ground"]["picture"]);
    await loadToImages(fileData["background"]["above_ground"]["picture"]);
    await loadToImages(fileData["background"]["sky"]["picture"]);
    scene = new Scene(CANVAS_WIDTH, CANVAS_HEIGHT);
    
    let fighterPlane = new HumanFighterPlane("a6m_zero");
    //fighterPlane.speed = 0;
    //fighterPlane.throttle = 1;
    fighterPlane.health = 9999;
    //let fighterPlane = new BotFighterPlane("spitfire");
    fighterPlane.setCenterX(10000);
    fighterPlane.setCenterY(10000);
    scene.addEntity(fighterPlane);

    // Testing
    
    /*let botFighterPlane1 = new BotFighterPlane("spitfire");
    botFighterPlane1.setCenterX(1000);
    botFighterPlane1.setCenterY(1900);
    scene.addEntity(botFighterPlane1);
    //scene.setFocusedEntity(botFighterPlane1.getID())*/
    
    

    
    let botX = 5000;
    let botY = 10000;
    let extraCount = 0;
    let extraCount2 = 0;
    let extraCount3 = 5;
    let extraCount4 = 5;
    let extraType = "me_bf_109";
    for (let i = 0; i < extraCount; i++){
        let newFighterPlane = new BotFighterPlane(extraType);
        newFighterPlane.setCenterX(botX + 10000);
        newFighterPlane.setCenterY(botY + 200 * (i + 1));
        newFighterPlane.facingRight = false;
        scene.addEntity(newFighterPlane);
    }

    let extraType2 = "a6m_zero";
    for (let i = 0; i < extraCount2; i++){
        let newFighterPlane = new BotFighterPlane(extraType2);
        newFighterPlane.setCenterX(botX + 10000);
        newFighterPlane.setCenterY(botY + 200 * (i + 1) + 100);
        newFighterPlane.facingRight = false;
        scene.addEntity(newFighterPlane);
    }

    let extraType3 = "republic_p_47";
    for (let i = 0; i < extraCount3; i++){
        let newFighterPlane = new BotFighterPlane(extraType3);
        newFighterPlane.setCenterX(botX + 1000);
        newFighterPlane.setCenterY(botY + 200 * (i + 1));
        scene.addEntity(newFighterPlane);
    }

    let extraType4 = "spitfire";
    for (let i = 0; i < extraCount4; i++){
        let newFighterPlane = new BotFighterPlane(extraType4);
        newFighterPlane.setCenterX(botX + 1000);
        newFighterPlane.setCenterY(botY + 200 * (i + 1) + 100);
        scene.addEntity(newFighterPlane);
    }
    //scene.setFocusedEntity(1);
    

    //scene.setFocusedEntity(Math.min(extraCount * 2, 0));
    
    
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT); // TODO: Wrong order of parameters?
    frameRate(FRAME_RATE);
    setInterval(tick, Math.floor(1000 / TICK_RATE));
    setupDone = true;
}

function draw() {
    if (!setupDone){
        return;
    }
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
        if (focusedEntity instanceof HumanFighterPlane){
            focusedEntity.getRadar().display();
        }
    }
    textSize(20);
    fill("green");
    text(`x: ${x}`, 10, 20);
    text(`y: ${y}`, 10, 40);
    text(`Speed: ${planeSpeed}`, 10, 60);
    text(`Throttle: ${throttle}`, 10, 80);
}