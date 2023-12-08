class FrameRateCounter{
    constructor(maxFPS){
        this.maxFPS = maxFPS;
        this.frameTimes = [];
        for (let i = 0; i < maxFPS; i++){ this.frameTimes.push(0); }
    }

    countFrame(){
        let currentTime = Date.now();
        for (let i = 0; i < this.frameTimes.length; i++){
            if (!FrameRateCounter.fromPastSecond(currentTime, this.frameTimes[i])){
                this.frameTimes[i] = currentTime;
                break;
            }
        }
    }

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

    static fromPastSecond(currentTime, oldTime){
        return oldTime + 1000 >= currentTime; 
    }
}