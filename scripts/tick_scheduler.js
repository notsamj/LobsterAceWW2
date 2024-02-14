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
            await this.callBack(realGap);
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

    /*
        Method Name: getExpectedTicks
        Method Parameters: None
        Method Description: Calculates the expected number of ticks that have occured
        Method Return: long
    */
    getExpectedTicks(){
        return Math.floor(((this.lastTime - this.startTime) / PROGRAM_DATA["settings"]["ms_between_ticks"]));
    }
}