const WebSocketServer = require("ws").WebSocketServer;
const NotSamLinkedList = require("../scripts/general/notsam_linked_list.js");
const Lock = require("../scripts/general/lock.js");
const PROGRAM_DATA = require("../data/data_json.js");
const SERVER_DATA = require("../data/user_data.js");
const SimpleCryptography = require("../scripts/general/simple_cryptography.js");
const SIMPLE_CRYPTOGRAPHY = new SimpleCryptography(SERVER_DATA["server_data"]["secret_seed"]);
const ServerDogFight = require("./server_dogfight.js");
/*
    Class Name: WW2PGServer
    Description: A server for hosting games involving World War 2 Plane Game
    TODO: Comments
*/
class WW2PGServer {
    /*
        Method Name: constructor
        Method Parameters: 
            port:
                Port to use for the web socket server
        Method Description: Constructor
        Method Return: Constructor
    */
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

    /*
        Method Name: usernameTaken
        Method Parameters: username
        Method Description: Checks if a username is taken
        Method Return: Boolean, true -> the username is taken, false -> the username is not taken
    */
    async usernameTaken(username){
        return await this.hasClient(username);
    }

    /*
        Method Name: removeInactives
        Method Parameters: None
        Method Description: Removes inactive clients
        Method Return: void
    */
    async removeInactives(){
        await this.clientLock.awaitUnlock(true);
        this.clients.deleteWithCondition((client) => { return client.isCancelled(); });
        this.clientLock.unlock();
    }

    /*
        Method Name: getGameHandler
        Method Parameters: None
        Method Description: Getter
        Method Return: GameHandler
    */
    getGameHandler(){
        return this.gameHandler;
    }

    /*
        Method Name: findClient
        Method Parameters:
            username:
                Username of a client
        Method Description: Finds an active client
        Method Return: Client
    */
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

    /*
        Method Name: hasClient
        Method Parameters: None
        Method Description: TODO
        Method Return: Boolean, true -> the client exists, false -> the client does not exist
    */
    async hasClient(username){
        return (await this.findClient(username)) != null;
    }

    /*
        Method Name: sendFromLobby
        Method Parameters: None
        Method Description: Sends a client out of the lobby
        Method Return: void
    */
    async sendFromLobby(username){
        if (!(await this.hasClient(username))){ return; }
        let client = await this.findClient(username);
        client.getStateManager().goto(PROGRAM_DATA["client_states"]["waiting"]);
        console.log("Sending", username, "from the lobby")
        client.sendFromLobby();
    }

    /*
        Method Name: sendToGame
        Method Parameters: None
        Method Description: Sends a client to the game from the lobby
        Method Return: void
    */
    async sendToGame(username){
        let client = await SERVER.findClient(username);
        client.sendToGame(username);
    }

    /*
        Method Name: generateRefreshResult
        Method Parameters: None
        Method Description: Generates the result provided to a client performing a "refresh"
        Method Return: JSON Object
    */
    generateRefreshResult(){
        return this.gameHandler.generateRefreshResult();
    }

    /*
        Method Name: handleDisconnect
        Method Parameters:
            username:
                Username of the user disconnecting
        Method Description: Handles a user disconnecting from the server
        Method Return: void
    */
    async handleDisconnect(username){
        this.gameHandler.handleDisconnect(username);
        if (!this.gameHandler.isInProgress()){
            return;
        }
        if (await this.checkIfGameEmpty()){
            this.gameHandler.end();
        }

    }

    /*
        Method Name: checkIfGameEmpty
        Method Parameters: None
        Method Description: Checks if the game is empty 
        Method Return: boolean, true -> the game is empty, false -> the game is not empty
    */
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

/*
    Class Name: Client
    Description: A user communicating with the server
*/
class Client {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
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
            // Ignore messages from cancelled clients
            if (this.stateManager.getState() == PROGRAM_DATA["client_states"]["cancelled"]){ return; }
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

    /*
        Method Name: checkAlive
        Method Parameters: None
        Method Description: Checks if a client's connection is still alive
        Method Return: void
    */
    checkAlive(){
        if (this.lastReceivedMessageTime + 1000 < Date.now()){
            console.log(this.username + " has no heartbeat.");
            this.stateManager.goto(PROGRAM_DATA["client_states"]["cancelled"]);
            SERVER.handleDisconnect(this.username);
            clearInterval(this.heartbeat);
        }
    }

    /*
        Method Name: getState
        Method Parameters: None
        Method Description: Gets the state of the client
        Method Return: Integer representing a state
    */
    getState(){
        return this.stateManager.getState();
    }

    /*
        Method Name: getStateManager
        Method Parameters: None
        Method Description: Getter
        Method Return: ClientStateManager
    */
    getStateManager(){
        return this.stateManager;
    }

    /*
        Method Name: getUsername
        Method Parameters: None
        Method Description: Getter
        Method Return: String
    */
    getUsername(){
        return this.username;
    }

    /*
        Method Name: isCancelled
        Method Parameters: None
        Method Description: Checks if a client is cancelled
        Method Return: boolean, true -> the client is cancelled, false -> the client is not cancelled
    */
    isCancelled(){
        return this.stateManager.getState() == PROGRAM_DATA["client_states"]["cancelled"];
    }

    /*
        Method Name: isActive
        Method Parameters: None
        Method Description: Checks if a client is active
        Method Return: boolean, true -> the client is active, false -> the client is inactive
    */
    isActive(){
        return !this.isCancelled() && this.isVerified();
    }

    /*
        Method Name: isVerified
        Method Parameters: None
        Method Description: Determines if a client is verified
        Method Return: boolean, true -> the client is verified, false -> the client is not verified
    */
    isVerified(){
        return this.stateManager.getState() != PROGRAM_DATA["client_states"]["prospective"];
    }

    /*
        Method Name: handleHeartbeat
        Method Parameters:
            dataJSON:
                A JSON object with information from a client
        Method Description: Checks if a message is a heart beat, if so, replies
        Method Return: Boolean, true -> is a heart beat, false -> is not a heart beat
    */
    handleHeartbeat(dataJSON){
        if (dataJSON["action"] == "ping"){
            this.sendJSON({"action": "pong", "mail_box": "heart_beat"});
            return true;
        }
        return false;
    }

    /*
        Method Name: handleMessage
        Method Parameters:
            encryptedData:
                An encrypted message from a client
        Method Description: Sends information received from a client to an appropriate handler
        Method Return: void
    */
    handleMessage(encryptedData){
        let dataJSON = Client.getDecryptedData(encryptedData);
        if (this.handleHeartbeat(dataJSON)){
            return;
        }
        this.stateManager.sendToHandler(dataJSON);
    }

    /*
        Method Name: verifyClient
        Method Parameters: None
        Method Description: Handles the verification of a client
        Method Return: void
    */
    async verifyClient(dataJSON){
        // Password matches assume the rest of the data is correct (e.g. username not "")
        let username = dataJSON["username"];
        // If username is taken then cancel this user
        if (await SERVER.usernameTaken(username)){
            this.sendJSON({"success": false, "reason": "error_username_taken", "mail_box": dataJSON["mail_box"]});
            this.stateManager.goto(PROGRAM_DATA["client_states"]["cancelled"]);
            return;
        }
        this.username = username;
        this.stateManager.goto(PROGRAM_DATA["client_states"]["waiting"]);
        console.error(this.username + " has connected.");
        this.sendJSON({"success": true, "mail_box": "setup"});
        this.heartbeat = setInterval(() => this.checkAlive(), 2000);
    }

    /*
        Method Name: whenWaiting
        Method Parameters:
            dataJSON:
                A JSON with information from a client
        Method Description: Handles actions of a client who is hosting
        Method Return: void
    */
    whenWaiting(dataJSON){
        if (dataJSON["action"] == "refresh"){
            this.sendJSON(SERVER.generateRefreshResult());
        }else if (dataJSON["action"] == "join"){
            this.attemptToJoin();
        }else if (dataJSON["action"] == "host"){
            this.attemptToHost();
        }else{
            this.sendJSON({"success": false, "reason": "unknown_query", "mail_box": dataJSON["mail_box"]});
        }
    }

    /*
        Method Name: attemptToJoin
        Method Parameters: None
        Method Description: A client attempts to join a lobby
        Method Return: void
    */
    attemptToJoin(){
        let gameHandler = SERVER.getGameHandler();

        // If there is a game running
        if (gameHandler.isInProgress()){
            this.sendJSON({"success": false, "reason": "game_in_progress", "mail_box": "join"});
            return;
        }

        // If there is a lobby running
        if (gameHandler.isLobbyInProgress()){
            gameHandler.joinLobby(this.username);
            this.stateManager.goto(PROGRAM_DATA["client_states"]["in_lobby"]);
            this.sendJSON({"success": true, "mail_box": "join"});
            return;
        }

        // Else no lobby running
        this.sendJSON({"success": false, "mail_box": "join"});
    }

    /*
        Method Name: attemptToHost
        Method Parameters: None
        Method Description: Attempts to begin hosting a game on behalf of aclient
        Method Return: void
    */
    attemptToHost(){
        let gameHandler = SERVER.getGameHandler();
        // If there is a game running
        if (gameHandler.isInProgress()){
            this.sendJSON({"success": false, "reason": "game_in_progress", "mail_box": "host"});
            return;
        }
        // If there is a lobby running
        if (gameHandler.isLobbyInProgress()){
            this.sendJSON({"success": false, "reason": "lobby_in_progress", "mail_box": "host"});
            return;
        }
        // Else no lobby running
        this.stateManager.goto(PROGRAM_DATA["client_states"]["hosting"]);
        gameHandler.hostLobby(this.username);
        this.sendJSON({"success": true, "mail_box": "host"});
    }

    /*
        Method Name: whenInGame
        Method Parameters:
            dataJSON:
                A JSON with information from a client
        Method Description: Handles actions of a client who is in game
        Method Return: void
    */
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
            this.sendJSON(state);
        }
    }

    /*
        Method Name: whenInLobby
        Method Parameters:
            dataJSON:
                A JSON with information from a client
        Method Description: Handles actions of a client who is in a lobby
        Method Return: void
    */
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

    /*
        Method Name: whenHosting
        Method Parameters:
            dataJSON:
                A JSON with information from a client
        Method Description: Handles actions of a client who is hosting
        Method Return: void
    */
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
            this.sendJSON({"success": true, "mail_box": dataJSON["mail_box"]});
        }
    }

    /*
        Method Name: sendFromLobby
        Method Parameters: None
        Method Description: Moves a player to the lobby state and sends them a message informing them
        Method Return: void
    */
    sendFromLobby(){
        console.log("Sending go from lobby to", this.username)
        this.sendJSON({"mail_box": "lobby_end", "message": "lobby_ended"});
    }

    /*
        Method Name: sendToGame
        Method Parameters: None
        Method Description: Moves a player to the game state and sends them a message informing them
        Method Return: void
    */
    sendToGame(){
        this.getStateManager().goto(PROGRAM_DATA["client_states"]["in_game"]);
        this.sendJSON({"mail_box": "game_start", "message": "game_started"});
    }

    /*
        Method Name: sendJSON
        Method Parameters: None
        Method Description: Encrypts and sends a JSON object (also adds password)
        Method Return: void
    */
    sendJSON(messageJSON){
        messageJSON["password"] = SERVER_DATA["server_data"]["password"];
        this.send(JSON.stringify(messageJSON));
    }

    /*
        Method Name: send
        Method Parameters:
            message:
                A string to encrypt and send
        Method Description: Encrypts and sends a message
        Method Return: void
    */
    send(message){
        this.ws.send(SIMPLE_CRYPTOGRAPHY.encrypt(message));
    }

    /*
        Method Name: getDecryptedData
        Method Parameters:
            encryptedData:
                Data received from a web socket that is yet to be decrypted
        Method Description: Checks if data is in the proper format, has the correct password, then provides a decrypted version of it.
        Method Return: JSON Object
    */
    static getDecryptedData(encryptedData){
        // Turn to string
        encryptedData = encryptedData.toString();
        // If bad message then quit the program (This is just a fun program so doesn't have to handle these things rationally)
        if (!SIMPLE_CRYPTOGRAPHY.matchesEncryptedFormat(encryptedData)){
            console.error("Invalid data received.");
            process.exit(1);
        }

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

/*
    Class Name: ClientStateManager
    Description: A class for managing the current state of a client.
*/
class ClientStateManager {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.state = PROGRAM_DATA["client_states"]["prospective"];
        this.handlers = {};
    }

    /*
        Method Name: register
        Method Parameters:
            state:
                An integer representing a state
            handler:
                A function that takes 1 parameter
        Method Description: Registers a handler for data when in a given state
        Method Return: void
    */
    register(state, handler){
        this.handlers[state] = handler;
    }

    /*
        Method Name: sendToHandler
        Method Parameters:
            data:
                Unknown data type
        Method Description: Sends data to a handler function
        Method Return: void
    */
    sendToHandler(data){
        this.handlers[this.state](data);
    }

    /*
        Method Name: getState
        Method Parameters: None
        Method Description: Getter
        Method Return: Integer
    */
    getState(){
        return this.state;
    }

    /*
        Method Name: goto
        Method Parameters:
            state:
                An integer representing a state to move to
        Method Description: Moves the state manager to a given state (if not in cancelled state)
        Method Return: void
    */
    goto(state){
        // Can never leave cancelled (at least with this function)
        if (this.state == PROGRAM_DATA["client_states"]["cancelled"]){ return; }
        this.state = state;
    }

    /*
        Method Name: forceTo
        Method Parameters:
            state:
                An integer representing a state to move to
        Method Description: Forces the state manager to a given state
        Method Return: void
    */
    forceTo(state){
        this.state = state;
    }
}

/*
    Class Name: GameHandler
    Description: An interface for interacting with a game
*/
class GameHandler {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.game = null;
        this.endState = null;
        this.lobby = null;
    }

    gameOver(endState){
        this.endState = endState;
        this.game = null;
    }

    /*
        Method Name: end
        Method Parameters: None
        Method Description: Forces a game to end
        Method Return: void
    */
    end(){
        this.game.end();
        this.game = null;
    }

    /*
        Method Name: gameInProgress
        Method Parameters: None
        Method Description: Checks if a game is in progress
        Method Return: Boolean, true -> There is a game in progress, false -> There is no game in progress
    */
    gameInProgress(){
        return this.isInProgress();
    }

    /*
        Method Name: startGame
        Method Parameters: None
        Method Description: Starts a server dogfight TODO: Mission aswell
        Method Return: void
    */
    async startGame(){
        this.game = new ServerDogFight(this.lobby.dissolve(), this);
        this.lobby = null;
    }

    /*
        Method Name: isInProgress
        Method Parameters: None
        Method Description: Checks if a game is in progress
        Method Return: Boolean, true -> There is a game in progress, false -> There is no game in progress
    */
    isInProgress(){
        return this.game != null;
    }

    /*
        Method Name: getLobby
        Method Parameters: None
        Method Description: Getter
        Method Return: Lobby
    */
    getLobby(){
        return this.lobby;
    }

    /*
        Method Name: isLobbyInProgress
        Method Parameters: None
        Method Description: Determines if a lobby is in progress
        Method Return: Boolean, true -> A lobby is in progress, false -> there is no lobby in progress
    */
    isLobbyInProgress(){
        let lobby = this.getLobby();
        return lobby != null && lobby.isRunning();
    }

    /*
        Method Name: hostLobby
        Method Parameters: 
            username:
                The user who will host the lobby
        Method Description: Creates a lobby hosted by a user
        Method Return: void
    */
    hostLobby(username){
        this.lobby = new Lobby(username);
    }

    /*
        Method Name: joinLobby
        Method Parameters:
            username:
                User to add to the lobby
        Method Description: Handles a user joining a lobby
        Method Return: void
    */
    joinLobby(username){
        this.lobby.addParticipant(username);
    }

    /*
        Method Name: handleDisconnect
        Method Parameters: None
        Method Description: Handles the event of a user disconnecting, either from a lobby or from a game (or neither)
        Method Return: void
    */
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

    /*
        Method Name: destroyLobby
        Method Parameters: None
        Method Description: Destroys a lobby
        Method Return: void
    */
    destroyLobby(){
        this.lobby.destroy();
    }

    /*
        Method Name: updateFromUser
        Method Parameters:
            planeUpdate:
                A json object with information about a plane
        Method Description: Updates the game with information from a user about their plane
        Method Return: void
    */
    updateFromUser(planeUpdate){ 
        this.game.newPlaneJSON(planeUpdate);
    }

    /*
        Method Name: generateRefreshResult
        Method Parameters: None
        Method Description: Determines what information to provide when a user wishes to refresh
        Method Return: JSON Object
    */
    generateRefreshResult(){
        let responseJSON = {};
        let serverFree = !this.isInProgress() && !this.isLobbyInProgress();
        responseJSON["server_free"] = serverFree;
        responseJSON["mail_box"] = "refresh";
        // If the server is free then return this information
        if (serverFree){
            return responseJSON;
        }
        // If server is not free return reason
        if (this.isInProgress()){
            responseJSON["server_details"] = "Game in progress.";
        }else{
            responseJSON["server_details"] = this.lobby.getType();
        }
        responseJSON["game_in_progress"] = this.isInProgress();
        return responseJSON;
    }

    /*
        Method Name: getState
        Method Parameters: None
        Method Description: Gets the last state of the game
        Method Return: JSON Object
    */
    getState(){
        // If game isn't running send the last state from a game that we have
        if (this.game == null){
            return this.endState;
        }
        return this.game.getLastState();
    }
}

/*
    Class Name: Lobby
    Description: A lobby for players to join prior to a game
*/
class Lobby {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(host){
        this.host = host;
        this.participants = new NotSamLinkedList();
        this.participants.add(host);
        this.gameModeSetup = new DogfightSetup();
        this.running = true;
    }

    async sendAllUsers(messageJSON){
        for (let [playerName, playerIndex] of this.participants){
            let client = await SERVER.findClient(playerName);
            if (client == null){ continue; }
            client.sendJSON(messageJSON);
        }
    }

    async sendAllButHost(messageJSON){
        for (let [playerName, playerIndex] of this.participants){
            if (playerName == this.host){ continue; }
            let client = await SERVER.findClient(playerName);
            if (client == null){ continue; }
            client.sendJSON(messageJSON);
        }
    }

    /*
        Method Name: getType
        Method Parameters: None
        Method Description: Returns the type of lobby this is. "dogfight" or "mission"
        Method Return: String
    */
    getType(){
        return this.gameModeSetup.getType();
    }

    /*
        Method Name: addParticipant
        Method Parameters:
            username:
                The username of the new participant
        Method Description: Adds a participant to the lobby
        Method Return: void
    */
    addParticipant(username){
        this.participants.add(username);
    }

    /*
        Method Name: destroy
        Method Parameters: None
        Method Description: Destroys a lobby, kicking all participants out
        Method Return: void
    */
    destroy(){
        for (let [playerName, playerIndex] of this.participants){
            SERVER.sendFromLobby(playerName);
        }
        this.running = false;
    }

    /*
        Method Name: dissolve
        Method Parameters: None
        Method Description: Sends all participants to the game and returns details about the game
        Method Return: JSON Object
    */
    dissolve(){
        for (let [playerName, playerIndex] of this.participants){
            SERVER.sendToGame(playerName);
        }
        let details = this.gameModeSetup.getDetails(this.participants); // TODO
        this.running = false;
        return details;
    }

    /*
        Method Name: changeGamemode
        Method Parameters: None
        Method Description: Changes the game mode of lobby
        Method Return: void
    */
    // TODO: Make this in UI on client side aswell
    changeGamemode(messageJSON){
        if (messageJSON["new_gamemode"] == "mission"){
            this.gameModeSetup = new MissionSetup(this);
            this.sendAllButHost(({"mail_box": "reset_participant_type", "type": "mission", "new_mission_id": this.mission["id"]}));
        }else{ // Dogfight
            this.gameModeSetup = new DogfightSetup();
            this.sendAllButHost(({"mail_box": "reset_participant_type", "type": "dogfight"}));
        }
    }

    /*
        Method Name: updatePreference
        Method Parameters:
            username:
                User who's preference to update
            entityType:
                The user's new entity type
        Method Description: Updates the preferred plane of a user
        Method Return: void
    */
    updatePreference(username, entityType){
        this.gameModeSetup.updatePreference(username, entityType);
    }

    /*
        Method Name: handleDisconnect
        Method Parameters: None
        Method Description: Handles the event of a player disconnecting from the lobby
        Method Return: void
    */
    handleDisconnect(username){
        // If the host left then destroy the lobby
        if (this.host == username){
            this.destroy();
            return;
        }

        // One of the other players left
        this.participants.deleteWithCondition((participantName) => { return participantName == username; })

        // Remove them from user types
        this.gameModeSetup.updatePreference(username, "freecam");
    }

    /*
        Method Name: updateSettings
        Method Parameters:
            newSettingsJSON:
                A JSON object specifying new settings
        Method Description: Updates the settings of a lobby
        Method Return: void
    */
    updateSettings(newSettingsJSON){
        // TODO: Something here dogfight -> mission, mission1 -> mission2, mission2 -> mission1
        this.gameModeSetup.updateSettings(newSettingsJSON);
    }

    /*
        Method Name: getHostClient
        Method Parameters: None
        Method Description: Finds the client object for the host of the lobby
        Method Return: Client
    */
    async getHostClient(){
        return await SERVER.findClient(this.host);
    }

    /*
        Method Name: isRunning
        Method Parameters: None
        Method Description: Checks if the match is still running
        Method Return: Boolean, true -> running, false -> not running
    */
    isRunning(){
        return this.running;
    }
}

/*
    Class Name: GamemodeSetup
    Description: A class for setting up a game mode
*/
class GamemodeSetup {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.participantTypes = {};
    }

    // Abstract
    getType(){}
}

/*
    Class Name: DogfightSetup
    Description: A class for setting up a dogfight
*/
class DogfightSetup extends GamemodeSetup {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        super();
        this.botCounts = {};
        this.createBotCounts();
        this.allyDifficulty = "easy";
        this.axisDifficulty = "easy";
        this.bulletPhysicsEnabled = PROGRAM_DATA["settings"]["use_physics_bullets"];
    }

    getType(){
        return "dogfight";
    }

    /*
        Method Name: createBotCounts
        Method Parameters: None
        Method Description: Initializes the counts of planes for a dogfight
        Method Return: void
    */
    createBotCounts(){
        for (let [planeName, planeData] of Object.entries(PROGRAM_DATA["plane_data"])){
            this.botCounts[planeName] = 0;
        }
    }

    /*
        Method Name: updatePreference
        Method Parameters:
            username:
                User who's preference to update
            entityType:
                The user's new entity type
        Method Description: Updates the preferred plane of a user
        Method Return: void
    */
    updatePreference(username, entityType){
        this.participantTypes[username] = entityType;
    }

    /*
        Method Name: getDetails
        Method Parameters: None
        Method Description: Provides details about a dogfight match
        Method Return: JSON Object
    */
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

        jsonRep["plane_counts"] = this.botCounts;
        jsonRep["ally_difficulty"] = this.allyDifficulty;
        jsonRep["axis_difficulty"] = this.axisDifficulty;
        jsonRep["bullet_physics_enabled"] = this.bulletPhysicsEnabled;
        return jsonRep;
    }

    /*
        Method Name: updateSettings
        Method Parameters:
            newSettingsJSON:
                A JSOn object with new settings
        Method Description: Updates the setting of a dogfight from a provided JSON object
        Method Return: void
    */
    updateSettings(newSettingsJSON){
        this.botCounts = newSettingsJSON["bot_counts"];
        this.allyDifficulty = newSettingsJSON["ally_difficulty"];
        this.axisDifficulty = newSettingsJSON["axis_difficulty"];
        this.bulletPhysicsEnabled = newSettingsJSON["bullet_physics_enabled"];
    }
}

/*
    Class Name: MissionSetup
    Description: A class for setting up a mission
*/
class MissionSetup extends GamemodeSetup {
    /*
        Method Name: constructor
        Method Parameters: TODO
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(lobby){
        super();
        this.lobby = lobby;
        this.mission = PROGRAM_DATA["missions"][0];
        this.botCounts = {};
        this.allyDifficulty = "easy";
        this.axisDifficulty = "easy";
        this.bulletPhysicsEnabled = PROGRAM_DATA["settings"]["use_physics_bullets"];
    }

    getType(){
        return "mission";
    }

    /*
        Method Name: updatePreference
        Method Parameters:
            username:
                User who's preference to update
            entityType:
                The user's new entity type
        Method Description: Updates the preferred plane of a user
        Method Return: void
    */
    updatePreference(username, entityType){
        this.participantTypes[username] = entityType;
    }

    /*
        Method Name: getDetails
        Method Parameters: None
        Method Description: Provides details about a mission
        Method Return: JSON Object
    */
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
        jsonRep["mission_id"] = this.mission["id"];
        jsonRep["ally_difficulty"] = this.allyDifficulty;
        jsonRep["axis_difficulty"] = this.axisDifficulty;
        jsonRep["bullet_physics_enabled"] = this.bulletPhysicsEnabled;
        return jsonRep;
    }

    /*
        Method Name: updateSettings
        Method Parameters:
            newSettingsJSON:
                A JSOn object with new settings
        Method Description: Updates the setting of a dogfight from a provided JSON object
        Method Return: void
    */
    updateSettings(newSettingsJSON){
        this.allyDifficulty = newSettingsJSON["ally_difficulty"];
        this.axisDifficulty = newSettingsJSON["axis_difficulty"];
        this.bulletPhysicsEnabled = newSettingsJSON["bullet_physics_enabled"];
        let oldID = this.mission["id"];
        this.mission = PROGRAM_DATA["missions"][newSettingsJSON["id"]];
        // If changed mission
        if (oldID != this.mission["id"]){
            this.resetUserType();
        }
    }

    resetUserType(){
        this.participantTypes = {};
        this.lobby.sendAllButHost({"mail_box": "reset_participant_type", "new_mission_id": this.mission["id"]});
    }
}

// Start Up
const SERVER = new WW2PGServer(SERVER_DATA["server_data"]["server_port"]);