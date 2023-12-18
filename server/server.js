// What's important so far is we've exablished we can share classes this way without breaking the main game :)
// TODO: Just make server versions of each of these by simply extending them
// TODO: For variables like scene maybe at top of file: if nodeJS then scene = (require SharedVariables.js).getVariable("scene")
const FILE_DATA = require("../data/data_json.js");
const ServerDogfight = require("./server_dogfight.js");
const PlaneGameScene = require("../scripts/plane_game_scene.js");
const MultiplayerBiasedBotFighterPlane = require("./multiplayer_bot_fighter_plane.js");
const HF = require("../scripts/helper_functions.js");
const HTTPServer = require("./http_server.js");
const Lock = require("../scripts/lock.js").Lock;
var scene = new PlaneGameScene();
var tickLock = new Lock();
var startTime = null;
var numTicks = 0;
var activeGameMode = new ServerDogfight([MultiplayerBiasedBotFighterPlane.createBiasedPlane("spitfire", scene, FILE_DATA), MultiplayerBiasedBotFighterPlane.createBiasedPlane("a6m_zero", scene, FILE_DATA)], scene);
var server = new HTTPServer(fileData["constants"]["server_port"]);

// Start Up

// Register listeners
server.registerGet("state", async function (request, response){
    await tickLock.awaitUnlock();
    tickLock.lock();
    //await HF.sleep(5000);
    let responseJSON = activeGameMode.getState(startTime, numTicks);
    //console.log("Plane is...", responseJSON)
    response.json(responseJSON)
    tickLock.unlock();
});

startTime = Date.now();
setInterval(tick, Math.floor(1000 / (FILE_DATA["constants"]["TICK_RATE"])));

function tick(){
    if (!tickLock.isReady()){ return; }
    let expectedTicks = Math.floor(((Date.now() - startTime) / FILE_DATA["constants"]["MS_BETWEEN_TICKS"]));
    while (numTicks < expectedTicks){
        tickLock.lock();
        scene.tick(FILE_DATA["constants"]["MS_BETWEEN_TICKS"]);
        if (activeGameMode != null){
            activeGameMode.tick();
        }
        numTicks += 1;
    }
    tickLock.unlock();
}