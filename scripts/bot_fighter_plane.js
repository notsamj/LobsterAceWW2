
class BotFighterPlane extends FighterPlane{
    constructor(planeClass, angle=0, facingRight=true){
        super(planeClass, angle, facingRight);
        //this.throttle = 1;
        //this.speed = 0;
        this.currentEnemyID = null;
    }

    tick(timeDiffMS){
        super.tick(timeDiffMS);
        this.updateEnemy();
        if (this.hasCurrentEnemy()){
            let enemy = scene.getEntity(this.currentEnemyID);
            this.attack(enemy);
        }
    }

    attack(enemy){
        //if (enemy.getPlaneClass() == "a6m_zero"){ return; }
        //enemy.throttle = 1;
        let enemyXDisplacement = enemy.getX() - this.getX();
        let enemyYDisplacement = enemy.getY() - this.getY();
        if (this.distance(enemy) < 1){ return; }
        let angleRAD = Math.atan(enemyYDisplacement / enemyXDisplacement);
        if (angleRAD == -0){ angleRAD = Math.PI; }
            if (enemyYDisplacement < 0 && enemyXDisplacement < 0){
            angleRAD += Math.PI / 2;
        }
        let angleDEG = toDegrees(angleRAD);
        while (angleDEG < 0){
            angleDEG += 360;
        }
        while(angleDEG >= 360){
            angleDEG -= 360;
        }
        //console.log(enemy.getX(), enemy.getY(), enemyYDisplacement, enemyYDisplacement, enemy.getX(), enemy.getY(), angleRAD, angleDEG)
        //console.log(angleDEG)
        let angleDifference = Math.abs(this.getShootingAngle() - angleDEG);
        if (angleDifference > 180){
            this.facingRight = !this.facingRight;
            let angleDifference2 = Math.abs(this.getShootingAngle() - angleDEG);
            if (angleDifference2 > angleDifference){
                this.facingRight = !this.facingRight;
                // TODO: probably discarding this whole function BUT if I weren't I would add the actual face all somewhere here so it gets the speed
                // debuff
            }
        }
        if (this.getShootingAngle() < angleDEG && angleDifference > 1){
            this.adjustAngle(1);
        }else if (angleDifference > 1){
            this.adjustAngle(-1);
        }

        if (this.shootLock.isReady()){
            this.shootLock.lock();
            this.shoot();
        }
        

        /*if (hasEnemeyInCrosshair()){

        }*/
    }

    updateEnemy(){
        let entities = copyArray(scene.getEntities());
        let bestRecord = null;
        for (let entity of entities){
            if (entity instanceof FighterPlane && !this.onSameTeam(entity)){
                let distance = this.distance(entity);
                if (bestRecord == null || distance < bestRecord["distance"]){
                    bestRecord = {
                        "id": entity.getID(),
                        "distance": distance
                    }
                }
            }
        }
        if (bestRecord == null){ return; }
        this.currentEnemyID = bestRecord["id"];
    }

    hasCurrentEnemy(){
        return scene.hasEntity(this.currentEnemyID);
    }

    onSameTeam(otherPlane){
        return onSameTeam(this.getPlaneClass(), otherPlane.getPlaneClass());
    }


}