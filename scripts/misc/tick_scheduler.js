// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../data/data_json.js");
}
/*
    Class Name: TickScheduler
    Description: A tool for setting up the regular scheduling of ticks
*/
class TickScheduler {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
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

    /*
        Method Name: getLastTime
        Method Parameters: None
        Method Description: Getter
        Method Return: integer
    */
    getLastTime(){
        return this.lastTime;
    }

    /*
        Method Name: setLastTime
        Method Parameters:
            lastTime:
                Last time of a tick in ms
        Method Description: Setter
        Method Return: void
    */
    setLastTime(lastTime){
        this.lastTime = lastTime;
    }

    /*
        Method Name: end
        Method Parameters: None
        Method Description: Stops ticking
        Method Return: void
    */
    end(){
        clearInterval(this.interval);
    }

    /*
        Method Name: getStartTime
        Method Parameters: None
        Method Description: Getter
        Method Return: integer
    */
    getStartTime(){
        return this.startTime;
    }

    /*
        Method Name: setStartTime
        Method Parameters:
            startTime:
                The start time of the program in ms
        Method Description: Setter
        Method Return: void
    */
    setStartTime(startTime){
        this.startTime = startTime;
    }

    /*
        Method Name: timeSinceLastExpectedTick
        Method Parameters:
            time:
                A time in ms
        Method Description: Calculates how long it has been since the last expected tick
        Method Return: integer
    */
    timeSinceLastExpectedTick(time){
        return (time - this.startTime) % PROGRAM_DATA["settings"]["ms_between_ticks"];
    }

    /*
        Method Name: timeSinceLastActualTick
        Method Parameters:
            time:
                A time in ms
        Method Description: Calculates how long it has been since the last actual tick
        Method Return: integer
    */
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

    /*
        Method Name: getExpectedTicksToTime
        Method Parameters:
            time:
                A time in ms
        Method Description: Calculates how many ticks are expected to have occured by a given time
        Method Return: Number
    */
    getExpectedTicksToTime(time){
        return (time - this.startTime) / PROGRAM_DATA["settings"]["ms_between_ticks"];
    }
}
// If using NodeJS -> export the class
if (typeof window === "undefined"){
    module.exports = TickScheduler;
}