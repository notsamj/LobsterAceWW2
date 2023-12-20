const WebSocketServer = require("ws").WebSocketServer;
const ClientList = require("./client_list.js");
class WSServer {
    constructor(port){
        this.server = new WebSocketServer({ "port": port })
        this.port = port;
        this.clients = new ClientList(this);
        console.log("Server on and listening to port: %d", port);
        this.server.on("connection", (newClient) => {
            this.clients.add(newClient);
        });
        this.registeredHandlers = [];
    }

    register(type, target, handlerFunc){
        this.registeredHandlers.push({"type": type, "target": target, "handlerFunc": handlerFunc});
    }

    handleMessage(client, data){
        let dataString = data.toString();
        let expectedFormat = /^((GET)|(PUT))_([A-Z]+)(_({[a-zA-Z0-9\",.\{\}\-:_\[\]]+}))?$/;
        let match = dataString.match(expectedFormat);
        if (!match){
            console.error("Bad request: %s", dataString);
            return;
        }
        let type = match[1];
        let target = match[4];
        for (let handler of this.registeredHandlers){
            if (handler["type"] == type && handler["target"] == target){
                handler["handlerFunc"](client, match);
                return;
            }
        }
        console.error("Bad request: %s", dataString);
    }

    sendAll(data){
        for (let [client, clientIndex] of this.clients.getValues()){
            client.send(data);
        }
    }
}
module.exports=WSServer;