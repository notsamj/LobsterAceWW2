// Global Variables & Constants
const MAX_RUNNING_LATE = 500;
var scene;
var menuManager;
var setupDone = false;
var frameCounter = new FrameRateCounter(PROGRAM_DATA["settings"]["frame_rate"]);
var frameLock = new CooldownLock(Math.floor(1/PROGRAM_DATA["settings"]["frame_rate"]));
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
const SERVER_CONNECTION = new ServerConnection();
USER_INPUT_MANAGER.register("bomber_shoot_input", "mousedown", (event) => { return true; });
USER_INPUT_MANAGER.register("bomber_shoot_input", "mouseup", (event) => { return true; }, false);
USER_INPUT_MANAGER.register("t", "keydown", (event) => { return event.keyCode == 84; }, true)
USER_INPUT_MANAGER.register("t", "keyup", (event) => { return event.keyCode == 84; }, false)
var tickInterval;
// Functions

/*
    Method Name: tick
    Method Parameters: None
    Method Description: Makes things happen within a tick
    Method Return: void
*/
async function tick(){
    if (mainTickLock.notReady()){
        runningTicksBehind++;
        console.log("Main tick loop is running %d ticks behind.", runningTicksBehind)
        if (runningTicksBehind > MAX_RUNNING_LATE){
            clearInterval(tickInterval);
        }
        return;
    }
    mainTickLock.lock();
    if (setupDone){
        if (document.hidden){
            menuManager.lostFocus();
        }
    }
    if (frameLock.isReady()){
        if (activeGameMode != null){
            // TODO: Clean up with getter
            await activeGameMode.tickInProgressLock.awaitUnlock(true);
        }
        frameLock.lock();
        draw();
        frameCounter.countFrame();
        if (activeGameMode != null){
            activeGameMode.tickInProgressLock.unlock();
        }
    }
    mainTickLock.unlock();
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

    // Prevent auto page scrolling
    document.addEventListener("keydown", (event) => {
        if (event.keyCode === 32 || event.keyCode === 40){
            event.preventDefault();
        }
    });

    // Prepare to start running
    startTime = Date.now();
    //tickInterval = setInterval(tick, PROGRAM_DATA["settings"]["ms_between_ticks"]);
    tickInterval = setInterval(tick, 1);

    await loadPlanes();
    await loadExtraImages();


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
