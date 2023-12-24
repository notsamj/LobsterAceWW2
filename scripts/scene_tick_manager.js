if (typeof window === "undefined"){
    fileData = require("../data/data_json.js");
    Lock = require("../scripts/lock.js");
}
class SceneTickManager {
    constructor(startTime, scene, tickLength){
        this.startTime = startTime;
        this.tickLength = tickLength;
        this.numTicks = 0;
        this.scene = scene;
        //console.log("init", startTime, scene)
        this.tickLock = new Lock();
    }

    getStartTime(){
        return this.startTime;
    }

    setStartTime(startTime){
        this.startTime = startTime;
    }

    setNumTicks(numTicks){
        this.numTicks = numTicks;
    }

    getNumTicks(){
        return this.numTicks;
    }

    async tick(callOnTick=null){
        if (this.tickLock.notReady()){
            return;
        }
        this.tickLock.lock();
        let expectedTicks = this.getExpectedTicks();
        while (this.numTicks < expectedTicks){
            await this.scene.tick(this.tickLength);
            if (callOnTick != null){
                await callOnTick();
            }
            this.numTicks += 1;
        }
        this.tickLock.unlock();
    }

    tickFromTo(fromNumTicks, toNumTicks){
        while (fromNumTicks < toNumTicks){
            this.scene.tick(this.tickLength);
            fromNumTicks += 1;
        }
    }

    getExpectedTicks(){
        return Math.floor(((Date.now() - this.startTime) / fileData["constants"]["MS_BETWEEN_TICKS"]));
    }

    async awaitUnlock(relock){
        await this.tickLock.awaitUnlock(relock);
    }

    unlock(){
        this.tickLock.unlock();
    }
}
if (typeof window === "undefined"){
    module.exports = SceneTickManager;
}