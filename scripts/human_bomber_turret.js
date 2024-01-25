// TODO: This class needs comments
class HumanBomberTurret extends BomberTurret {
    constructor(xOffset, yOffset,fov1, fov2, rateOfFire, scene, plane){
        super(xOffset, yOffset, fov1, fov2, rateOfFire, scene, plane);
    }

    getShootingAngle(){
        let x = window.mouseX - getScreenWidth() / 2;
        let y = this.scene.changeFromScreenY(window.mouseY) - getScreenHeight() / 2;
        let x0 = 0;
        let y0 = 0;
        return getDegreesFromDisplacement(x - x0, y - y0);
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