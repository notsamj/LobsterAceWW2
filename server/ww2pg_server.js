// TODO: File needs comments
const WebSocketServer = require("ws").WebSocketServer;
const NotSamLinkedList = require("../scripts/general/notsam_linked_list.js");
const Lock = require("../scripts/general/lock.js");
const PROGRAM_DATA = require("../data/data_json.js");
const SERVER_DATA = require("../data/user_data.js");
const SimpleCryptography = require("./simple_cryptography.js");
const SIMPLE_CRYPTOGRAPHY = new SimpleCryptography(PROGRAM_DATA["secret_seed"]);
const ServerDogFight = require("./server_dogfight.js");
class WW2PGServer {
    constructor(port){
        this.server = new WebSocketServer({ "port": port })
        this.port = port;
        this.clients = new NotSamLinkedList();
        this.clientLock = new Lock();
        this.gameHandler = new GameHandler();
        console.log("Server on and listening to port: %d", port);
        // TODO: Change this to something else with authentication
        this.server.on("connection", async (ws) => {
            await this.clientLock.awaitUnlock(true);
            this.clients.add(new Client(ws));
            this.clientLock.unlock();
        });
    }

    async usernameTaken(username){
        return this.hasClient(username);
    }

    async removeInactives(){
        await this.clientLock.awaitUnlock(true);
        this.clients.deleteWithCondition((client) => { return client.isCancelled(); });
        this.clientLock.unlock();
    }

    getGameHandler(){
        return this.gameHandler;
    }

    async findClient(username){
        await this.clientLock.awaitUnlock(true);
        for (let [client, clientIndex] of this.clients){
            if (client.isActive() && client.getUsername() == username){
                this.clientLock.unlock();
                return client;
            }
        }
        this.clientLock.unlock();
        return null;
    }

    async hasClient(username){
        await this.findClient(username) != null;
    }

    async sendFromLobby(username){
        if (!(await this.hasClient(username))){ return; }
        let client = await this.findClient(username);
        client.sendFromLobby(username);
    }

    async sendToGame(username){
        let client = await SERVER.findClient(username);
        client.sendToGame(username);
    }

    generateRefreshResult(){
        return this.gameHandler.generateRefreshResult();
    }

    async handleDisconnect(username){
        this.gameHandler.handleDisconnect(username);
        if (!this.gameHandler.isInProgress()){
            return;
        }
        if (await this.checkIfGameEmpty()){
            this.gameHandler.end();
        }

    }

    async checkIfGameEmpty(){
        await this.clientLock.awaitUnlock(true);
        for (let [client, clientIndex] of this.clients){
            if (client.isActive() && client.getState() == PROGRAM_DATA["client_states"]["in_game"]){
                this.clientLock.unlock();
                return false;
            }
        }
        this.clientLock.unlock();
        return true;
    }
}

class Client {
    constructor(ws){
        this.ws = ws;
        this.username = null;
        this.stateManager = new ClientStateManager();
        this.stateManager.register(PROGRAM_DATA["client_states"]["prospective"], (encryptedData) => { this.verifyClient(encryptedData); });
        this.stateManager.register(PROGRAM_DATA["client_states"]["cancelled"], (encryptedData) => {}); // If cancelled ignore all data
        this.stateManager.register(PROGRAM_DATA["client_states"]["waiting"], (encryptedData) => { this.whenWaiting(encryptedData); });
        this.stateManager.register(PROGRAM_DATA["client_states"]["in_game"], (encryptedData) => { this.whenInGame(encryptedData); });
        this.stateManager.register(PROGRAM_DATA["client_states"]["in_lobby"], (encryptedData) => { this.whenInLobby(encryptedData); });
        this.stateManager.register(PROGRAM_DATA["client_states"]["hosting"], (encryptedData) => { this.whenHosting(encryptedData); });
        this.lastReceivedMessageTime = Date.now();
        this.heartbeat = null;
        console.log("Somebody is attempting to communicate.");
        this.ws.on("message", (encryptedData) => {
            this.handleMessage(encryptedData);
            this.lastReceivedMessageTime = Date.now();
        });
        // TODO: Check if error always fires on disconnect
        this.ws.on("error", () => {
            console.log(this.username + " has disconnected from the server.");
            this.stateManager.goto(PROGRAM_DATA["client_states"]["cancelled"]);
            SERVER.handleDisconnect(this.username);
        });
        SERVER.removeInactives();
    }

    checkAlive(){
        if (this.lastReceivedMessageTime + 10000 < Date.now()){
            console.log(this.username + " has no heartbeat.");
            this.stateManager.goto(PROGRAM_DATA["client_states"]["cancelled"]);
            SERVER.handleDisconnect(this.username);
            clearInterval(this.heartbeat);
        }
    }

    getState(){
        return this.stateManager.getState();
    }

    getStateManager(){
        return this.stateManager;
    }

    getUsername(){
        return this.username;
    }

    isCancelled(){
        return this.stateManager.getState() == PROGRAM_DATA["client_states"]["cancelled"];
    }

    isActive(){
        if (this.getState() == PROGRAM_DATA["client_states"]["prospective"]){ return; }
        return !this.isCancelled() && this.isVerified();
    }

    isVerified(){
        return this.stateManager.getState() != PROGRAM_DATA["client_states"]["prospective"];
    }

    handleHeartbeat(dataJSON){
        if (dataJSON["action"] == "ping"){
            this.ws.send(JSON.stringify({"action": "pong", "mail_box": "heartbeat"}));
            return true;
        }
        return false;
    }

    handleMessage(encryptedData){
        let dataJSON = Client.getDecryptedData(encryptedData);
        if (dataJSON["action"] != "get_state" && dataJSON["action"] != "ping"){
            //console.log("Received data:", dataJSON);
        }
        if (this.handleHeartbeat(dataJSON)){
            return;
        }
        this.stateManager.sendToHandler(dataJSON);
    }

    async verifyClient(dataJSON){
        // Password matches assume the rest of the data is correct (e.g. username not "")
        let username = dataJSON["username"];
        // If username is taken then cancel this user
        if (await SERVER.usernameTaken(username)){
            this.ws.send(JSON.stringify({"success": false, "reason": "error_username_taken", "mail_box": dataJSON["mail_box"]}));
            this.stateManager.goto(PROGRAM_DATA["client_states"]["cancelled"]);
            return;
        }
        this.username = username;
        this.stateManager.goto(PROGRAM_DATA["client_states"]["waiting"]);
        console.error(this.username + " has connected.");
        this.ws.send(JSON.stringify({"success": true, "mail_box": "setup"}));
        this.heartbeat = setInterval(() => this.checkAlive(), 10000);
    }

    whenWaiting(dataJSON){
        if (dataJSON["action"] == "refresh"){
            this.ws.send(SERVER.generateRefreshResult());
        }else if (dataJSON["action"] == "join"){
            this.attemptToJoin();
        }else if (dataJSON["action"] == "host"){
            this.attemptToHost();
        }else{
            this.ws.send(JSON.stringify({"success": false, "reason": "unknown_query", "mail_box": dataJSON["mail_box"]}));
        }
    }

    attemptToJoin(){
        let gameHandler = SERVER.getGameHandler();

        // If there is a game running
        if (gameHandler.isInProgress()){
            this.ws.send(JSON.stringify({"success": false, "reason": "game_in_progress", "mail_box": "join"}));
            return;
        }

        // If there is a lobby running
        if (gameHandler.isLobbyInProgress()){
            gameHandler.joinLobby(this.username);
            this.stateManager.goto(PROGRAM_DATA["client_states"]["in_lobby"]);
            this.ws.send(JSON.stringify({"success": true, "mail_box": "join"}));
            return;
        }

        // Else no lobby running
        this.ws.send(JSON.stringify({"success": false, "mail_box": "join"}));
    }

    attemptToHost(){
        let gameHandler = SERVER.getGameHandler();

        // If there is a game running
        if (gameHandler.isInProgress()){
            this.ws.send(JSON.stringify({"success": false, "reason": "game_in_progress", "mail_box": "host"}));
            return;
        }

        // If there is a lobby running
        if (gameHandler.isLobbyInProgress()){
            this.ws.send(JSON.stringify({"success": false, "reason": "lobby_in_progress", "mail_box": "host"}));
            return;
        }

        // Else no lobby running
        this.stateManager.goto(PROGRAM_DATA["client_states"]["hosting"]);
        gameHandler.hostLobby(this.username);
        this.ws.send(JSON.stringify({"success": true, "mail_box": "host"}));
    }

    whenInGame(dataJSON){
        // If leaving game
        if (dataJSON["action"] == "leave_game"){
            console.log(this.username + " has disconnected from the game.");
            this.getStateManager().goto(PROGRAM_DATA["client_states"]["waiting"]);
            SERVER.handleDisconnect(this.username);
        }else if (dataJSON["action"] == "plane_update"){ // Updating with plane data
            SERVER.getGameHandler().updateFromUser(dataJSON["plane_update"]);
        }else{ // Get state
            let state = SERVER.getGameHandler().getState();
            state["mail_box"] = dataJSON["mail_box"];
            this.ws.send(JSON.stringify(state));
        }
    }

    whenInLobby(dataJSON){
        // If leaving game
        if (dataJSON["action"] == "leave_game"){
            console.log(this.username + " has disconnected from the lobby.");
            this.getStateManager().goto(PROGRAM_DATA["client_states"]["waiting"]);
            SERVER.handleDisconnect(this.username);
        }else{ // Updating with plane preference
            SERVER.getGameHandler().getLobby().updatePreference(this.username, dataJSON["plane_update"]);
        }
    }

    whenHosting(dataJSON){
        // If leaving game
        if (dataJSON["action"] == "leave_game"){
            console.log(this.username + " (host) has disconnected from the lobby.");
            this.getStateManager().goto(PROGRAM_DATA["client_states"]["waiting"]);
            SERVER.handleDisconnect(this.username);
        }else if (dataJSON["action"] == "update_settings"){ // Updating with game settings
            SERVER.getGameHandler().getLobby().updateSettings(dataJSON["new_settings"]);
        }else if (dataJSON["action"] == "plane_update"){ // Updating with plane preference
            SERVER.getGameHandler().getLobby().updatePreference(this.username, dataJSON["plane_update"]);
        }else{ // Starting game
            SERVER.getGameHandler().startGame();
            this.ws.send(JSON.stringify({"success": true, "mail_box": dataJSON["mail_box"]}));
        }
    }

    sendFromLobby(){
        this.ws.send(JSON.stringify({"message": "lobby_ended"}));
    }

    sendToGame(){
        this.getStateManager().goto(PROGRAM_DATA["client_states"]["in_game"]);
        this.ws.send(JSON.stringify({"message": "game_started"}));
    }

    sendJSON(messageJSON){
        this.send(JSON.stringify(messageJSON));
    }

    send(message){
        this.ws.send(message);
    }

    static getDecryptedData(encryptedData){
        // If bad message then quit the program (This is just a fun program so doesn't have to handle these things rationally)
        if (!SIMPLE_CRYPTOGRAPHY.validFormat(encryptedData)){
            console.error("Invalid data received.");
            process.exit(1);
        }

        // Turn to string
        encryptedData = encryptedData.toString();

        let dataString = SIMPLE_CRYPTOGRAPHY.decrypt(encryptedData);
        let dataJSON = JSON.parse(dataString);
        // If bad password then quit the program (This is just a fun program so doesn't have to handle these things rationally)
        if (dataJSON["password"] != SERVER_DATA["server_data"]["password"]){
            console.error("Invalid password received.");
            process.exit(1);
        }
        return dataJSON;
    }
}

class ClientStateManager {
    constructor(){
        this.state = PROGRAM_DATA["client_states"]["prospective"];
        this.handlers = {};
    }

    register(state, handler){
        this.handlers[state] = handler;
    }

    sendToHandler(data){
        this.handlers[this.state](data);
    }

    getState(){
        return this.state;
    }

    goto(state){
        this.state = state;
    }
}

class GameHandler {
    constructor(){
        this.game = null;
        this.lobby = null;
    }

    end(){
        this.game.end();
        this.game = null;
    }

    gameInProgress(){
        return this.game != null;
    }

    async startGame(){
        this.game = new ServerDogFight(this.lobby.dissolve());
        this.lobby = null;
    }

    isInProgress(){
        return this.game != null;
    }

    getLobby(){
        return this.lobby;
    }

    isLobbyInProgress(){
        return this.getLobby() != null;
    }

    hostLobby(username){
        this.lobby = new Lobby(username);
    }

    joinLobby(username){
        this.lobby.addParticipant(username);
    }

    handleDisconnect(username){
        // If there is a lobby then handle the disconnect
        if (this.isLobbyInProgress()){
            this.lobby.handleDisconnect(username);
        }else if (this.gameInProgress()){
            // If there is a game in progress then kill the player
            this.game.playerDisconnected(username);
        }
        // Else nothing needs to be done here
    }

    destroyLobby(){
        this.lobby.destroy();
    }

    updateFromUser(planeUpdate){ 
        this.game.newPlaneJSON(planeUpdate);
    }

    generateRefreshResult(){
        let responseJSON = {};
        let serverFree = !this.isInProgress() && !this.isLobbyInProgress();
        responseJSON["server_free"] = serverFree;
        responseJSON["mail_box"] = "refresh";
        // If the server is free then return this information
        if (serverFree){
            return JSON.stringify(responseJSON);
        }
        // If server is not free return reason
        if (this.isInProgress()){
            responseJSON["server_details"] = "Game in progress.";
        }else{
            responseJSON["server_details"] = this.lobby.getType();
        }
        responseJSON["game_in_progress"] = this.isInProgress();
        return JSON.stringify(responseJSON);
    }

    getState(){
        return this.game.getLastState();
    }
}

class Lobby {
    constructor(host){
        this.host = host;
        this.participants = new NotSamLinkedList();
        this.participants.add(host);
        this.gameModeSetup = new DogfightSetup(); // 
    }

    // TODO
    getType(){
        return "dogfight";
    }

    addParticipant(username){
        this.participants.add(username);
    }

    destroy(){
        for (let [playerName, playerIndex] of this.participants){
            SERVER.sendFromLobby(playerName);
        }
    }

    dissolve(){
        for (let [playerName, playerIndex] of this.participants){
            SERVER.sendToGame(playerName);
        }
        let details = this.gameModeSetup.getDetails(this.participants); // TODO
        return details;
    }

    // TODO: Make this in UI on client side aswell
    changeGamemode(){

    }

    updatePreference(username, entityType){
        this.gameModeSetup.updatePreference(username, entityType);
    }

    handleDisconnect(username){
        // If the host left then destroy the lobby
        if (this.host == username){
            this.destroy();
            return;
        }

        // One of the other players left
        this.participants.deleteWithCondition((participantName) => { return participantName == username; })
    }

    updateSettings(newSettingsJSON){
        // TODO: Something here dogfight -> mission, mission1 -> mission2, mission2 -> mission1
        this.gameModeSetup.updateSettings(newSettingsJSON);
    }

    async getHostClient(){
        return await SERVER.findClient(this.host);
    }
}

class GamemodeSetup {
    constructor(){
        this.participantTypes = {};
    }
}

class DogfightSetup extends GamemodeSetup {
    constructor(){
        super();
        this.botCounts = {};
        this.createBotCounts();
        this.allyDifficulty = "easy";
        this.axisDifficulty = "easy";
        this.bulletPhysicsEnabled = PROGRAM_DATA["settings"]["use_physics_bullets"];
    }

    createBotCounts(){
        for (let [planeName, planeData] of Object.entries(PROGRAM_DATA["plane_data"])){
            this.botCounts[planeName] = 0;
        }
    }

    updatePreference(username, entityType){
        this.participantTypes[username] = entityType;
    }

    getDetails(){
        let jsonRep = {};
        jsonRep["users"] = [];
        for (let [username, userEntityType] of Object.entries(this.participantTypes)){
            // If not a freecam, then add to users list
            if (userEntityType != "freecam"){
                jsonRep["users"].push({
                    "model": userEntityType,
                    "id": username
                });
            }
        }

        jsonRep["planeCounts"] = this.botCounts;
        jsonRep["allyDifficulty"] = this.allyDifficulty;
        jsonRep["axisDifficulty"] = this.axisDifficulty;
        jsonRep["bullet_physics_enabled"] = this.bulletPhysicsEnabled;
        return jsonRep;
    }

    updateSettings(newSettingsJSON){
        this.botCounts = newSettingsJSON["bot_counts"];
        this.allyDifficulty = newSettingsJSON["ally_difficulty"];
        this.axisDifficulty = newSettingsJSON["axis_difficulty"];
        this.bulletPhysicsEnabled = newSettingsJSON["bullet_physics_enabled"];
    }
}

// Start Up
const SERVER = new WW2PGServer(SERVER_DATA["server_data"]["server_port"]);