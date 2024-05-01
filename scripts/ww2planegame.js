// Global Variables & Constants
var programOver = false;
var debug = false;
var runningTicksBehind = 0;
var mouseX = 0;
var mouseY = 0;

const ZOOM_MONITOR = {"button": null, "start_time_ms": null};

const IMAGES = {};

const MAX_RUNNING_LATE = 500;

const FRAME_COUNTER = new FrameRateCounter(PROGRAM_DATA["settings"]["frame_rate"]);
const MAIN_TICK_LOCK = new Lock();
const MENU_MANAGER = new MenuManager();
const USER_INPUT_MANAGER = new UserInputManager();
const SOUND_MANAGER = new SoundManager();
const PERFORMANCE_TIMER = new PerformanceTimer();
const HEADS_UP_DISPLAY = new HUD();
const MAIL_SERVICE = new MailService();
const SERVER_CONNECTION = new ServerConnection();
const PROGRAM_TESTER = new ProgramTester();
const GAMEMODE_MANAGER = new GamemodeManager();
const LOCAL_EVENT_HANDLER = new NSEventHandler();

// Register inputs
USER_INPUT_MANAGER.register("option_slider_grab", "mousedown", (event) => { return true; });
USER_INPUT_MANAGER.register("option_slider_grab", "mouseup", (event) => { return true; }, false);

USER_INPUT_MANAGER.register("bomber_shoot_input", "mousedown", (event) => { return true; });
USER_INPUT_MANAGER.register("bomber_shoot_input", "mouseup", (event) => { return true; }, false);

USER_INPUT_MANAGER.register("t", "keydown", (event) => { return event.keyCode == 84; }, true);
USER_INPUT_MANAGER.register("t", "keyup", (event) => { return event.keyCode == 84; }, false);

USER_INPUT_MANAGER.register("plane_turn_left", "keydown", (event) => { return event.keyCode == 65; }, true);
USER_INPUT_MANAGER.register("plane_turn_left", "keyup", (event) => { return event.keyCode == 65; }, false);

USER_INPUT_MANAGER.register("plane_turn_right", "keydown", (event) => { return event.keyCode == 68; }, true);
USER_INPUT_MANAGER.register("plane_turn_right", "keyup", (event) => { return event.keyCode == 68; }, false);

USER_INPUT_MANAGER.register("plane_throttle_down", "keydown", (event) => { return event.keyCode == 70; }, true);
USER_INPUT_MANAGER.register("plane_throttle_down", "keyup", (event) => { return event.keyCode == 70; }, false);

USER_INPUT_MANAGER.register("plane_throttle_up", "keydown", (event) => { return event.keyCode == 82; }, true);
USER_INPUT_MANAGER.register("plane_throttle_up", "keyup", (event) => { return event.keyCode == 82; }, false);

USER_INPUT_MANAGER.register("fighter_plane_shooting", "keydown", (event) => { return event.keyCode == 32; }, true);
USER_INPUT_MANAGER.register("fighter_plane_shooting", "keyup", (event) => { return event.keyCode == 32; }, false);

USER_INPUT_MANAGER.register("spectator_follow", "keydown", (event) => { return event.keyCode == 70; }, true);
USER_INPUT_MANAGER.register("spectator_follow", "keyup", (event) => { return event.keyCode == 70; }, false);

USER_INPUT_MANAGER.register("spectator_spectate_left", "keydown", (event) => { return event.keyCode == 37; }, true);
USER_INPUT_MANAGER.register("spectator_spectate_left", "keyup", (event) => { return event.keyCode == 37; }, false);

USER_INPUT_MANAGER.register("spectator_spectate_right", "keydown", (event) => { return event.keyCode == 39; }, true);
USER_INPUT_MANAGER.register("spectator_spectate_right", "keyup", (event) => { return event.keyCode == 39; }, false);

USER_INPUT_MANAGER.register("spectator_spectate_up", "keydown", (event) => { return event.keyCode == 38; }, true);
USER_INPUT_MANAGER.register("spectator_spectate_up", "keyup", (event) => { return event.keyCode == 38; }, false);

USER_INPUT_MANAGER.register("spectator_spectate_down", "keydown", (event) => { return event.keyCode == 40; }, true);
USER_INPUT_MANAGER.register("spectator_spectate_down", "keyup", (event) => { return event.keyCode == 40; }, false);

USER_INPUT_MANAGER.register("spectator_spectate_down", "keydown", (event) => { return event.keyCode == 40; }, true);
USER_INPUT_MANAGER.register("spectator_spectate_down", "keyup", (event) => { return event.keyCode == 40; }, false);

USER_INPUT_MANAGER.register("radar_zoom_in", "keydown", (event) => { return event.keyCode == 61; }, true);
USER_INPUT_MANAGER.register("radar_zoom_in", "keyup", (event) => { return event.keyCode == 61; }, false);

USER_INPUT_MANAGER.register("radar_zoom_out", "keydown", (event) => { return event.keyCode == 173; }, true);
USER_INPUT_MANAGER.register("radar_zoom_out", "keyup", (event) => { return event.keyCode == 173; }, false);

USER_INPUT_MANAGER.register("1/8zoomhold", "keydown", (event) => { return event.keyCode == 49; }, true);
USER_INPUT_MANAGER.register("1/8zoomhold", "keyup", (event) => { return event.keyCode == 49; }, false);

USER_INPUT_MANAGER.register("1/4zoomhold", "keydown", (event) => { return event.keyCode == 50; }, true);
USER_INPUT_MANAGER.register("1/4zoomhold", "keyup", (event) => { return event.keyCode == 50; }, false);

USER_INPUT_MANAGER.register("1/2zoomhold", "keydown", (event) => { return event.keyCode == 51; }, true);;
USER_INPUT_MANAGER.register("1/2zoomhold", "keyup", (event) => { return event.keyCode == 51; }, false);

USER_INPUT_MANAGER.register("1zoomhold", "keydown", (event) => { return event.keyCode == 52; }, true);
USER_INPUT_MANAGER.register("1zoomhold", "keyup", (event) => { return event.keyCode == 52; }, false);

USER_INPUT_MANAGER.register("2zoomhold", "keydown", (event) => { return event.keyCode == 53; }, true);
USER_INPUT_MANAGER.register("2zoomhold", "keyup", (event) => { return event.keyCode == 53; }, false);

USER_INPUT_MANAGER.registerTickedAggregator("w", "keydown", (event) => { return event.keyCode == 87; }, "keyup", (event) => { return event.keyCode == 87; });
USER_INPUT_MANAGER.registerTickedAggregator("s", "keydown", (event) => { return event.keyCode == 83; }, "keyup", (event) => { return event.keyCode == 83; });

// Functions

/*
    Method Name: tick
    Method Parameters:
        timeSinceLastTickMS:
            The time since the last animation frame
    Method Description: Makes things happen within a tick
    Method Return: void
*/
async function tick(timeSinceLastTickMS){
    // Safety incase an error occurs stop running
    if (programOver){ return; }

    // Tick user input manager
    USER_INPUT_MANAGER.tick();

    // Check for issues with main tick lock
    if (MAIN_TICK_LOCK.notReady()){
        runningTicksBehind++;
        console.log("Main tick loop is running %d ticks behind.", runningTicksBehind)
        if (runningTicksBehind > MAX_RUNNING_LATE){
            programOver = true;
            return;
        }
    }
    MAIN_TICK_LOCK.lock();

    // Once within main tick lock, set zoom
    setGameZoom();

    if (document.hidden){
        MENU_MANAGER.lostFocus();
    }
    // Play game
    await GAMEMODE_MANAGER.tick();
    
    // Draw frame
    if (FRAME_COUNTER.ready()){
        FRAME_COUNTER.countFrame();
        let canvas = document.getElementById("canvas");
        // Update Canvas size if applicable
        if (getScreenWidth() != canvas.width || getScreenHeight() != canvas.height){
            canvas.width = getScreenWidth();
            canvas.height = getScreenHeight();
        }
        draw();
    }
    MAIN_TICK_LOCK.unlock();
    // Try and tick immediately (incase need to catch up if it doesn't need it catch up then no problem)
    requestAnimationFrame(tick);
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
}

/*
    Method Name: setGameZoom
    Method Parameters: None
    Method Description: Changes the game zoom
    Method Return: void
*/
function setGameZoom(){
    let buttonCount = 0;
    let eighth = USER_INPUT_MANAGER.isActivated("1/8zoomhold");
    let quarter = USER_INPUT_MANAGER.isActivated("1/4zoomhold");
    let half = USER_INPUT_MANAGER.isActivated("1/2zoomhold");
    let whole = USER_INPUT_MANAGER.isActivated("1zoomhold");
    let two = USER_INPUT_MANAGER.isActivated("2zoomhold");
    buttonCount += eighth ? 1 : 0;
    buttonCount += quarter ? 1 : 0;
    buttonCount += half ? 1 : 0;
    buttonCount += whole ? 1 : 0;
    buttonCount += two ? 1 : 0;
    // Anything other than 1 is treated the same
    if (buttonCount != 1){
        // Ignore if button is null
        if (ZOOM_MONITOR["button"] == null){
            gameZoom = PROGRAM_DATA["settings"]["game_zoom"];
            return;
        }
        let timePassed = Date.now() - ZOOM_MONITOR["start_time_ms"];
        // If the button was pressed for a short amount of time then switch gamezoom to recorded
        if (timePassed < PROGRAM_DATA["controls"]["approximate_zoom_peek_time_ms"]){
            PROGRAM_DATA["settings"]["game_zoom"] = gameZoom;
        }else{ // If not taking the button then reset zoom
            gameZoom = PROGRAM_DATA["settings"]["game_zoom"];
        }
        // Reset zoom monitor
        ZOOM_MONITOR["button"] = null;
    }else{ // 1 button pressed
        let pressedButton;
        // Determine which button
        if (eighth){
            pressedButton = 1/8;
        }else if (quarter){
            pressedButton = 1/4;
        }else if (half){
            pressedButton = 1/2;
        }else if (whole){
            pressedButton = 1;
        }else{ // two
            pressedButton = 2;
        }
        // If changed which 1 button is pressed
        if (ZOOM_MONITOR["button"] != pressedButton){
            ZOOM_MONITOR["button"] = pressedButton;
            ZOOM_MONITOR["start_time_ms"] = Date.now();
            gameZoom = pressedButton;
        }
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
    let canvasDOM = document.getElementById("canvas");
    canvasDOM.width = getScreenWidth();
    canvasDOM.height = getScreenHeight();
    // Set global variable drawingContext
    drawingContext = canvasDOM.getContext("2d");

    window.onerror = (event) => {
        programOver = true;
    };

    window.onmousemove = (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    }

    // Prevent auto page scrolling
    document.addEventListener("keydown", (event) => {
        if (event.keyCode === 32 || event.keyCode === 40){
            event.preventDefault();
        }
    });

    await loadPlanes();
    await loadExtraImages();

    // Prepare the hud elements that I want
    HEADS_UP_DISPLAY.updateElement("FPS", 0);
    HEADS_UP_DISPLAY.updateElement("Game Zoom", "1x");
    HEADS_UP_DISPLAY.updateElement("Entities", 0);
    HEADS_UP_DISPLAY.updateElement("ID", null);
    HEADS_UP_DISPLAY.updateElement("Health", 0);
    HEADS_UP_DISPLAY.updateElement("Throttle", 0);
    HEADS_UP_DISPLAY.updateElement("Speed", 0);
    HEADS_UP_DISPLAY.updateElement("x", 0);
    HEADS_UP_DISPLAY.updateElement("y", 0);
    HEADS_UP_DISPLAY.updateElement("Allied Planes", 0);
    HEADS_UP_DISPLAY.updateElement("Axis Planes", 0);


    // Set up menu manager
    MENU_MANAGER.setup();
    MenuManager.setupClickListener();

    // Prepare to start running
    requestAnimationFrame(tick);
}

/*
    Method Name: draw
    Method Parameters: None
    Method Description: Draws everything needed on the canvas.
    Method Return: void
*/
function draw() {
    if (GAMEMODE_MANAGER.hasActiveGamemode()){
        GAMEMODE_MANAGER.getActiveGamemode().display();
    }
    // Display Menu
    MENU_MANAGER.display();
}

// Start Up
window.addEventListener("load", () => {
    setup();
});