const DogFight = require("../scripts/dogfight.js");
class ServerDogFight extends DogFight {
    constructor(startingEntities, scene){
        super()
        this.scene = scene;
    }
}