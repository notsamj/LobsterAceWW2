/*
    Class Name: BiasedBotBomberTurret
    Description: A subclass of the BotBomberTurret with biases for its actions
    Note: (TODO) This is a WORK IN PROGRESS but functional just no biases currently active
*/
class BiasedBotBomberTurret extends BotBomberTurret {
    /*
        Method Name: constructor
        Method Parameters:
            xOffset:
                The x offset of the turret from the center of the attached plane
            yOfset:
                The y offset of the turret from the center of the attached plane
            fov1:
                An angle (degrees) representing an edge of an angle which the turret can shoot within
            fov2:
                An angle (degrees) representing an edge of an angle which the turret can shoot within (second edge in a clockwise direction)
            rateOfFire:
                The number of milliseconds between shots that the turret can take
            scene:
                A Scene object related to the fighter plane
            plane:
                The bomber plane which the turret is attached to
            biases:
                An object containing keys and bias values
            autonomous:
                Whether or not the plane may control itself
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(xOffset, yOffset, fov1, fov2, rateOfFire, scene, plane, biases, autonomous){
        super(xOffset, yOffset, fov1, fov2, rateOfFire, scene, plane, autonomous);
        this.biases = biases;
        this.shootingAngle = 0;
        this.shootCD = new TickLock(this.shootCD.getCooldown() * this.biases["rate_of_fire_multiplier"]);
    }

    /*
        Method Name: getShootingAngle
        Method Parameters: None
        Method Description: Determines the shooting angle of the turret.
        Method Return: int
    */
    getShootingAngle(){
        return fixDegrees(this.shootingAngle + this.biases["shooting_angle_offset"]);
    }

    /*
        Method Name: create
        Method Parameters:
            gunObject:
                A JSON object containing information about the turret
            scene:
                A Scene object related to the fighter plane
            plane:
                The bomber plane which the turret is attached to
            biases:
                An object containing keys and bias values
            autonomous:
                Whether or not the turret is autonomous
        Method Description: Creates an instance of a biased bot bomber turret and returns it
        Method Return: BiasedBotBomberTurret
    */
    static create(gunObject, scene, plane, biases){
        return new BiasedBotBomberTurret(gunObject["x_offset"], gunObject["y_offset"], gunObject["fov_1"], gunObject["fov_2"], gunObject["rate_of_fire"], scene, plane, biases, autonomous);
    }
}