/*
    Class Name: BiasedBotBomberPlane
    Description: A subclass of the BotBomberPlane with biases for its actions
    Note: (TODO) This is a WORK IN PROGRESS but functional just no biases currently active
*/
class BiasedBotBomberPlane extends BotBomberPlane {
    /*
        Method Name: constructor
        Method Parameters:
            planeClass:
                A string representing the type of plane
            scene:
                A Scene object related to the fighter plane
            angle:
                The starting angle of the fighter plane (integer)
            facingRight:
                The starting orientation of the fighter plane (boolean)
            biases:
                An object containing keys and bias values
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene, angle, facingRight, biases){
        super(planeClass, scene, angle, facingRight);
        this.currentEnemyID = null;
        this.udLock = new CooldownLock(40);
        this.lrCDLock = new CooldownLock(10);
        this.biases = biases;
        this.generateGuns(biases);
    }

    /*
        Method Name: generateGuns
        Method Parameters: None
        Method Description: Create gun objects for the plane
        Method Return: void
    */
    generateGuns(biases){
        this.guns = [];
        for (let gunObj of FILE_DATA["plane_data"][this.planeClass]["guns"]){
            this.guns.push(BiasedBotBomberTurret.create(gunObj, this.scene, this, biases));
        }
    }

    /*
        Method Name: createBiasedPlane
        Method Parameters: 
            planeClass:
                A string representing the type of the plane
            scene:
                A scene objet related to the plane
        Method Description: Return the max shooting distance of this biased plane
        Method Return: float
    */
    static createBiasedPlane(planeClass, scene){
        let biases = {};
        for (let [key, bounds] of Object.entries(FILE_DATA["ai"]["bias_ranges"])){
            let upperBound = bounds["upper_bound"];
            let lowerBound = bounds["lower_bound"];
            let usesFloatValue = Math.floor(upperBound) != upperBound || Math.floor(lowerBound) != lowerBound;
            biases[key] = usesFloatValue ? randomFloatBetween(lowerBound, upperBound) : randomNumberInclusive(lowerBound, upperBound);    
        }
        return new BiasedBotBomberPlane(planeClass, scene, true, 0, biases); // Temporary values some will be changed
    }
}