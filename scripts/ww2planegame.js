// Global variables
var scene;
var menuManager;
var startTime = null;
var numTicks = 0;
var setupDone = false;
var frameCounter = new FrameRateCounter(fileData["constants"]["FRAME_RATE"]);
var frameLock = new CooldownLock(Math.floor(1/fileData["constants"]["FRAME_RATE"]));

// Functions

function tick(){
    let expectedTicks = Math.floor(((Date.now() - startTime) / fileData["constants"]["MS_BETWEEN_TICKS"]));
    while (numTicks < expectedTicks){
        scene.tick(fileData["constants"]["MS_BETWEEN_TICKS"]);
        numTicks += 1;
    }
    if (frameLock.isReady()){
        frameLock.lock();
        draw();
        frameCounter.countFrame();
    }
}

async function setup() {
    // Load Images TODO: Make this way cleaner
    await loadPlanes();
    await loadToImages("radar_outline");
    await loadToImages("radar_blip");
    await loadToImages("radar_blip_friendly");
    await loadToImages(fileData["bullet_data"]["picture"]);
    await loadToImages(fileData["background"]["ground"]["picture"]);
    await loadToImages(fileData["background"]["above_ground"]["picture"]);
    await loadToImages(fileData["background"]["sky"]["picture"]);

    // Create Canvas
    createCanvas(fileData["constants"]["CANVAS_WIDTH"], fileData["constants"]["CANVAS_HEIGHT"]);
    frameRate(0);

    // Set up scene & menus
    scene = new PlaneGameScene(fileData["constants"]["CANVAS_WIDTH"], fileData["constants"]["CANVAS_HEIGHT"]);
    menuManager = new MenuManager(fileData["constants"]["CANVAS_WIDTH"], fileData["constants"]["CANVAS_HEIGHT"]);
    MenuManager.setupClickListener();
    
    
    /*let fighterPlane = new HumanFighterPlane("hawker_sea_fury");
    //fighterPlane.speed = 0;
    //fighterPlane.throttle = 1;
    fighterPlane.health = 9999;
    //let fighterPlane = new BotFighterPlane("spitfire");
    fighterPlane.setCenterX(10000);
    fighterPlane.setCenterY(10000);

    scene.addEntity(fighterPlane);*/

    let spectatorCamera = new SpectatorCamera();
    scene.addEntity(spectatorCamera);

    // Testing
    
    /*
    let botFighterPlane1 = new BotFighterPlane("spitfire", 0, true);
    botFighterPlane1.setCenterX(10000);
    botFighterPlane1.setCenterY(5000);
    //botFighterPlane1.throttle = 1;
   //botFighterPlane1.speed = 0;
    botFighterPlane1.health = 50000;
    botFighterPlane1.angle = 275;
    scene.addEntity(botFighterPlane1);
    */
    

    createBots();

    //scene.setFocusedEntity(Math.min(extraCount * 2, 0));
    
    // Prepare to start running
    startTime = Date.now();
    setInterval(tick, Math.floor(1000 / (fileData["constants"]["TICK_RATE"])));
    setupDone = true;
}

function draw() {
    clear();
    if (!setupDone){
        textSize(100);
        fill("green");
        text("Loading...", 200, 200);
        return; 
    }
    menuManager.display();
    scene.display();
}

function createBots(){
    let focus = !scene.hasEntityFocused();
    let allyX = fileData["test_bots"]["ally_spawn_x"];
    let allyY = fileData["test_bots"]["ally_spawn_y"];

    let axisX = fileData["test_bots"]["axis_spawn_x"];
    let axisY = fileData["test_bots"]["axis_spawn_y"];
    let total = 0;
    for (let botClass of fileData["test_bots"]["active_bots"]){
        total += botClass["count"];
        let x = (countryToAlliance(fileData["plane_data"][botClass["plane"]]["country"] == "Allies")) ? allyX : axisX; 
        let y = (countryToAlliance(fileData["plane_data"][botClass["plane"]]["country"] == "Allies")) ? allyY : axisY;
        for (let i = 0; i < botClass["count"]; i++){
            let aX = x + randomFloatBetween(-1 * fileData["test_bots"]["spawn_offset"], fileData["test_bots"]["spawn_offset"]);
            let aY = y + randomFloatBetween(-1 * fileData["test_bots"]["spawn_offset"], fileData["test_bots"]["spawn_offset"]);
            createBot(botClass["plane"], aX, aY);
        }
    }
    if (focus){
        scene.setFocusedEntity(randomNumberInclusive(0, total-1));
    }
}

function createBot(model, x, y){
    //console.log(model, x, y)
    let botFighterPlane = BiasedBotFighterPlane.createBiasedPlane(model);
    botFighterPlane.setCenterX(x);
    botFighterPlane.setCenterY(y);
    scene.addEntity(botFighterPlane);
}

function countAlliance(allianceName){
    let count = 0;
    for (let entity of scene.getEntities()){
        if (entity instanceof FighterPlane && planeModelToAlliance(entity.getPlaneClass()) == allianceName){
            count++;
        }
    }
    return count;
}