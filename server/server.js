// What's important so far is we've exablished we can share classes this way without breaking the main game :)
// TODO: Just make server versions of each of these by simply extending them
// TODO: For variables like scene maybe at top of file: if nodeJS then scene = (require SharedVariables.js).getVariable("scene")
const FILE_DATA = require("../data/data_json.js");
const ServerDogfight = require("./server_dogfight.js");
const PlaneGameScene = require("../scripts/plane_game_scene.js");
const MultiplayerBiasedBotFighterPlane = require("./multiplayer_bot_fighter_plane.js");
const HF = require("../scripts/helper_functions.js");
//const HTTPServer = require("./http_server.js");
const WSServer = require("./ws_server.js");
const Lock = require("../scripts/lock.js").Lock;
const NotSamArrayList = require("../scripts/notsam_array_list.js");
var server = new WSServer(fileData["constants"]["server_port"]);

var scene = new PlaneGameScene();
var version = 0;
var tickLock = new Lock();
var startTime = null;
var numTicks = 0;

var activeGameMode = new ServerDogfight(fillEntities(), scene);
//var server = new HTTPServer(fileData["constants"]["server_port"]);
var previousStates = new NotSamArrayList(null, FILE_DATA["constants"]["SAVED_TICKS"]);
previousStates.fullWithPlaceholder(null);

// Start Up

// Register listeners

server.register("GET", "STATE", async function (client, match){
    await tickLock.awaitUnlock();
    tickLock.lock();
    let responseJSON = previousStates.get((numTicks - 1) % FILE_DATA["constants"]["SAVED_TICKS"]);
    client.send(JSON.stringify(responseJSON));
    tickLock.unlock();
});

server.register("PUT", "CLIENTPLANE", async function (match){
    let data = match[6];
    let dataJSON = JSON.parse(match[6]);
    await tickLock.awaitUnlock();
    tickLock.lock();
    numTicks = dataJSON["numTicks"];
    activeGameMode.updateClient(dataJSON);
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
            previousStates.put(numTicks % FILE_DATA["constants"]["SAVED_TICKS"], activeGameMode.getState(startTime, numTicks, version));
        }
        numTicks += 1;
        version += 1;
        // Debugging
        if (version % 500 == 0){ console.log(version)}
    }
    tickLock.unlock();
}

function fillEntities(){
    let entities = [];
    for (let i = 0 ; i < 0; i++){
        entities.push(MultiplayerBiasedBotFighterPlane.createBiasedPlane("spitfire", scene, FILE_DATA));
        entities.push(MultiplayerBiasedBotFighterPlane.createBiasedPlane("a6m_zero", scene, FILE_DATA));
    }
    return entities;
}