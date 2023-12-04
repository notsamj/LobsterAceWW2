class InfiniteLoopFinder{
    constructor(infiniteAmount){
        this.infiniteAmount = infiniteAmount;
        this.loops = {};
    }

    count(key){
        if (!this.loops[key]){
            this.loops[key] = 0;
        }
        this.loops[key] += 1;
        if (this.loops[key] > this.infiniteAmount){
            console.log("Suspected infinite loop @ " + key);
            window.stop();
        }
    }

    reset(key){
        this.loops[key] = 0;
    }
}