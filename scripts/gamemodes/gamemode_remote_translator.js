/*
    Class Name: GamemodeRemoteTranslator
    Description: Provides a conduit for communication between a Gamemode client and a server
*/
class GamemodeRemoteTranslator {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.lastState = null;
        this.getStateLock = new Lock();
    }

    /*
        Method Name: getState
        Method Parameters: None
        Method Description: Requests a state from the server. Returns the last received state.
        Method Return: JSON Object representing the state of a Dogfight game
    */
    async getState(){
        if (this.getStateLock.isReady()){
            this.getStateLock.lock();
            this.lastState = await SERVER_CONNECTION.sendMail({"action": "get_state"}, "get_state");
            this.getStateLock.unlock();
        }
        return this.lastState; 
    }

    /*
        Method Name: sendLocalPlaneData
        Method Parameters: 
            planeJSON:
                A json object with information about the local user's plane
        Method Description: Sends information about the local user's plane to the server
        Method Return: void
    */
    async sendLocalPlaneData(planeJSON){
        SERVER_CONNECTION.sendJSON({"action": "plane_update", "plane_update": planeJSON, "password": USER_DATA["password"]});
    }

    /*
        Method Name: end
        Method Parameters: None
        Method Description: Sends information the server that the player is leaving the game
        Method Return: void
    */
    async end(){
        SERVER_CONNECTION.sendJSON({"action": "leave_game", "password": USER_DATA["password"]});
    }
}