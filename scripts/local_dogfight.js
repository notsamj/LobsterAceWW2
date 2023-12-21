class LocalDogfight extends Dogfight {
    constructor(startingEntities){
        super(scene);
        this.scene.setEntities(startingEntities);
        this.scene.setFocusedEntity(startingEntities[0]);
        this.scene.enable();
        this.running = true;
        this.start(startingEntities);
    }

    display(){
        if (!this.isRunning()){
            Menu.makeText("Winner: " + this.winner, "green", 500, 800, 1000, 300)
        }
    }
}