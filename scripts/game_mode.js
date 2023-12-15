class GameMode {
    constructor(){

    }

    // Abstract Methods
    isRunning(){}
}
if (typeof window === "undefined"){
    module.exports = GameMode;
}