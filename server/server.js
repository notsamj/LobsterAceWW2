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

//var activeGameMode = new ServerDogfight(fillEntities(), scene, server);
var activeGameMode = null;
//var server = new HTTPServer(fileData["constants"]["server_port"]);

// Start Up

// Register listeners

/*server.register("GET", "STATE", async function (client, match){
    let responseJSON = activeGameMode.getLast(gameMode.getSceneID());
    client.send(JSON.stringify(responseJSON));
});*/

server.register("PUT", "JOIN", async function (match){
    let planeType = match[6];
    activeGameMode = new ServerDogfight([new MultiplayerHumanFighterPlane(planeType, scene)], scene, server);
    // TODO: Figure out who the client is and send them the plane id
});

server.register("PUT", "CLIENTPLANE", async function (match){
    let data = match[6];
    let dataJSON = JSON.parse(match[6]);
    activeGameMode.updateFromUser(dataJSON);
});

startTime = Date.now();
setInterval(tick, Math.floor(1000 / (FILE_DATA["constants"]["TICK_RATE"])));

function tick(){
    activeGameMode.tick();
}

function fillEntities(){
    let entities = [];
    for (let i = 0 ; i < 0; i++){
        entities.push(MultiplayerBiasedBotFighterPlane.createBiasedPlane("spitfire", scene, FILE_DATA));
        entities.push(MultiplayerBiasedBotFighterPlane.createBiasedPlane("a6m_zero", scene, FILE_DATA));
    }
    return entities;
}