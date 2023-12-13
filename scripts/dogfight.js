class Dogfight extends GameMode {
    constructor(startingEntities){
        super();
        scene.setEntities(startingEntities);
        scene.setFocusedEntity(startingEntities[0].getID());
        this.startingEntities = startingEntities;
        this.running = true;
        this.winner = null;
        this.isATestSession = this.isThisATestSession();
        scene.enable();
    }

    isRunning(){
        return this.running;
    }

    tick(){
        if (!this.isRunning()){
            return;
        }
        this.checkForEnd();
    }

    checkForEnd(){
        let allyCount = 0;
        let axisCount = 0;
        for (let entity of this.startingEntities){
            if (entity instanceof FighterPlane && entity.getHealth() > 0){
                let fighterPlane = entity;
                if (planeModelToAlliance(fighterPlane.getPlaneClass()) == "Axis"){
                    axisCount++;
                }else{
                    allyCount++;
                }
            }
        }
        // Check if the game is over
        if ((axisCount == 0 || allyCount == 0) && !this.isATestSession){
            this.winner = axisCount != 0 ? "Axis" : "Allies";
            this.running = false;
        }
    }

    display(){
        if (!this.isRunning()){
            Menu.makeText("Winner: " + this.winner, "green", 500, 800, 1000, 300)
        }
    }

    // No winner in a test session
    isThisATestSession(){
        let allyCount = 0;
        let axisCount = 0;
        for (let entity of this.startingEntities){
            if (entity instanceof FighterPlane){
                let fighterPlane = entity;
                if (planeModelToAlliance(fighterPlane.getPlaneClass()) == "Axis"){
                    axisCount++;
                }else{
                    allyCount++;
                }
            }
        }
        return allyCount == 0 || axisCount == 0;
    }
}