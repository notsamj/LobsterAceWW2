/*
    Class Name: FrameRateCounter
    Description: A class to count frame rate
*/
class FrameRateCounter {
    // With a constant of 0.9 and maxFPS of 100, there must always be a gap of 9ms or more between frames
    static FRAME_GAP_CONSTANT = 0.9;

    /*
        Method Name: constructor
        Method Parameters:
            maxFPS:
                A maximum expected number of frames that can occur in a second
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(maxFPS){
        this.maxFPS = maxFPS;
        this.minFrameGap = 1000 / maxFPS * FrameRateCounter.FRAME_GAP_CONSTANT;
        this.lastFrameTime = 0;
        this.frameTimes = [];
        this.frameIndex = -1; // countFrame() is expected to be called before each frame
        for (let i = 0; i < maxFPS; i++){ this.frameTimes.push(0); }
    }

    /*
        Method Name: getFrameIndex
        Method Parameters: None
        Method Description: Getter
        Method Return: Integer
    */
    getFrameIndex(){
        return this.frameIndex;
    }

    /*
        Method Name: getLastFrameTime
        Method Parameters: None
        Method Description: Getter
        Method Return: void
    */
    getLastFrameTime(){
        return this.lastFrameTime;
    }

    /*
        Method Name: countFrame
        Method Parameters: None
        Method Description: Adds an entry in the frameTimes array to register that a frame was registered at this time
        Method Return: void
    */
    countFrame(){
        let currentTime = Date.now();
        for (let i = 0; i < this.frameTimes.length; i++){
            if (!FrameRateCounter.fromPastSecond(currentTime, this.frameTimes[i])){
                this.frameTimes[i] = currentTime;
                this.lastFrameTime = currentTime;
                this.frameIndex++;
                break;
            }
        }
    }

    /*
        Method Name: getFPS
        Method Parameters: None
        Method Description: Counts the number of frames counted in the last second
        Method Return: int in range [0,this.maxFPS]
    */
    getFPS(){
        let currentTime = Date.now();
        let fps = 0;
        for (let i = 0; i < this.frameTimes.length; i++){
            if (FrameRateCounter.fromPastSecond(currentTime, this.frameTimes[i])){
                fps++;
            }
        }
        return fps;
    }

    /*
        Method Name: getMaxFPS
        Method Parameters: None
        Method Description: Getter
        Method Return: integer
    */
    getMaxFPS(){
        return this.maxFPS;
    }

    /*
        Method Name: ready
        Method Parameters: None
        Method Description: Determines if the counter is ready for another frame to be displayed
        Method Return: Boolean
    */
    ready(){
        return this.getFPS() < this.getMaxFPS() && Date.now() - this.lastFrameTime > this.minFrameGap;
    }

    /*
        Method Name: fromPastSecond
        Method Parameters: None
        Method Description: Determines if a frame was registered in the past second
        Method Return: Boolean, true -> Frame is from the past second, false -> Frame is older
    */
    static fromPastSecond(currentTime, oldTime){
        return oldTime + 1000 >= currentTime; 
    }
}