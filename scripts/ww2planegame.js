// Global Constants
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 800;
const FRAME_RATE = 240;


// Global variables
var fighterPlane = null;
var images = {};
var leftRightLock = new Lock();

// Functions

function loadRotatedImages(name){
    for (let i = 0; i < 360; i++){
        images[name + "_left_" + i.toString()] = new Image();
        images[name + "_left_" + i.toString()].src = "images/" + name + "/left/" + i.toString() + ".png";
        images[name + "_right_" + i.toString()] = new Image();
        images[name + "_right_" + i.toString()].src = "images/" + name + "/right/" + i.toString() + ".png";
    }
}

function setup() {
    loadRotatedImages("me_309");
    loadRotatedImages("spitfire");
    fighterPlane = new FighterPlane("spitfire", CANVAS_WIDTH, CANVAS_HEIGHT);

    setInterval(checkMoveLeftRight, 10); // Check for user input every 1/100 of a second
    setInterval(checkUpDown, 100); // Check for user input every 1/100 of a second

    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT); // TODO: Wrong order of parameters?
    frameRate(FRAME_RATE);
}

function draw() {
    clear();
    fighterPlane.display();
}

function checkMoveLeftRight(){
    let aKey = keyIsDown(65);
    let dKey = keyIsDown(68);
    let numKeysDown = 0;
    numKeysDown += aKey ? 1 : 0;
    numKeysDown += dKey ? 1 : 0;

    // Only ready to switch direction again once you've stopped holding for at least 1 cd
    if (numKeysDown === 0){
        leftRightLock.unlock();
        return;
    }else if (numKeysDown > 1){ // Can't which while holding > 1 key
        return;
    }
    if (!leftRightLock.isReady()){ return; }
    leftRightLock.lock();
    if (aKey){
        this.fighterPlane.face(false);
    }else if (dKey){
        this.fighterPlane.face(true);
    }
}


function checkUpDown(){
    let wKey = keyIsDown(87);
    let sKey = keyIsDown(83);
    let numKeysDown = 0;
    numKeysDown += wKey ? 1 : 0;
    numKeysDown += sKey ? 1 : 0;

    // Only ready to switch direction again once you've stopped holding for at least 1 cd
    if (numKeysDown === 0){
        return;
    }else if (numKeysDown > 1){ // Can't which while holding > 1 key
        return;
    }
    if (wKey){
        this.fighterPlane.adjustAngle(-1);
    }else if (sKey){
        this.fighterPlane.adjustAngle(1);
    }
}