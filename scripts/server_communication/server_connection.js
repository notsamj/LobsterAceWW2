/*
    Class Name: ServerConnection
    Description: An object used for handling server connections.
    TODO: Comment this class
    TODO: Encryption and decryption
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
        MAIL_SERVICE.addMonitor("heart_beat_receive", (message) => {this.handleHeartbeat(message)});
        MAIL_SERVICE.addMonitor("reset_participant_type", (message) => {this.handleResetParticipantType(message)});
    }

    handleResetParticipantType(messageJSON){
        if (messageJSON["type"] == "mission"){
            menuManager.getMenuByName("participant").resetParticipantType(PROGRAM_DATA["missions"][messageJSON["new_mission_id"]]);
        }else{ // Dogfight
            menuManager.getMenuByName("participant").resetParticipantType();
        }
    }

    isLoggedIn(){
        return this.connected && this.loggedIn;
    }

    isConnected(){
        return this.connected;
    }

    async reset(){
        this.openedLock.lock();
        this.heartBeatLock.unlock();
        clearInterval(this.heartBeatInterval); // Is this a problem if heart beat interval is null?
        await this.setupConnection();
    }

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
            let decryptedData = this.sc.decrypt(data);
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
            menuManager.addTemporaryMessage("Connection to server failed.", "red", 5000);
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
                menuManager.addTemporaryMessage("No response from the server.", "red", 5000);
            }else if (response["success"] == false){
                menuManager.addTemporaryMessage("Failed to connect: " + response["reason"], "red", 5000);
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

    handleGameStart(data){
        let dataJSON = JSON.parse(data);
        if (!objectHasKey(dataJSON, "message")){
            return;
        }
        if (dataJSON["message"] == "game_started"){
            if (dataJSON["game_type"] == "dogfight"){
                let translator = new DogfightRemoteTranslator();
                activeGameMode = new RemoteDogfightClient(translator);
            }else{ // Mission
                let translator = new MissionRemoteTranslator();
                activeGameMode = new RemoteMissionClient(translator);
            }
            menuManager.switchTo("game");
        }
    }

    receiveHeartBeat(data){
        let dataJSON = JSON.parse(data);
        if (dataJSON["action"] == "ping"){
            this.sendJSON({ "action": "pong" });
        }
    }

    /*
        Return value: JSON if got a response, false if not
    */
    async refresh(){
        if (!this.isLoggedIn()){ await this.reset(); }
        return await MAIL_SERVICE.sendJSON("refresh", { "action": "refresh" });
    }

    async hostRequest(){
        return await MAIL_SERVICE.sendJSON("host", { "action": "host" });
    }

    async joinRequest(){
        return await MAIL_SERVICE.sendJSON("join", { "action": "join" });
    }

    async hostUpdateSettings(newSettings){
        this.sendJSON({ "action": "update_settings", "new_settings": newSettings });
    }

    async updateUserPreference(newPlaneType){
        this.sendJSON({ "action": "plane_update", "plane_update": newPlaneType });
    }

    async sendHeartBeat(){
        if (!this.heartBeatLock.isReady() || !this.isLoggedIn()){ return; }
        await this.heartBeatLock.awaitUnlock(true);
        let response = await MAIL_SERVICE.sendJSON("heart_beat", { "action": "ping" });
        if (!response){
            menuManager.addTemporaryMessage("Heartbeat failed.", "red", 10000);
            clearInterval(this.heartBeatInterval);
            this.setup = false;
        }
        this.heartBeatLock.unlock();
    }

    async receiveHeartBeat(){

    }

    async sendMail(jsonObject, mailBox, timeout=1000){
        return await MAIL_SERVICE.sendJSON(mailBox, jsonObject, timeout);
    }

    sendJSON(jsonObject){
        jsonObject["password"] = USER_DATA["server_data"]["password"]
        this.send(JSON.stringify(jsonObject));
    }

    send(message){
        this.socket.send(this.sc.encrypt(message));
    }

    isSetup(){
        return this.setup;
    }

    handleError(message){
        menuManager.addTemporaryMessage(message, "red", 10000);
    }

    handleLobbyEnd(){
        console.log("Got lobby end")
        menuManager.addTemporaryMessage("Lobby ended", "yellow", 5000);
        menuManager.switchTo("main");
    }
}