class MultiplayerHumanFighterPlane extends HumanFighterPlane {
    constructor(planeClass, scene, angle=0, facingRight=true){
        super(planeClass, scene, angle, facingRight);
        this.lastActions = {
            "throttle": 0,
            "face": facingRight,
            "turn": 0,
            "shooting": false
        }
    }

    async tick(timeMS){
        let savedInput = await activeGameMode.getLastInputUpToCurrentTick(this.getID());
        if (savedInput != null){
            this.lastActions = savedInput;
        }
        let lastActionsB4 = this.copyLastActions();
        super.tick(timeMS);
        this.adjustByActions();
        if (!this.actionsStayedTheSame(lastActionsB4)){
            activeGameMode.informServer(this.getStatsToSend());
        }
    }

    copyLastActions(){
        return {
            "throttle": this.lastActions["throttle"],
            "turn": this.lastActions["turn"],
            "face": this.lastActions["face"],
            "shooting": this.lastActions["shooting"]
        }
    }

    actionsStayedTheSame(oldActions){
        let c1 = this.lastActions["throttle"] == oldActions["throttle"];
        let c2 = this.lastActions["shooting"] == oldActions["shooting"];
        let c3 = this.lastActions["face"] == oldActions["face"];
        let c4 = this.lastActions["turn"] == oldActions["turn"];
        return c1 && c2 && c3 && c4;
    }

    adjustByActions(){
        if (this.lastActions["shooting"] && this.shootLock.isReady()){
            this.shootLock.lock();
            this.shoot();
        }
        this.adjustAngle(this.lastActions["turn"]);
        if (this.facingRight != this.lastActions["face"]){
            this.face(this.lastActions["face"])
        }
        this.throttle += this.lastActions["throttle"];
    }

    action(actionPair){
        let key = actionPair["action"];
        let value = actionPair["value"];
        if (this.lastActions[key] != value){
            this.lastActions[key] = value;
        }
    }

    checkMoveLeftRight(){
        if (!this.lrCDLock.isReady()){ return; }
        this.lrCDLock.lock();
        let aKey = keyIsDown(65);
        let dKey = keyIsDown(68);
        let numKeysDown = 0;
        numKeysDown += aKey ? 1 : 0;
        numKeysDown += dKey ? 1 : 0;

        // Only ready to switch direction again once you've stopped holding for at least 1 cd
        if (numKeysDown === 0){
            if (!this.lrLock.isReady()){
                this.lrLock.unlock();
            }
            return;
        }else if (numKeysDown > 1){ // Can't which while holding > 1 key
            return;
        }
        if (!this.lrLock.isReady()){ return; }
        this.lrLock.lock();
        this.action({"action": "face", "value": !aKey});
    }


    checkUpDown(){
        let wKey = keyIsDown(87);
        let sKey = keyIsDown(83);
        let numKeysDown = 0;
        numKeysDown += wKey ? 1 : 0;
        numKeysDown += sKey ? 1 : 0;

        // Only ready to switch direction again once you've stopped holding for at least 1 cd
        if (numKeysDown === 0){
            this.action({"action": "turn", "value": 0});
            return;
        }else if (numKeysDown > 1){ // Can't which while holding > 1 key
            this.action({"action": "turn", "value": 0});
            return;
        }
        this.action({"action": "turn", "value": wKey ? -1 : 1});
    }

    checkThrottle(){
        if (!this.tLock.isReady()){ return; }
        this.tLock.lock();
        let rKey = keyIsDown(82);
        let fKey = keyIsDown(70);
        let numKeysDown = 0;
        numKeysDown += rKey ? 1 : 0;
        numKeysDown += fKey ? 1 : 0;

        // Only ready to switch direction again once you've stopped holding for at least 1 cd
        if (numKeysDown === 0){
            this.action({"action": "throttle", "value": 0});
            return;
        }else if (numKeysDown > 1){ // Can't which while holding > 1 key
            this.action({"action": "throttle", "value": 0});
            return;
        }
        this.action({"action": "throttle", "value": fKey ? -1 : 1});
    }

    checkShoot(){
        if (!this.sLock.isReady()){ return; }
        this.sLock.lock();
        let spaceKey = keyIsDown(32);
        if (!spaceKey){
            this.action({"action": "shooting", "value": false});
            return;
        }
        this.action({"action": "shooting", "value": true});
    }

    fromPreviousState(previousState){
        this.dead = previousState["isDead"];
        this.x = previousState["x"];
        this.y = previousState["y"];
        this.facingRight = previousState["facing"];
        this.angle = previousState["angle"];
        this.speed = previousState["speed"];
        this.throttle = previousState["throttle"];
        this.health = previousState["health"];
        this.lastActions = previousState["lastActions"];
    }

    /*

    update(newStats){
        this.dead = newStats["isDead"];
        this.health = newStats["health"];
    }*/
    update(newStats){
        this.dead = newStats["isDead"];
        this.x = newStats["x"];
        this.y = newStats["y"];
        this.speed = newStats["speed"];
        this.health = newStats["health"];
        this.throttle = newStats["throttle"];
        this.facingRight = newStats["facing"];
        this.angle = newStats["angle"];
        //this.lastActions = newStats["lastActions"];
    }

    getStatsToSend(){
        let newStats = {};
        //newStats["x"] = this.x;
        //newStats["y"] = this.y;
        //newStats["facing"] = this.facingRight;
        //newStats["angle"] = this.angle;
        //newStats["speed"] = this.speed;
        //newStats["throttle"] = this.throttle;
        newStats["id"] = this.getID();
        newStats["lastActions"] = this.lastActions;
        return newStats;
    }
}