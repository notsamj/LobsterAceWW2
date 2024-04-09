class LocalDogfightClient extends LocalClient {
    constructor(dogfightJSON){
        super(new LocalDogfight(dogfightJSON));
    }
}