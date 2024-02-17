// TODO: File needs comments
const WebSocketServer = require("ws").WebSocketServer;
const NotSamLinkedList = require("../scripts/general/notsam_linked_list.js");
const Lock = require("../scripts/general/lock.js");
const PROGRAM_DATA = require("../data/data_json.js");
const SERVER_DATA = require("../data/user_data.js");
const SimpleCryptography = require("./simple_cryptography.js");
const SIMPLE_CRYPTOGRAPHY = new SimpleCryptography();
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

    sendFromLobby(username){
        if (!this.hasClient(username)){ return; }
        let client = this.findClient(username);
        client.sendFromLobby(username);
    }
    sendToGame(username){
        client.sendToGame(username);
    }

    generateRefreshResult(){
        // TODO
    }
}

class Client {
    constructor(ws){
        this.ws = ws;
        this.username = null;
        this.stateManager = new ClientStateManager();
        this.stateManager.register(ClientStateManager.prospective, (encryptedData) => { this.verifyClient(encryptedData); });
        this.stateManager.register(ClientStateManager.cancelled, (encryptedData) => {}); // If cancelled ignore all data
        this.stateManager.register(ClientStateManager.waiting, (encryptedData) => { this.whenWaiting(encryptedData); });
        this.stateManager.register(ClientStateManager.in_game, (encryptedData) => { this.whenInGame(encryptedData); });
        this.stateManager.register(ClientStateManager.in_lobby, (encryptedData) => { this.whenInLobby(encryptedData); });
        this.stateManager.register(ClientStateManager.hosting, (encryptedData) => { this.whenHosting(encryptedData); });
        console.log("Somebody is attempting to communicate.");
        this.ws.on("message", (encryptedData) => {
            this.handleMessage(encryptedData);
        });
        // TODO: Check if error always fires on disconnect
        this.ws.on("error", () => {
            console.log(this.username + " has crudely disconnected.");
            SERVER.getGameHandler().handleDisconnect(this.username);
            this.stateManager.goto(ClientStateManager.cancelled);
        });
        SERVER.removeInactives();
    }

    getStateManager(){
        return this.stateManager;
    }

    getUsername(){
        return this.username;
    }

    isCancelled(){
        return this.stateManager.getState() == ClientStateManager.cancelled;
    }

    isActive(){
        return !this.isCancelled() && this.isVerified();
    }

    isVerified(){
        return this.stateManager.getState() != ClientStateManager.prospective;
    }

    handleMessage(encryptedData){
        this.stateManager.sendToHandler(encryptedData);
    }

    async verifyClient(encryptedData){
        let dataJSON = Client.getDecryptedData(encryptedData);
        // Password matches assume the rest of the data is correct (e.g. username not "")
        let username = dataJSON["username"];
        // If username is taken then cancel this user
        if (await SERVER.usernameTaken(username)){
            this.ws.send(JSON.stringify({"success": false, "reason": "error_username_taken"}));
            this.stateManager.goto(ClientStateManager.cancelled);
            return;
        }
        this.username = username;
        this.stateManager.goto(ClientStateManager.waiting);
        console.error(this.username + " has connected.");
        this.ws.send(JSON.stringify({"success": true}));
    }

    whenWaiting(encryptedData){
        let dataJSON = Client.getDecryptedData(encryptedData);
        if (dataJSON["action"] == "refresh"){
            this.ws.send(SERVER.generateRefreshResult());
        }else if (dataJSON["action"] == "join"){
            this.attemptToJoin();
        }else if (dataJSON["action"] == "host"){
            this.attemptToHost();
        }else{
            this.ws.send(JSON.stringify({"success": false, "reason": "unknown_query"}));
        }
    }

    attemptToJoin(){
        let gameHandler = SERVER.getGameHandler();

        // If there is a game running
        if (gameHandler.inProgress()){
            this.ws.send(JSON.stringify({"success": false, "reason": "game_in_progress"}));
            return;
        }

        // If there is a lobby running
        if (gameHandler.lobbyInProgress()){
            gameHandler.joinLobby(this.username);
            this.stateManager.goto(ClientStateManager.in_lobby);
            this.ws.send(JSON.stringify({"success": true}));
            return;
        }

        // Else no lobby running
        this.ws.send(JSON.stringify({"success": false}));
    }

    attemptToHost(){
        let gameHandler = SERVER.getGameHandler();

        // If there is a game running
        if (gameHandler.inProgress()){
            this.ws.send(JSON.stringify({"success": false, "reason": "game_in_progress"}));
            return;
        }

        // If there is a lobby running
        if (gameHandler.lobbyInProgress()){
            this.ws.send(JSON.stringify({"success": false, "reason": "lobby_in_progress"}));
            return;
        }

        // Else no lobby running
        this.stateManager.goto(ClientStateManager.hosting);
        gameHandler.hostLobby(this.username);
        this.ws.send(JSON.stringify({"success": true}));
    }

    whenInGame(encryptedData){
        let dataJSON = Client.getDecryptedData(encryptedData);
        // If leaving game
        if (dataJSON["action"] == "leave_game"){
            console.log(this.username + " has disconnected.");
            SERVER.getGameHandler().handleDisconnect(this.username);
        }else{ // Updating with plane data
            SERVER.getGameHandler().updateFromUser(dataJSON["plane_update"]);
        }
    }
    whenInLobby(encryptedData){
        let dataJSON = Client.getDecryptedData(encryptedData);
        // If leaving game
        if (dataJSON["action"] == "leave_game"){
            console.log(this.username + " has disconnected.");
            SERVER.getGameHandler().handleDisconnect(this.username);
        }else{ // Updating with plane preference
            SERVER.getGameHandler().getLobby().updatePreference(this.username, dataJSON["plane_update"]);
        }
    }
    whenHosting(encryptedData){
        let dataJSON = Client.getDecryptedData(encryptedData);
        // If leaving game
        if (dataJSON["action"] == "leave_game"){
            console.log(this.username + " (host) has disconnected.");
            SERVER.getGameHandler().handleDisconnect(this.username);
        }else if (dataJSON["action"] == "update_settings"){ // Updating with game settings
            SERVER.getGameHandler().getLobby().updateSettings(this.username, dataJSON["new_settings"]);
        }else{ // Updating with plane preference
            SERVER.getGameHandler().getLobby().updatePreference(this.username, dataJSON["plane_update"]);
        }
    }

    sendFromLobby(){
        this.ws.send(JSON.stringify({"message": "lobby_ended"}));
    }

    sendToGame(){
        this.ws.send(JSON.stringify({"message": "game_started"}));
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
    static prospective = 0;
    static cancelled = 1;
    static waiting = 2;
    static in_game = 3;
    static in_lobby = 4;
    static hosting = 5;

    constructor(){
        this.state = ClientStateManager.prospective;
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
        this.gameInProgress = false;
        this.lobbyInProgress = false;
    }

    startGame(){
        this.game = new Dogfight(this.lobby.dissolve());
    }

    isInProgress(){
        return this.game != null;
    }

    getLobby(){
        return this.lobby;
    }

    lobbyInProgress(){
        return this.lobby.isInProgress();
    }

    hostLobby(username){
        this.lobby = new Lobby(username);
    }

    joinLobby(username){
        this.lobby.addParticipant(username);
    }

    handleDisconnect(username){
        // If there is a lobby then handle the disconnect
        if (this.lobbyInProgress()){
            this.lobby.handleDisconnect(username);
        }else if (this.gameInProgress()){
            // If there is a game in progress then kill the player
            this.game.playerDisconnected(username); // TODO: Implement this method
        }
        // Else nothing needs to be done here
    }

    destroyLobby(){
        this.lobby.destroy();
    }

    updateFromUser(planeUpdate){
        this.game.newPlaneJSON(planeUpdate);
    }
}

class Lobby {
    constructor(host){
        this.host = host;
        this.participants = new NotSamLinkedList();
        this.participants.add(host);
        this.gameModeSetup = new DogfightSetup(); // 
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
}

class GamemodeSetup {
    constructor(){
        this.participantTypes = {};
    }
}

class DogfightSetup extends GamemodeSetup {
    constructor(){
        super();
        this.botCounts = this.createBotCounts();
        this.allyDifficulty = "easy";
        this.axisDifficulty = "easy";
    }

    createBotCounts(){
        for (let [planeName, planeData] of Object.entries(PROGRAM_DATA["plane_data"])){
            this.planeCounts[planeName] = 0;
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
        return jsonRep;
    }
}

// Start Up
const SERVER = new WW2PGServer(SERVER_DATA["server_data"]["server_port"]);