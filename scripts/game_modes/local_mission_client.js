class LocalMissionClient extends LocalClient {
    constructor(){
        super();
        this.localMission = new LocalMission();
    }
    
    async tick(){
        if (this.isPaused()){ return; }
        await this.localMission.tick();
    }

    display(){
        this.localMission.display();
    }
}