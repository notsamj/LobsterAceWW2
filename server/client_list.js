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

    add(id, ws){
        this.clients.push(new Client(ws, id, this.server))
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
        this.dead = false;

    }

    isAlive(){
        return !this.isDead();
    }

    isDead(){
        return this.dead;
    }

    send(message){
        if (this.dead){ return; }
        try{
            this.ws.send(message);
        }catch(e){
            this.disconnect();
        }
    }

    getWS(){
        return this.ws;
    }

    addOnDisconnect(funcToCall){
        this.onDisconnect.push(funcToCall);
    }

    disconnect(){
        this.dead = true;
        for (let funcToCall of this.onDisconnect){
            funcToCall();
        }
    }
 

}
module.exports = ClientList;