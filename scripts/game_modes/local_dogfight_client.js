class LocalDogfightClient extends LocalClient {
    constructor(dogfightJSON){
        super();
        this.localDogfight = new LocalDogfight(dogfightJSON);
    }

    async tick(){
        if (this.isPaused()){ return; }
        await this.localDogfight.tick();
    }
}