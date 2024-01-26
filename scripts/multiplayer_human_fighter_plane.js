/*
    Class Name: MultiplayerHumanFighterPlane
    Description: A subclass of fighter plane that is operated by a human when playing multiplayer
*/
class MultiplayerHumanFighterPlane extends HumanFighterPlane {
    /*
        Method Name: constructor
        Method Parameters:
            planeClass:
                A string representing the type of plane
            scene:
                A Scene object related to the fighter plane
            angle:
                The starting angle of the fighter plane (integer)
            facingRight:
                The starting orientation of the fighter plane (boolean)
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene, angle=0, facingRight=true){
        super(planeClass, scene, angle, facingRight);
        this.lastActions = {
            "throttle": 0,
            "face": facingRight,
            "turn": 0,
            "shooting": false
        }
    }

    // TODO: Comments
    isHuman(){
        return true;
    }

    /*
        Method Name: tick
        Method Parameters:
            timeDiffMS:
                The time between ticks
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
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

    /*
        Method Name: copyLastActions
        Method Parameters: None
        Method Description: Copies the last actions
        Method Return: JSON Object
    */
    copyLastActions(){
        return {
            "throttle": this.lastActions["throttle"],
            "turn": this.lastActions["turn"],
            "face": this.lastActions["face"],
            "shooting": this.lastActions["shooting"]
        }
    }

    /*
        Method Name: actionsStayedTheSame
        Method Parameters: 
            oldActions:
                A json object with the old actions
        Method Description: Determines if the old actions are the same as the current actions
        Method Return: boolean, true -> same, false -> not the same
    */
    actionsStayedTheSame(oldActions){
        let a1 = this.lastActions["throttle"] == oldActions["throttle"];
        let a2 = this.lastActions["shooting"] == oldActions["shooting"];
        let a3 = this.lastActions["face"] == oldActions["face"];
        let a4 = this.lastActions["turn"] == oldActions["turn"];
        return a1 && a2 && a3 && a4;
    }

    /*
        Method Name: adjustByActions
        Method Parameters: None
        Method Description: Takes actions based on recorded actions
        Method Return: void
    */
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

    /*
        Method Name: action
        Method Parameters:
            actionPair:
                A json opbject with an action type and a value
        Method Description: Changes last actions based on a new action
        Method Return: void
    */
    action(actionPair){
        let key = actionPair["action"];
        let value = actionPair["value"];
        if (this.lastActions[key] != value){
            this.lastActions[key] = value;
        }
    }

    /*
        Method Name: checkMoveLeftRight
        Method Parameters: None
        Method Description: Check if the user wishes to switch direction
        Method Return: void
    */
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

    /*
        Method Name: checkUpDown
        Method Parameters: None
        Method Description: Check if the user wishes to change the angle of the plane
        Method Return: void
    */
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

    /*
        Method Name: checkThrottle
        Method Parameters: None
        Method Description: Check if the user wishes to increase or reduce throttle
        Method Return: void
    */
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

    /*
        Method Name: checkShoot
        Method Parameters: None
        Method Description: Check if the user wishes to shoot
        Method Return: void
    */
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

    /*
        Method Name: update
        Method Parameters:
            newStats:
                A json object containing new stats to copy
        Method Description: Copy stats from an object to the stats of the instance
        Method Return: void
    */
    update(newStats){
        this.dead = newStats["isDead"];
        this.x = newStats["x"];
        this.y = newStats["y"];
        this.speed = newStats["speed"];
        this.health = newStats["health"];
        this.throttle = newStats["throttle"];
        this.facingRight = newStats["facing"];
        this.angle = newStats["angle"];
    }

    /*
        Method Name: getStatsToSend
        Method Parameters: None
        Method Description: Records stats that are important to send to the server
        Method Return: JSON Object
    */
    getStatsToSend(){
        let newStats = {};
        newStats["id"] = this.getID();
        newStats["lastActions"] = this.lastActions;
        return newStats;
    }
}