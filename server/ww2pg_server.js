// TODO: File needs comments
const WebSocketServer = require("ws").WebSocketServer;
// TODO: Import linked list
// TODO: Import SimpleCryptography
const SIMPLE_CRYPTOGRAPHY = new SimpleCryptography();
const SERVER = new WW2PGServer();
class WW2PGServer {
    constructor(port){
        this.server = new WebSocketServer({ "port": port })
        this.port = port;
        this.clients = new NotSamLinkedList();
        console.log("Server on and listening to port: %d", port);
        // TODO: Change this to something else with authentication
        this.server.on("connection", (ws) => {
            this.clients.add(new Client(ws));
        });
    }
}

class Client {
    constructor(ws){
        this.ws = ws;
        this.username = null;
        this.stateManager = new ClientStateManager();
        this.stateManager.register(ClientStateManager.prospective, (encryptedData) => { this.verifyClient(encryptedData); });
        this.stateManager.register(ClientStateManager.cancelled, (encryptedData) => {}); // If cancelled ignore all data
        this.ws.on("connection", (encryptedData) => {
            this.handleMessage(encryptedData);
        });
    }

    isVerified(){
        return this.stateManager.getState() != ClientStateManager.cancelled && this.stateManager.getState() != ClientStateManager.prospective;
    }

    handleMessage(encryptedData){
        this.stateManager.sendToHandler(encryptedData);
    }

    verifyClient(encryptedData){
        // If bad message then quit the program (This is just a fun program so doesn't have to handle these things rationally)
        if (!SIMPLE_CRYPTOGRAPHY.validFormat(encryptedData)){
            console.error("Invalid data received.");
            process.exit(1);
        }

        let dataJSON = SIMPLE_CRYPTOGRAPHY.decrypt(encryptedData);
        let data = JSON.parse(dataJSON);
        // If bad password then quit the program (This is just a fun program so doesn't have to handle these things rationally)
        if (data["password"] != PROGRAM_DATA["server_data"]["password"]){
            console.error("Invalid password received.");
            process.exit(1);
        }

        // Password matches assume the rest of the data is correct (e.g. username not "")
        let username = data["username"];
        // If username is taken then cancel this user
        if (SERVER.usernameTaken(username)){
            this.ws.send("error_username_taken");
            this.stateManager.goto(ClientStateManager.cancelled);
            return;
        }
        this.username = username;
        this.stateManager.goto(ClientStateManager.waiting);
    }
}

class ClientStateManager {
    static prospective = 0;
    static cancelled = 1;
    static waiting = 2;

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