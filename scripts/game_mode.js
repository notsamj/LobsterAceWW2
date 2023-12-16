class GameMode {
    constructor(){

    }

    allowingSceneTicks(){
        return true;
    }

    // Abstract Methods
    isRunning(){}
}
if (typeof window === "undefined"){
    module.exports = GameMode;
}