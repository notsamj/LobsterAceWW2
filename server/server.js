// What's important so far is we've exablished we can share classes this way without breaking the main game :)
// TODO: Just make server versions of each of these by simply extending them
// TODO: For variables like scene maybe at top of file: if nodeJS then scene = (require SharedVariables.js).getVariable("scene")
const FILE_DATA = require("../data/data_json.js");
const ServerDogfight = require("./server_dogfight.js");
const PlaneGameScene = require("../scripts/plane_game_scene.js");
const MultiplayerBiasedBotFighterPlane = require("./multiplayer_bot_fighter_plane.js");
const MultiplayerServerRemoteFighterPlane = require("./multiplayer_server_remote_fighter_plane.js");
const HF = require("../scripts/helper_functions.js");
//const HTTPServer = require("./http_server.js");
const WSServer = require("./ws_server.js");
const Lock = require("../scripts/lock.js").Lock;
const NotSamArrayList = require("../scripts/notsam_array_list.js");
var server = new WSServer(fileData["constants"]["server_port"]);
var scene = new PlaneGameScene(); // TODO: Width Height not needed?

//var activeGameMode = new ServerDogfight(fillEntities(), scene, server);
var activeGameMode = null;
//var server = new HTTPServer(fileData["constants"]["server_port"]);

// Start Up

// Register listeners

/*server.register("GET", "STATE", async function (client, match){
    let responseJSON = activeGameMode.getLast(gameMode.getSceneID());
    client.send(JSON.stringify(responseJSON));
});*/

server.register("GET", "JOIN", async function (clientWS, match){
    console.log("Join")
    let joinOBJ = JSON.parse(match[6]);
    let clientID = joinOBJ["clientID"];
    let planeType = joinOBJ["planeClass"];
    // TODO: Needs a lot of work here
    activeGameMode = new ServerDogfight(scene, server);
    let planes = fillEntities(planeType);
    activeGameMode.start(planes);
    let response = activeGameMode.getState();
    let planeID = planeType != "freecam" ? "p_Allies_0" : "freecam"; // TODO
    response["YOUR_PLANE"] = planeID; // TODO: THis is temp
    //console.log(response, JSON.stringify(response))
    //return;
    let responseStr = JSON.stringify(response);
    clientWS.send(responseStr);
    server.addClient(clientWS, clientID);
});

server.register("PUT", "CLIENTPLANE", async function (clientWS, match){
    let data = match[6];
    let dataJSON = JSON.parse(match[6]);
    // TODO: Update connection n' stuff
    activeGameMode.updateFromUser(dataJSON);
});

startTime = Date.now();
setInterval(tick, Math.floor(1000 / (FILE_DATA["constants"]["TICK_RATE"])));

function tick(){
    if (activeGameMode != null){
        activeGameMode.tick();
    }
}

function fillEntities(planeType){
    let entities = [];
    if (planeType != "freecam"){
        entities.push(new MultiplayerServerRemoteFighterPlane(planeType, scene, activeGameMode));
    }
    let max = 1;
    for (let i = 0; i < max; i++){
        entities.push(MultiplayerBiasedBotFighterPlane.createBiasedPlane("spitfire", scene, FILE_DATA));
        //entities.push(MultiplayerBiasedBotFighterPlane.createBiasedPlane("a6m_zero", scene, FILE_DATA));
    }
    // TEMP FOR TESTING
    for (let entity of entities){
        entity.setHealth(10000);
    }
    entities[entities.length-1].throttle = 100;
    entities[0].setX(entities[entities.length-1].getX() + 500);
    entities[0].setY(entities[entities.length-1].getY());
    return entities;
}