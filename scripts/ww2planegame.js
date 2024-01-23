// Global variables
const MAX_RUNNING_LATE = 500;
var scene;
var menuManager;
var setupDone = false;
var frameCounter = new FrameRateCounter(FILE_DATA["constants"]["FRAME_RATE"]);
var frameLock = new CooldownLock(Math.floor(1/FILE_DATA["constants"]["FRAME_RATE"]));
var activeGameMode = null;
var loadedPercent = 0;
var debug = false;
var mainTickLock = new Lock();
var runningTicksBehind = 0;
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
        if (activeGameMode != null){
            await activeGameMode.tick();
        }
    }
    if (frameLock.isReady()){
        frameLock.lock();
        draw();
        frameCounter.countFrame();
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
    for (let imageName of FILE_DATA["extra_images_to_load"]){
        await loadToImages(imageName);
    }

    // Load all the smoke images
    for (let imageName of FILE_DATA["smoke_images"]){
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
    tickInterval = setInterval(tick, Math.floor(1000 / (FILE_DATA["constants"]["TICK_RATE"])));

    await loadPlanes();
    await loadExtraImages();


    // Set up scene & menus
    scene = new PlaneGameScene(getScreenWidth(), getScreenHeight());
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