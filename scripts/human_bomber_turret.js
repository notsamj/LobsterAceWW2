// TODO: This class needs comments
class HumanBomberTurret extends BomberTurret {
    constructor(xOffset, yOffset,fov1, fov2, rateOfFire, scene, plane){
        super(xOffset, yOffset, fov1, fov2, rateOfFire, scene, plane);
    }

    getShootingAngle(){
        // TODO: Stop using innerWidth
        let x = window.mouseX - window.innerWidth / 2;
        let y = this.scene.changeFromScreenY(window.mouseY) - window.innerHeight / 2;
        let x0 = 0;
        let y0 = 0;
        if (x == x0){ return 90; }
        let angleRAD = Math.atan((y - y0) / (x - x0));
        return fixDegrees(toDegrees(angleRAD));
    }

    checkShoot(){
        if (USER_INPUT_MANAGER.getActive("bomber_shoot_input")){
            this.shoot();
        }
    }

    static create(gunObject, scene, plane){
        return new HumanBomberTurret(gunObject["x_offset"], gunObject["y_offset"], gunObject["fov_1"], gunObject["fov_2"], gunObject["rate_of_fire"], scene, plane);
    }
}