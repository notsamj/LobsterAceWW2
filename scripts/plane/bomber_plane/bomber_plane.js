/*
    Class Name: BomberPlane
    Description: Abstract class representing a Bomber Plane
*/
class BomberPlane extends Plane {
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
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene, angle=0, facingRight=true){
        super(planeClass, scene);
    }

    /*
        Method Name: getBombBayX
        Method Parameters: None
        Method Description: Calculates the location of the gun on the x axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getBombBayX(){
        let planeAngleRAD = toRadians(this.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedX = Math.cos(planeAngleRAD) * (FILE_DATA["plane_data"][this.getPlaneClass()]["BOMB_OFFSET_X"] * (this.isFacingRight() ? 1 : -1)) - Math.sin(planeAngleRAD) * FILE_DATA["plane_data"][this.getPlaneClass()]["BOMB_OFFSET_Y"] + this.getX();
        return rotatedX;
    }

    /*
        Method Name: getBombBayY
        Method Parameters: None
        Method Description: Calculates the location of the gun on the y axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getBombBayY(){
        let planeAngleRAD = toRadians(this.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedY = Math.sin(planeAngleRAD) * (FILE_DATA["plane_data"][this.getPlaneClass()]["BOMB_OFFSET_X"] * (this.isFacingRight() ? 1 : -1)) + Math.cos(planeAngleRAD) * FILE_DATA["plane_data"][this.getPlaneClass()]["BOMB_OFFSET_Y"] + this.getY();
        return rotatedY;
    }

    /*
        Method Name: dropBomb
        Method Parameters: None
        Method Description: Drops a bomb from the bomber
        Method Return: void
    */
    dropBomb(){
        SOUND_MANAGER.play("bomb", this.x, this.y);
        this.scene.addBomb(new Bomb(this.getBombBayX(), this.getBombBayY(), this.scene, this.getXVelocity(), this.getYVelocity()));
    }
}
