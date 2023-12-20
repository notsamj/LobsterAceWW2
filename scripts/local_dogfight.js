class LocalDogfight extends Dogfight {
    constructor(startingEntities){
        super(startingEntities, scene);
        this.scene.setEntities(startingEntities);
        this.scene.setFocusedEntity(startingEntities[0]);
        this.scene.enable();
    }

    display(){
        if (!this.isRunning()){
            Menu.makeText("Winner: " + this.winner, "green", 500, 800, 1000, 300)
        }
    }
}