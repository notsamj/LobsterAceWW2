NotSamLinkedList = require("../scripts/notsam_linked_list.js");
class ClientList {
    constructor(server){
        this.server = server;
        this.clients = new NotSamLinkedList();
        this.nextClientID = 0;
    }

    getValues(){
        return this.clients;
    }

    add(newClient, callBack){
        this.clients.push(new Client(newClient, this.nextClientID++, this.server))
    }

    getClient(id){
        for (let [client, clientIndex] of this.clients){
            if (client.getID() == id){
                return client;
            }
        }
        return null;
    }

    hasClient(id){
        this.getClient(id) != null;
    }
}

class Client {
    constructor(clientWS, clientID, server){
        this.server = server;
        this.id = clientID;
        this.ws = clientWS;
        this.ws.on("message", (data) => {
            this.server.handleMessage(this.id, data);
        });
        this.plane = null;
    }

    send(message){
        this.ws.send(message);
    }

    hasPlane(){
        return this.getPlane() != null;
    }

    getPlane(){
        return this.plane;
    }

    updatePlane(planeData){
        this.plane.update(planeData);
    }

    getWS(){
        return this.ws;
    }

    setPlane(plane){
        this.plane = plane;
    }


}
module.exports = ClientList;