// TODO: This class needs comments
class BomberTurret extends Turret {
    constructor(xOffset, yOffset, fov1, fov2, rateOfFire, scene, plane){
        super(null, null, fov1, fov2, rateOfFire, scene);
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.plane = plane;
        this.model = plane.getPlaneClass();
    }

    getX(){
        let planeAngleRAD = toRadians(this.plane.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedX = Math.cos(planeAngleRAD) * this.getXOffset() - Math.sin(planeAngleRAD) * this.getYOffset() + this.plane.getX();
        return rotatedX;
    }

    getY(){
        let planeAngleRAD = toRadians(this.plane.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedY = Math.sin(planeAngleRAD) * this.getXOffset() + Math.cos(planeAngleRAD) * this.getYOffset() + this.plane.getY();
        return rotatedY;
    }

    getXOffset(){
        return this.xOffset * (this.plane.isFacingRight() ? 1 : -1);
    }

    getYOffset(){
        return this.yOffset;
    }

    isFacingRight(){
        return this.plane.isFacingRight();
    }

    getFov1(){
        let adjustedFov = !this.isFacingRight() ? (180 - this.fov2) : this.fov1;
        if (!this.isFacingRight()){
            adjustedFov += 180;
        }
        return fixDegrees(adjustedFov + this.plane.getNoseAngle());
    }

    getFov2(){
        let adjustedFov = !this.isFacingRight() ? (180 - this.fov1) : this.fov2;
        if (!this.isFacingRight()){
            adjustedFov += 180;
        }
        return fixDegrees(adjustedFov + this.plane.getNoseAngle());
    }

    getXVelocity(){
        return this.plane.getXVelocity();
    }

    getYVelocity(){
        return this.plane.getYVelocity();
    }

    getID(){ return this.plane.getID(); }
}