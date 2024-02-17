/*
    Class Name: ServerConnection
    Description: An object used for handling server connections.
    TODO: Comment this class
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
            for (let [callback, callbackIndex] of this.messageCallbacks){
                callback.complete(event.data);
            }
            this.messageCallbacks.clear();
        });
        this.socket.addEventListener("error", (event) => {
            menuManager.addTemporaryMessage("Connection to server failed.", "red", 5000);
        });
        // Wait for connection to open (or give up after 5 seconds)
        await this.openedLock.awaitUnlock();
        // Send the password
        console.log("Sending the password...")
        let data = {
            "password": USER_DATA["server_data"]["password"],
            "username": USER_DATA["name"]
        }
        // Check for success -> if not success then display message
        let response = await MessageResponse.sendAndReceiveJSON(this.socket, data, this, 5000);
        // If null -> no response
        if (response == null){
            menuManager.addTemporaryMessage("No response from the server.", "red", 5000);
        }else if (response["success"] == false){
            menuManager.addTemporaryMessage("Failed to connect: " + response["reason"], "red", 5000);
        }
    }

    /*
        Return value: JSON if got a response, false if not
    */
    async request(){
        if (!this.isSetup()){ await this.setupConnection(); }
        let data = {
            "action": "refresh",
            "password": USER_DATA["server_data"]["password"]
        }
        let response = await MessageResponse.sendAndReceiveJSON(this.socket, data, this, 5000);
        if (!response){
            return false;
        }
        return response;
    }

    isSetup(){
        return this.setup;
    }

    addCallback(messageResponse){
        this.messageCallbacks.add(messageResponse);
    }
}

class MessageResponse {
    constructor(serverConnection, timeout){
        this.result = null;
        this.completedLock = new Lock();
        this.completedLock.lock();
        serverConnection.addCallback(this);
        setTimeout(() => { this.complete(); }, timeout)
    }

    complete(result=null){
        // If already completed return
        if (this.completedLock.isReady()){ return; }
        this.result = result;
        this.completedLock.unlock();
    }

    async awaitResponse(){
        // Wait for the lock to no longer be completed
        await this.completedLock.awaitUnlock();
        return this.result;
    }

    static async sendAndReceiveJSON(socket, messageJSON, serverConnection, timeout){
        return JSON.parse(await MessageResponse.sendAndReceive(socket, JSON.stringify(messageJSON), serverConnection, timeout));
    }

    static async sendAndReceive(socket, message, serverConnection, timeout){
        console.log("Sending:", message);
        socket.send(message);
        let messageResponse = new MessageResponse(serverConnection, timeout);
        let response = await messageResponse.awaitResponse();
        console.log("Received:", response);
        return response;
    }
}

