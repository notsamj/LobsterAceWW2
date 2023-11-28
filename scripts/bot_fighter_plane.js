class BotFighterPlane extends FighterPlane{
    constructor(planeClass, angle=0, facingRight=true){
        super(planeClass, angle, facingRight);
        this.throttle = 80;
    }

    tick(timeDiffMS){
        super.tick(timeDiffMS);
        let randomNumber = randomNumberInclusive(0, this.throttle + this.angle);
        if (randomNumber == 0){
            this.adjustThrottle(1);
        }else if (randomNumber == 1){
            this.adjustThrottle(-1);
        }else if (randomNumber == 2){
            this.adjustAngle(1);
        }else if (randomNumber == 3){
            this.adjustAngle(-1);
        }/*else if (randomNumber == 4){
            this.face(!this.facingRight);
        }*/

        if (this.shootLock.isReady()){
            this.shootLock.lock();
            this.shoot();
        }
    }
}