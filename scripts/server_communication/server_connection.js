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
        this.setup = false;
        this.socket = null;
        this.openedLock = new Lock();
        this.openedLock.lock();
        this.messageCallbacks = new NotSamLinkedList();
    }

    async setupConnection(){
        this.setup = true;
        this.socket = new WebSocket("ws://" + this.ip + ":" + this.port);
        this.socket.addEventListener("open", (event) => {
            console.log("Connection to server opened.");
            this.openedLock.unlock();
        });
        this.socket.addEventListener("message", (event) => {
            let data = event.data;
            if (MAIL_SERVICE.deliver(data)){
                return;
            }
            this.handledByDefault(data);
        });
        this.socket.addEventListener("error", (event) => {
            menuManager.addTemporaryMessage("Connection to server failed.", "red", 5000);
        });
        this.heartBeatInterval = setInterval(() => { this.heartBeat(); }, 9000);
        // Wait for connection to open (or give up after 5 seconds)
        await this.openedLock.awaitUnlock();
        // Send the password
        console.log("Sending the password...")
        // Check for success -> if not success then display message
        let response = await MAIL_SERVICE.sendJSON("setup", { "username": USER_DATA["name"] });
        // If null -> no response
        if (response == null){
            menuManager.addTemporaryMessage("No response from the server.", "red", 5000);
        }else if (response["success"] == false){
            menuManager.addTemporaryMessage("Failed to connect: " + response["reason"], "red", 5000);
        }
        console.log("Logged in");
    }

    handledByDefault(data){
        if (this.isErrorMessage(data)){
            this.handleError(data);
            return true;
        }
        if (this.handleHeartbeat(data)){
            return true;
        }
        if (this.startGameMessage(data)){
            return true;
        }
        return false;
    }

    startGameMessage(data){
        let dataJSON = JSON.parse(data);
        if (!objectHasKey(dataJSON, "message")){
            return false;
        }
        if (dataJSON["message"] == "game_started"){
            let translator = new DogfightRemoteTranslator();
            activeGameMode = new DogfightClient(translator);
            menuManager.switchTo("game");
            return true;
        }
        return false;
    }

    handleHeartbeat(data){
        let dataJSON = JSON.parse(data);
        if (dataJSON["action"] == "ping"){
            this.sendJSON({ "action": "pong" });
            return true;
        }
        return false;
    }

    /*
        Return value: JSON if got a response, false if not
    */
    async refresh(){
        if (!this.isSetup()){ await this.setupConnection(); }
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

    async heartBeat(){
       let response = await MAIL_SERVICE.sendJSON("heartbeat", { "action": "ping" });
        if (!response){
            menuManager.addTemporaryMessage("Heartbeat failed.", "red", 10000);
            clearInterval(this.heartBeatInterval);
            return false;
        }
        return response;
    }

    async sendMail(jsonObject, mailBox, timeout=1000){
        return await MAIL_SERVICE.sendJSON(mailBox, jsonObject, timeout);
    }

    sendJSON(jsonObject){
        jsonObject["password"] = USER_DATA["server_data"]["password"]
        this.send(JSON.stringify(jsonObject));
    }

    send(message){
        this.socket.send(message);
    }

    isSetup(){
        return this.setup;
    }

    addCallback(messageResponse){
        this.messageCallbacks.add(messageResponse);
    }

    isErrorMessage(message){
        // TODO
        return false;
    }

    handleError(message){
        // TODO
    }
}