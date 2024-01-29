/*
    Class Name: BomberTurret
    Description: Abstract class representing a Turret attached to a Bomber plane
*/
class BomberTurret extends Turret {
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
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(xOffset, yOffset, fov1, fov2, rateOfFire, scene, plane){
        super(null, null, fov1, fov2, rateOfFire, scene);
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.plane = plane;
        this.model = plane.getPlaneClass();
    }

    /*
        Method Name: getX
        Method Parameters: None
        Method Description: Calculates the location of the turret on the x axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getX(){
        let planeAngleRAD = toRadians(this.plane.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedX = Math.cos(planeAngleRAD) * this.getXOffset() - Math.sin(planeAngleRAD) * this.getYOffset() + this.plane.getX();
        return rotatedX;
    }

    /*
        Method Name: getY
        Method Parameters: None
        Method Description: Calculates the location of the turret on the y axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getY(){
        let planeAngleRAD = toRadians(this.plane.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedY = Math.sin(planeAngleRAD) * this.getXOffset() + Math.cos(planeAngleRAD) * this.getYOffset() + this.plane.getY();
        return rotatedY;
    }

    /*
        Method Name: getXOffset
        Method Parameters: None
        Method Description: Calculates the offset of the turret in relation to the x axis and considering the left/right orientation of the attached plane.
        Method Return: float
    */
    getXOffset(){
        return this.xOffset * (this.plane.isFacingRight() ? 1 : -1);
    }

    /*
        Method Name: getYOffset
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getYOffset(){
        return this.yOffset;
    }

    /*
        Method Name: isFacingRight
        Method Parameters: None
        Method Description: Determines if the attacked plane is facing left/right
        Method Return: boolean, true -> facing right, false -> not facing right
    */
    isFacingRight(){
        return this.plane.isFacingRight();
    }

    /*
        Method Name: getFov1
        Method Parameters: None
        Method Description: Determines the edge angle of the field of view (the end with the other one being in a clockwise direction)
        Method Return: int
    */
    getFov1(){
        let adjustedFov = !this.isFacingRight() ? (180 - this.fov2) : this.fov1;
        if (!this.isFacingRight()){
            adjustedFov += 180;
        }
        return fixDegrees(adjustedFov + this.plane.getNoseAngle());
    }

    /*
        Method Name: getFov2
        Method Parameters: None
        Method Description: Determines the edge angle of the field of view (the end with the other one being in a counter clockwise direction)
        Method Return: int
    */
    getFov2(){
        let adjustedFov = !this.isFacingRight() ? (180 - this.fov1) : this.fov2;
        if (!this.isFacingRight()){
            adjustedFov += 180;
        }
        return fixDegrees(adjustedFov + this.plane.getNoseAngle());
    }

    /*
        Method Name: getXVelocity
        Method Parameters: None
        Method Description: Determines the x velocity of the associated plane
        Method Return: float
    */
    getXVelocity(){
        return this.plane.getXVelocity();
    }

    /*
        Method Name: getYVelocity
        Method Parameters: None
        Method Description: Determines the y velocity of the associated plane
        Method Return: float
    */
    getYVelocity(){
        return this.plane.getYVelocity();
    }

    /*
        Method Name: getID
        Method Parameters: None
        Method Description: Determines the id of the associated plane
        Method Return: String
    */
    getID(){ return this.plane.getID(); }
}