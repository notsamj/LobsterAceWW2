// TODO: This class needs comments
class Turret {
    constructor(x, y, fov1, fov2, rateOfFire, scene){
        this.x = x;
        this.y = y;
        this.shootCD = new CooldownLock(rateOfFire * FILE_DATA["constants"]["BULLET_REDUCTION_COEFFICIENT"]);
        this.fov1 = fov1;
        this.fov2 = fov2;
        this.scene = scene;
        this.model = "turret";
    }

    getX(){
        return this.x;
    }

    getY(){
        return this.y;
    }

    getXVelocity(){
        return 0;
    }

    getYVelocity(){
        return 0;
    }

    getFov1(){
        return this.fov1;
    }

    getFov2(){
        return this.fov2;
    }

    shoot(){
        if (this.shootCD.notReady()){ return; }
        let shootingAngle = this.getNoseAngle();
        if (!angleBetweenCWDEG(shootingAngle, this.getFov1(), this.getFov2())){ return; }
        this.shootCD.lock();
        SOUND_MANAGER.play("shoot", this.getX(), this.getY());
        this.scene.addBullet(new Bullet(this.getX(), this.getY(), this.scene, this.getXVelocity(), this.getYVelocity(), this.getNoseAngle(), this.getID(), this.model));
    }

    // Abstract
    getNoseAngle(){}
    getID(){}
}