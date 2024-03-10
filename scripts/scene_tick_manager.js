// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../data/data_json.js");
    Lock = require("../scripts/lock.js");
}

/*
    Class Name: SceneTickManager
    Description: An object to manage the ticks for a scene.
    Note: I think PROGRAM_DATA["settings"]["ms_between_ticks"] should = this.tickLength so pointless to use both in the code.
*/
class SceneTickManager {
    /*
        Method Name: constructor
        Method Parameters:
            startTime:
                The start time for the tick manager (ms). numTicksExepcted = ({currentTime} - startTime) / tickLength
            scene:
                The associated scene
            tickLength:
                The amount of time between ticks
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(startTime, scene, tickLength){
        this.startTime = startTime;
        this.tickLength = tickLength;
        this.numTicks = 0;
        this.scene = scene;
        this.tickLock = new Lock();
    }

    /*
        Method Name: getStartTime
        Method Parameters: None
        Method Description: Getter
        Method Return: long
    */
    getStartTime(){
        return this.startTime;
    }

    /*
        Method Name: setStartTime
        Method Parameters: 
            startTime:
                The start time for the tick manager (ms). numTicksExepcted = ({currentTime} - startTime) / tickLength
        Method Description: Setter
        Method Return: void
    */
    setStartTime(startTime){
        this.startTime = startTime;
    }

    /*
        Method Name: setStartTime
        Method Parameters: 
            numTicks:
                The number of ticks that have been processed so far
        Method Description: Setter
        Method Return: void
    */
    setNumTicks(numTicks){
        this.numTicks = numTicks;
    }

    /*
        Method Name: getNumTicks
        Method Parameters: None
        Method Description: Getter
        Method Return: void
    */
    getNumTicks(){
        return this.numTicks;
    }

    /*
        Method Name: tick
        Method Parameters:
            callOnTick:
                A function to call every tick
        Method Description: Runs ticks until the expected number have occured.
        Test Mode is available to forcefully run 1 tick.
        Method Return: void
    */
    async tick(callOnTick=null, testMode=false){
        if (this.tickLock.notReady()){
            return;
        }
        this.tickLock.lock();
        let expectedTicks = this.getExpectedTicks();
        while (this.numTicks < expectedTicks || testMode){
            testMode = false;
            if (callOnTick != null && this.scene.hasTicksEnabled()){
                await callOnTick();
            }
            this.numTicks += 1;
        }
        this.tickLock.unlock();
    }

    /*
        Method Name: tickFromTo
        Method Parameters:
            fromNumTicks:
                The starting number of ticks (inclusive)
            toNumTicks:
                The ending number of ticks (inclusive)
        Method Description: Runs toNumTicks-fromNumTicks+1 ticks
        Method Return: void
    */
    tickFromTo(fromNumTicks, toNumTicks){
        while (fromNumTicks < toNumTicks){
            this.scene.tick(this.tickLength);
            fromNumTicks += 1;
        }
    }

    /*
        Method Name: getExpectedTicks
        Method Parameters: None
        Method Description: Calculates the expected number of ticks that have occured
        Method Return: long
    */
    getExpectedTicks(){
        return Math.floor(((Date.now() - this.startTime) / PROGRAM_DATA["settings"]["ms_between_ticks"]));
    }

    /*
        Method Name: awaitUnlock
        Method Parameters: 
            relock:
                Boolean, whether or not to lock the ticklock after waiting
        Method Description: Wait for the ticklock to unlock
        Method Return: Promise (implicit?)
    */
    async awaitUnlock(relock){
        await this.tickLock.awaitUnlock(relock);
    }

    /*
        Method Name: unlock
        Method Parameters: None
        Method Description: unlock the ticklock
        Method Return: void
    */
    unlock(){
        this.tickLock.unlock();
    }
}
// If using NodeJS -> export the class
if (typeof window === "undefined"){
    module.exports = SceneTickManager;
}