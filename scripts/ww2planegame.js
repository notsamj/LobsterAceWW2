// Global Variables & Constants
const MAX_RUNNING_LATE = 500;
var scene;
var menuManager;
var setupDone = false;
var programOver = false;
var FRAME_COUNTER = new FrameRateCounter(PROGRAM_DATA["settings"]["frame_rate"]);
var activeGameMode = null;
var loadedPercent = 0;
var debug = false;
var mainTickLock = new Lock();
var runningTicksBehind = 0;
const USER_INPUT_MANAGER = new UserInputManager();
const SOUND_MANAGER = new SoundManager();
var performanceTimer = new PerformanceTimer();
const CLOUD_MANAGER = new CloudManager();
const HEADS_UP_DISPLAY = new HUD();
const MAIL_SERVICE = new MailService();
const SERVER_CONNECTION = new ServerConnection();
const PROGRAM_TESTER = new ProgramTester();
USER_INPUT_MANAGER.register("bomber_shoot_input", "mousedown", (event) => { return true; });
USER_INPUT_MANAGER.register("bomber_shoot_input", "mouseup", (event) => { return true; }, false);
USER_INPUT_MANAGER.register("t", "keydown", (event) => { return event.keyCode == 84; }, true)
USER_INPUT_MANAGER.register("t", "keyup", (event) => { return event.keyCode == 84; }, false)

USER_INPUT_MANAGER.registerTickedAggregator("w", "keydown", (event) => { return event.keyCode == 87; }, "keyup", (event) => { return event.keyCode == 87; });
USER_INPUT_MANAGER.registerTickedAggregator("s", "keydown", (event) => { return event.keyCode == 83; }, "keyup", (event) => { return event.keyCode == 83; });

// Functions

/*
    Method Name: tick
    Method Parameters:
        forced:
            True if not called by requestAnimationFrame
    Method Description: Makes things happen within a tick
    Method Return: void
*/
async function tick(forced=false){
    // Safety incase an error occurs stop running
    if (programOver){ return; }
    USER_INPUT_MANAGER.tick();
    // Fix num ticks if running a huge defecit
    if (activeGameMode != null && activeGameMode.getNumTicks() < activeGameMode.getExpectedTicks() - PROGRAM_DATA["settings"]["max_tick_deficit"]){ activeGameMode.correctTicks(); }
    if (mainTickLock.notReady()){
        runningTicksBehind++;
        console.log("Main tick loop is running %d ticks behind.", runningTicksBehind)
        if (runningTicksBehind > MAX_RUNNING_LATE){
        }
        return;
    }
    mainTickLock.lock();
    if (document.hidden){
        menuManager.lostFocus();
    }
    // Play game
    if (activeGameMode != null){
        //console.log(activeGameMode.getExpectedTicks() - activeGameMode.getNumTicks)
        await activeGameMode.tick(PROGRAM_DATA["settings"]["ms_between_ticks"]);
        await activeGameMode.tickInProgressLock.awaitUnlock(true); // TODO: Clean up with getter
    }

    // Draw frame
    if (FRAME_COUNTER.ready()){
        FRAME_COUNTER.countFrame();
        draw();
    }
    if (activeGameMode != null){
        activeGameMode.tickInProgressLock.unlock(); // TODO: Clean up with getter
    }
    mainTickLock.unlock();
    // Try and tick immediately (incase need to catch up if it doesn't need it catch up then no problem)
    if (!forced){
        tick(true);
    }else{
        requestAnimationFrame(tick);
    }
}

/*
    Method Name: loadExtraImages
    Method Parameters: None
    Method Description: Loads many images needed for the program.
    Method Return: void
*/
async function loadExtraImages(){
    // Load generic extra images
    for (let imageName of PROGRAM_DATA["extra_images_to_load"]){
        await loadToImages(imageName);
    }

    // Load all the smoke images
    for (let imageName of PROGRAM_DATA["smoke_images"]){
        await loadToImages(imageName);
    }
}

/*
    Method Name: setup
    Method Parameters: None
    Method Description: Prepares the program.
    Method Return: void
*/
async function setup() {
    // Create Canvas
    createCanvas(getScreenWidth(), getScreenHeight());
    window.onresize = function(event) {
        resizeCanvas(getScreenWidth(), getScreenHeight());
    };
    frameRate(0);
    window.addEventListener("error", (event) => {
        console.log(event);
        programOver = true;
    });

    // Prevent auto page scrolling
    document.addEventListener("keydown", (event) => {
        if (event.keyCode === 32 || event.keyCode === 40){
            event.preventDefault();
        }
    });

    // Prepare to start running
    startTime = Date.now();
    requestAnimationFrame(tick);

    await loadPlanes();
    await loadExtraImages();

    // Prepare the hud elements that I want
    HEADS_UP_DISPLAY.updateElement("FPS", 0);
    HEADS_UP_DISPLAY.updateElement("Entities", 0);
    HEADS_UP_DISPLAY.updateElement("ID", null);
    HEADS_UP_DISPLAY.updateElement("Health", 0);
    HEADS_UP_DISPLAY.updateElement("Throttle", 0);
    HEADS_UP_DISPLAY.updateElement("Speed", 0);
    HEADS_UP_DISPLAY.updateElement("x", 0);
    HEADS_UP_DISPLAY.updateElement("y", 0);
    HEADS_UP_DISPLAY.updateElement("Allied Planes", 0);
    HEADS_UP_DISPLAY.updateElement("Axis Planes", 0);


    // Set up scene & menus
    scene = new PlaneGameScene(SOUND_MANAGER, true);
    scene.enableDisplay()
    menuManager = new MenuManager(getScreenWidth(), getScreenHeight());
    MenuManager.setupClickListener();

    setupDone = true;
}

/*
    Method Name: draw
    Method Parameters: None
    Method Description: Draws everything needed on the canvas.
    Method Return: void
*/
function draw() {
    clear();
    if (!setupDone){
        textSize(200);
        fill("green");
        text(`Loading: ${loadedPercent}%`, 200, 200);
        return;
    }
    scene.display();
    if (activeGameMode != null){
        activeGameMode.display();
    }
    menuManager.display();
}
