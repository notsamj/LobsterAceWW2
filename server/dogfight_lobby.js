/*
    Known assumptions:
    clientID not current registered
    Data from user in expected format
*/
const FILE_DATA = require("../data/data_json.js");
class DogfightLobby {
    constructor(gameMode){
        this.gameMode = gameMode; 
        this.participants = [];
        this.started = false;
    }

    readyMessage(clientWS, clientID, clientData){
        if (this.started){ return; }
        if (!this.hasParticipant(clientID)){
            this.participants.push(new Participant(clientWS, clientID, clientData));
            setTimeout(() => { this.checkReady(); }, FILE_DATA["constants"]["TIME_TO_READY_UP"])
            return;
        }
        let participant = this.getParticipant(clientID);
        if (!participant.isConnected()){
            participant.welcomeBack();
        }
        participant.setData(clientData);
        this.checkReady();
    }

    checkReady(){
        if (this.started){ return; }
        let ready = this.isReady();
        let entities = this.getPlanes();
        this.started = true;
        this.setupDisconnectListeners();
        this.gameMode.start(entities, this);
    }

    isReady(){
        for (let participant of this.participants){
            if (!participant.isReady()){
                return false;
            }
        }
        return true;
    }

    getParticipant(participantID){
        for (let participant of this.participants){
            if (participantID == participant.getID()){
                return participant;
            }
        }
        return null;
    }

    hasParticipant(participantID){
        return this.getParticipant(participantID) != null;
    }

    keepAlive(clientID){
        for (let client of this.participants){
            if (client.getID() == clientID){
                client.keepAlive(false);
                return;
            }
        }
        // TODO: Actually throw an error?
        console.error("Keep Alive received for unknown client.")
    }

    getPlanes(){
        let planeUserData = [];
        for (let participant of this.participants){
            if (!participant.isConnected()){ continue; }
            let data = participant.getData();
            planeUserData.push(data);
        }
        return planeUserData;
    }

    setupDisconnectListeners(){
        for (let participant of this.participants){
            let participantID = participant.getID();
            participant.addOnDisconnect(() => {
                this.gameMode.killPlane(participantID);
            });
        }
    }

    reset(){
        // TODO:
    }

    sendAll(message){
        for (let participant of this.participants){
            if (!participant.isConnected()){ continue; }
            participant.send(message);
        }
    }
}

class Participant {
    constructor(clientWS, clientID, clientData){
        this.clientID = clientID;
        this.clientData = clientData;
        this.clientWS = clientWS;
        this.ready = true;
        this.connectionDead = false;
        this.keepAliveWaiting = false;
        this.callOnDisconnect = [];
        this.intervalID = setInterval(async () => {
            await this.keepAlive(true);
        }, FILE_DATA["constants"]["KEEP_ALIVE_INTERVAL"]);
    }

    setData(data){
        this.clientData = data;
    }

    getData(){
        return this.clientData;
    }

    isConnected(){
        return !this.connectionDead;
    }

    isReady(){
        return this.ready && this.isConnected();
    }

    keepAlive(scheduled){
        if (!this.isConnected()){ return; }
        if (!scheduled){ this.keepAliveWaiting = false; return; }
        if (this.keepAliveWaiting){
            this.connectionDead = true;
            clearInterval(this.intervalID);
        }else{
            this.keepAliveWaiting = true;
            this.clientWS.send("KEEPALIVE");
        }
    }

    notReady(){
        this.ready = false;
    }

    getID(){
        return this.clientID;
    }

    addOnDisconnect(func){
        this.callOnDisconnect.push(func);
    }

    disconnect(){
        if (!this.isConnected()){ return; }
        this.connectionDead = true;
        clearInterval(this.intervalID);
        this.connectionDead = true;
        for (let func of this.callOnDisconnect){
            func();
        }
    }

    welcomeBack(){
        this.intervalID = setInterval(async () => {
            await this.keepAlive(true);
        }, FILE_DATA["constants"]["KEEP_ALIVE_INTERVAL"]);
        this.connectionDead = false;
    }

    send(message){
        this.clientWS.send(message);
    }
}
module.exports = DogfightLobby;