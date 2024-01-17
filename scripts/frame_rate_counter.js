/*
    Class Name: FrameRateCounter
    Description: A class to count frame rate
*/
class FrameRateCounter {
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
        this.frameTimes = [];
        for (let i = 0; i < maxFPS; i++){ this.frameTimes.push(0); }
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
        Method Name: fromPastSecond
        Method Parameters: None
        Method Description: Determines if a frame was registered in the past second
        Method Return: Boolean, true -> Frame is from the past second, false -> Frame is older
    */
    static fromPastSecond(currentTime, oldTime){
        return oldTime + 1000 >= currentTime; 
    }
}