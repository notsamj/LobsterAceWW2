// TODO: This class needs comments
class Turret {
    constructor(x, y, fov1, fov2, rateOfFire, scene){
        this.x = x;
        this.y = y;
        this.shootCD = new CooldownLock(rateOfFire);
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
        let shootingAngle = this.getShootingAngle();
        console.log(shootingAngle, this.getFov1(), this.getFov2(), angleBetweenCWDEG(shootingAngle, this.getFov1(), this.getFov2()))
        if (!angleBetweenCWDEG(shootingAngle, this.getFov1(), this.getFov2())){ return; }
        this.shootCD.lock();
        this.scene.addBullet(new Bullet(this.getX(), this.getY(), this.scene, this.getXVelocity(), this.getYVelocity(), this.getShootingAngle(), this.getID(), this.model));
    }

    // Abstract
    getShootingAngle(){}
    getID(){}
}