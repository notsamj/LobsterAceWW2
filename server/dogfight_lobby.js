class DogfightLobby {
    constructor(){
        this.participants = [];
        this.started = false;
    }

    addMember(client){
        this.participants.push(new Participant(client))
    }
}

class Participant {
    constructor(client){
        client.addOnDisconnect(() => {
            this.disconnect();
        })
        this.client = client;
    }

    getID(){
        return this.client.getID();
    }

    disconnect(){
        // TODO:
    }
}