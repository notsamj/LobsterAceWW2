// TODO: Comment class
class DogfightLocalTranslator {
    constructor(dogfightJSON){
        this.dogfight = new Dogfight(dogfightJSON);
    }

    async getState(){
        // TODO: Is the copy needed? I thought it might so lastState in client isn't updated by dogfight
        //return copyObject(this.dogfight.getLastState());
        return this.dogfight.getLastState();
    }

    async sendPlanePosition(planeJSON){
        this.dogfight.newPlaneJSON(planeJSON);
    }

    end(){
        this.dogfight.end();
    }

    pause(){
        this.dogfight.pause();
    }

    unpause(){
        this.dogfight.unpause();
    }
}