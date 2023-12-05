class InfiniteLoopFinder{
    constructor(infiniteAmount, name){
        this.infiniteAmount = infiniteAmount;
        this.name = name;
        this.loopCounter = 0;
    }

    count(){
        if (this.loopCounter++ > this.infiniteAmount){
            console.log("Suspected infinite loop @ " + this.name);
            debugger;
        }
    }
}