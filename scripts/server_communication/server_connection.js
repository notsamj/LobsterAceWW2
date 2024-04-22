/*
    Class Name: ServerConnection
    Description: An object used for handling server connections.
*/
class ServerConnection {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.ip = USER_DATA["server_data"]["server_ip"];
        this.port = USER_DATA["server_data"]["server_port"];
        this.connected = false;
        this.loggedIn = false;
        this.socket = null;
        this.setupSyncLock = new Lock();
        this.openedLock = new Lock();
        this.openedLock.lock();
        this.heartBeatLock = new Lock();
        this.sc = new SimpleCryptography(USER_DATA["server_data"]["secret_seed"]);
        MAIL_SERVICE.addMonitor("error", (errorMessage) => {this.handleError(errorMessage);});
        MAIL_SERVICE.addMonitor("lobby_end", (message) => {this.handleLobbyEnd(message)});
        MAIL_SERVICE.addMonitor("game_start", (message) => {this.handleGameStart(message)});
        MAIL_SERVICE.addMonitor("plane_movement_update", (message) => {this.handlePlaneMovementUpdate(message)});
        MAIL_SERVICE.addMonitor("heart_beat_receive", (message) => {this.receiveHeartBeat(message)});
        MAIL_SERVICE.addMonitor("reset_participant_type", (message) => {this.handleResetParticipantType(message)});
    }

    /*
        Method Name: handlePlaneMovementUpdate
        Method Parameters:
            messageJSON:
                A json object with a message from the server
        Method Description: Sends a new plane update to the game
        Method Return: void
    */
    handlePlaneMovementUpdate(messageJSON){
        if (GAMEMODE_MANAGER.getActiveGamemode() == null){ return; }
        // TODO: Incase activagmemode is null or not a client?
        GAMEMODE_MANAGER.getActiveGamemode().handlePlaneMovementUpdate(JSON.parse(messageJSON));
    }

    /*
        Method Name: handleResetParticipantType
        Method Parameters:
            messageJSON:
                A json object with a message from the server
        Method Description: Resets the participant plane type
        Method Return: void
    */
    handleResetParticipantType(messageJSON){
        if (messageJSON["type"] == "mission"){
            MENU_MANAGER.getMenuByName("participant").resetParticipantType(PROGRAM_DATA["missions"][messageJSON["new_mission_id"]]);
        }else{ // Dogfight
            MENU_MANAGER.getMenuByName("participant").resetParticipantType();
        }
    }

    /*
        Method Name: isLoggedIn
        Method Parameters: None
        Method Description: Checks if logged in
        Method Return: Boolean
    */
    isLoggedIn(){
        return this.connected && this.loggedIn;
    }

    /*
        Method Name: isConnected
        Method Parameters: None
        Method Description: Checks if the connection is active
        Method Return: Boolean
    */
    isConnected(){
        return this.connected;
    }

    /*
        Method Name: reset
        Method Parameters: None
        Method Description: Resets the connection
        Method Return: void
    */
    async reset(){
        this.openedLock.lock();
        this.heartBeatLock.unlock();
        clearInterval(this.heartBeatInterval); // Is this a problem if heart beat interval is null?
        await this.setupConnection();
    }

    /*
        Method Name: setupConnection
        Method Parameters: None
        Method Description: Starts up a connection to the server
        Method Return: void
    */
    async setupConnection(){
        if (this.setupSyncLock.isLocked()){ return; }
        this.setupSyncLock.lock();
        // If setting up connection -> These are both false
        this.loggedIn = false;
        this.connected = false;

        this.socket = new WebSocket("ws://" + this.ip + ":" + this.port);
        this.socket.addEventListener("open", (event) => {
            console.log("Connection to server opened.");
            this.connected = true;
            this.openedLock.unlock();
        });
        this.socket.addEventListener("message", (event) => {
            let data = event.data;
            if (!this.sc.matchesEncryptedFormat(data)){
                throw new Error("Data in bad format!");
            }
            PERFORMANCE_TIMER.get("decrypt").start();
            let decryptedData = this.sc.decrypt(data);
            PERFORMANCE_TIMER.get("decrypt").end();
            let dataJSON = JSON.parse(decryptedData);
            if (dataJSON["password"] != USER_DATA["server_data"]["password"]){
                console.log(dataJSON)
                throw new Error("Received invalid password!");
            }
            if (MAIL_SERVICE.deliver(decryptedData)){
                return;
            }
            console.error("Received unknown data:", decryptedData);
        });
        this.socket.addEventListener("error", (event) => {
            MENU_MANAGER.addTemporaryMessage("Connection to server failed.", "#ff0000", 5000);
            this.openedLock.unlock();
            this.loggedIn = false;
            this.connected = false;
            clearInterval(this.heartBeatInterval);
        });

        // Wait for connection to open (or give up after 5 seconds)
        await this.openedLock.awaitUnlock();
        // If the setup failed then return
        if (this.isConnected()){
            // Send the password
            console.log("Sending the password...")
            // Check for success -> if not success then display message
            let response = await MAIL_SERVICE.sendJSON("setup", { "username": USER_DATA["name"] });
            // If null -> no response
            if (response == null){
                MENU_MANAGER.addTemporaryMessage("No response from the server.", "#ff0000", 5000);
            }else if (response["success"] == false){
                MENU_MANAGER.addTemporaryMessage("Failed to connect: " + response["reason"], "#ff0000", 5000);
            }else{
                // Else working
                this.loggedIn = true;
                console.log("Logged in");
                // Time to set up the heart beat
                this.heartBeatInterval = setInterval(() => { this.sendHeartBeat(); }, 1000);
            }
        }
        this.setupSyncLock.unlock();
    }

    /*
        Method Name: handleGameStart
        Method Parameters:
            data:
                A message from the server
        Method Description: Starts the game
        Method Return: void
    */
    handleGameStart(data){
        let dataJSON = JSON.parse(data);
        if (!objectHasKey(dataJSON, "message")){
            return;
        }
        if (dataJSON["message"] == "game_started"){
            if (dataJSON["game_type"] == "dogfight"){
                GAMEMODE_MANAGER.setActiveGamemode(new RemoteDogfightClient());
            }else{ // Mission
                GAMEMODE_MANAGER.setActiveGamemode(new RemoteMissionClient());
            }
            MENU_MANAGER.switchTo("game");
        }
    }

    /*
        Method Name: receiveHeartBeat
        Method Parameters: None
        Method Description: Replies to a heartbeat
        Method Return: void
    */
    receiveHeartBeat(data){
        let dataJSON = JSON.parse(data);
        if (dataJSON["action"] == "ping"){
            this.sendJSON({ "action": "pong" });
        }
    }

    /*
        Method Name: refresh
        Method Parameters: None
        Method Description: Refreshs the server join menu
        Method Return: JSON if got a response, false if not
    */
    async refresh(){
        if (!this.isLoggedIn()){ await this.reset(); }
        return await MAIL_SERVICE.sendJSON("refresh", { "action": "refresh" });
    }

    /*
        Method Name: hostRequest
        Method Parameters: None
        Method Description: Requests to host a game
        Method Return: JSON if got a response, false if not
    */
    async hostRequest(){
        return await MAIL_SERVICE.sendJSON("host", { "action": "host" });
    }

    /*
        Method Name: joinRequest
        Method Parameters: None
        Method Description: Requests to join a game
        Method Return: JSON if got a response, false if not
    */
    async joinRequest(){
        return await MAIL_SERVICE.sendJSON("join", { "action": "join" });
    }

    /*
        Method Name: hostUpdateSettings
        Method Parameters: None
        Method Description: Sends out a message that the host has updated the game settings
        Method Return: void
    */
    async hostUpdateSettings(newSettings){
        this.sendJSON({ "action": "update_settings", "new_settings": newSettings });
    }

    /*
        Method Name: updateUserPreference
        Method Parameters:
            newPlaneType:
                The new type of plane the user wishes to use
        Method Description: Sends the user's update plane preference to the server
        Method Return: void
    */
    async updateUserPreference(newPlaneType){
        this.sendJSON({ "action": "plane_update", "plane_update": newPlaneType });
    }

    /*
        Method Name: sendHeartBeat
        Method Parameters: None
        Method Description: Sends a heart beat message to the server
        Method Return: void
    */
    async sendHeartBeat(){
        if (!this.heartBeatLock.isReady() || !this.isLoggedIn()){ return; }
        //console.log("Sending from sendheartbeat", this.heartBeatLock.isLocked())
        await this.heartBeatLock.awaitUnlock(true);
        //console.log("Now its locked?", this.heartBeatLock.isLocked())
        let response = await MAIL_SERVICE.sendJSON("heart_beat", { "action": "ping" });
        if (!response){
            MENU_MANAGER.addTemporaryMessage("Heartbeat failed.", "#ff0000", 10000);
            clearInterval(this.heartBeatInterval);
            this.setup = false;
        }
        //console.log("Unlocking.....")
        this.heartBeatLock.unlock();
    }

    /*
        Method Name: sendMail
        Method Parameters:
            jsonObject:
                A json object to send
            mailBox:
                The mailbox to use
            timeout:
                The number of milliseconds to wait before giving up on receiving a response
        Method Description: Sends a message to the server
        Method Return: JSON Object
    */
    async sendMail(jsonObject, mailBox, timeout=1000){
        return await MAIL_SERVICE.sendJSON(mailBox, jsonObject, timeout);
    }

    /*
        Method Name: sendJSON
        Method Parameters:
            jsonObject:
                A json object to send to the server
        Method Description: Sends a json object to the server
        Method Return: void
    */
    sendJSON(jsonObject){
        jsonObject["password"] = USER_DATA["server_data"]["password"]
        this.send(JSON.stringify(jsonObject));
    }

    /*
        Method Name: send
        Method Parameters:
            message:
                A string to send to the server
        Method Description: Sends a string to the server. Encrypts it first.
        Method Return: void
    */
    send(message){
        this.socket.send(this.sc.encrypt(message));
    }

    /*
        Method Name: isSetup
        Method Parameters: None
        Method Description: Checks if the connection is setup
        Method Return: Boolean
    */
    isSetup(){
        return this.setup;
    }

    /*
        Method Name: handleError
        Method Parameters: 
            message:
                An error message (String)
        Method Description: Prints an error message to the screen
        Method Return: void
    */
    handleError(message){
        MENU_MANAGER.addTemporaryMessage(message, "#ff0000", 10000);
    }

    /*
        Method Name: handleLobbyEnd
        Method Parameters: None
        Method Description: Make appropriate arrangements when the lobby ends
        Method Return: void
    */
    handleLobbyEnd(){
        MENU_MANAGER.addTemporaryMessage("Lobby ended", "yellow", 5000);
        MENU_MANAGER.switchTo("main");
    }
}