class LocalDogfight extends Dogfight {
    constructor(startingEntities){
        super(startingEntities);
        scene.setEntities(startingEntities);
        scene.setFocusedEntity(startingEntities[0]);
        scene.enable();
    }

    display(){
        if (!this.isRunning()){
            Menu.makeText("Winner: " + this.winner, "green", 500, 800, 1000, 300)
        }
    }
}