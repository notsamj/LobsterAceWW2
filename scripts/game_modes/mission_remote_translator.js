// TODO: Comment class
class MissionRemoteTranslator {
    constructor(dogfightJSON){
        this.lastState = null;
        this.getStateLock = new Lock();
    }

    async getState(){
        if (this.getStateLock.isReady()){
            this.getStateLock.lock();
            this.lastState = await SERVER_CONNECTION.sendMail({"action": "get_state"}, "get_state");
            this.getStateLock.unlock();
        }
        return this.lastState; 
    }

    async sendPlanePosition(planeJSON){
        SERVER_CONNECTION.sendJSON({"action": "plane_update", "plane_update": planeJSON, "password": USER_DATA["password"]});
    }

    async end(){
        SERVER_CONNECTION.sendJSON({"action": "leave_game", "password": USER_DATA["password"]});
    }

    // Dud methods meant for local dogfight
    pause(){}
    unpause(){}
}