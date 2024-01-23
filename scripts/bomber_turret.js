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
        // TODO: Test l/r if this is right
        let planeAngleRAD = toRadians(this.plane.getShootingAngle());
        let rotatedX = Math.cos(planeAngleRAD) * this.xOffset - Math.sin(planeAngleRAD) * this.yOffset + this.plane.getX();
        return rotatedX;
    }

    getY(){
        // TODO: Test l/r if this is right
        let planeAngleRAD = toRadians(this.plane.getShootingAngle());
        let rotatedY = Math.sin(planeAngleRAD) * this.xOffset + Math.sin(planeAngleRAD) * this.xOffset + this.plane.getY();
        return rotatedY;
    }

    getFov1(){
        // TODO: Test this to confirm
        return fixDegrees(this.fov1 + this.plane.getShootingAngle());
    }

    getFov2(){
        // TODO: Test this to confirm
        return fixDegrees(this.fov2 + this.plane.getShootingAngle());
    }

    getXVelocity(){
        return this.plane.getXVelocity();
    }

    getYVelocity(){
        return this.plane.getYVelocity();
    }

    getID(){ return this.plane.getID(); }
}