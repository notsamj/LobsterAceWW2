// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../data/data_json.js");
}
// TODO: Comment this class
class TickScheduler {
    constructor(callBack, gapMS, startTime){
        this.startTime = startTime;
        this.gapMS = gapMS;
        this.callBack = callBack;
        this.lastTime = startTime;
        this.interval = setInterval(async () => {
            let currentTime = Date.now();
            // If time for new tick
            let realGap = currentTime - this.getLastTime();
            this.setLastTime(currentTime);
            this.callBack(PROGRAM_DATA["settings"]["ms_between_ticks"]);
        }, this.gapMS);
    }

    getLastTime(){
        return this.lastTime;
    }

    setLastTime(lastTime){
        this.lastTime = lastTime;
    }

    end(){
        clearInterval(this.interval);
    }

    getStartTime(){
        return this.startTime;
    }

    setStartTime(startTime){
        this.startTime = startTime;
    }

    timeSinceLastExpectedTick(time){
        return (time - this.startTime) % PROGRAM_DATA["settings"]["ms_between_ticks"];
    }

    timeSinceLastActualTick(time){
        return time - this.getLastTime();
    }

    /*
        Method Name: getExpectedTicks
        Method Parameters: None
        Method Description: Calculates the expected number of ticks that have occured
        Method Return: long
    */
    getExpectedTicks(){
        return Math.floor(this.getExpectedTicksToTime(this.lastTime));
    }

    // TODO: Comments
    getExpectedTicksToTime(time){
        return (time - this.startTime) / PROGRAM_DATA["settings"]["ms_between_ticks"];
    }
}
// If using NodeJS -> export the class
if (typeof window === "undefined"){
    module.exports = TickScheduler;
}