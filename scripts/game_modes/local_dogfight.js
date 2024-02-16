/*
    Class Name: LocalDogfight
    Description: A subclass of Dogfight that is meant for only locally running dogfights
*/
class LocalDogfight extends Dogfight {
    /*
        Method Name: constructor
        Method Parameters:
            startingEntities:
                The planes (and maybe free cam) that are fighting
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(startingEntities){
        super(scene);
        this.scene.setEntities(startingEntities);
        this.scene.setFocusedEntity(startingEntities[0]);
        this.scene.enable();
        this.running = true;
        this.start(startingEntities);
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Display stats if the fight is over
        Method Return: void
    */
    display(){
        if (!this.isRunning()){
            AfterMatchStats.display();
        }
    }
}