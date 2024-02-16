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
        this.ip = PROGRAM_DATA["settings"]["server_ip"];
        this.port = PROGRAM_DATA["settings"]["server_port"];
        this.setup = false;
        this.socket = null;
        this.openedLock = new Lock();
        this.stateManager = new ConnectionStateManager();
    }

    setupConnection(){
        this.setup = true;
        this.socket = new WebSocket("ws://" + this.ip + ":" + this.port);
        this.socket.addEventListener("open", (event) => {
            console.log("Connection to server opened.");
            this.openedLock.unlock();
        });
        this.socket.addEventListener("message", (event) => {
            this.stateManager.sendToHandler(event);
        });
        // Wait for connection to open
        await this.openedLock.awaitUnlock();
        // Send the password
        console.log("Sending the password...")
        let data = {
            "password": USER_DATA["server_data"]["password"],
            "username": USER_DATA["name"]
        }
        this.scoket.send(JSON.stringify(data));
    }

    /*
        Return value: JSON if got a response, false if not
    */
    async request(){
        if (!this.isSetup()){ await this.setupConnection(); }
        // TODO: Get refresh data
        return false;
    }

    isSetup(){
        return this.setup;
    }
}

class ConnectionStateManager {
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