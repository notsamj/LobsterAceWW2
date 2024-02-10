/*
    Class Name: GameMode
    Description: Abstract class for a game mode
*/
class GameMode {
    constructor(){}

    /*
        Method Name: allowingSceneTicks
        Method Parameters: None
        Method Description: Returns whether the game mode is allowing the scene to tick
        Method Return: Boolean
    */
    allowingSceneTicks(){
        return true;
    }

    // Abstract Methods
    isRunning(){}
    display(){}
}
// If using NodeJS then export the class
if (typeof window === "undefined"){
    module.exports = GameMode;
}