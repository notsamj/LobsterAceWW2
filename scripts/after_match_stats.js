// Singleton Class
// Note: Only supports 1 player "user"
/*
    Class Name: AfterMatchStats
    Description: Records the events taking place in a Dogfight for later review
*/
class AfterMatchStats {
    static instance; // Instance of the class to be used (Singleton pattern)
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.reset();
    }

    /*
        Method Name: reset
        Method Parameters: None
        Method Description: Initializes an instance of AfterMatchStats
        Method Return: void
    */
    reset(){
        this.winner = "None";
        this.botKillCounts = {};
        this.playerKillCount = {"alliance": "None", "kills": 0};
    }

    /*
        Method Name: addBotKill
        Method Parameters:
            planeClass:
                A string representing the type of plane
        Method Description: Updates the number of kills of the given plane type
        Method Return: void
    */
    addBotKill(planeClass){
        // If the number of kills for this plane class has not previously been updated then initialize it to zero
        if (!Object.keys(this.botKillCounts).includes(planeClass)){
            this.botKillCounts[planeClass] = 0;
        }
        // Increase the "kill count" by 1
        this.botKillCounts[planeClass] = this.botKillCounts[planeClass] + 1;
    }

    /*
        Method Name: addPlayerKill
        Method Parameters:
            alliance:
                A string representing the alliance of the player who killed an opponent
        Method Description: Updates the number of kills of the player
        Method Return: void
    */
    addPlayerKill(alliance){
        this.playerKillCount["alliance"] = alliance;
        this.playerKillCount["kills"] += 1;
    }

    /*
        Method Name: getWinnerColour
        Method Parameters: None
        Method Description: Determines the colour of the winning team
        Method Return: String
    */
    getWinnerColour(){
        return AfterMatchStats.getTeamColour(this.winner);
    }

    /*
        Method Name: setWinner
        Method Parameters:
            winner:
                A string with the name of the winning alliance
        Method Description: Sets the winner variable to the given winning team
        Method Return: void
    */
    setWinner(winner){
        this.winner = winner;
    }

    /*
        Method Name: makeTeamText
        Method Parameters:
            team:
                A string with the name of an alliance
        Method Description: Creates a string representing information about the number of kills achieved by an alliance
        Method Return: String
    */
    makeTeamText(team){
        let text = team + " Total Kills:";
        let ranking = [];

        // Add player's stats if on this team
        if (this.playerKillCount["alliance"] == team){
            ranking.push({"name": "user", "kills": this.playerKillCount["kills"]})
        }

        // Find bot kills on This team
        for (let planeClass of Object.keys(this.botKillCounts)){
            if (planeModelToAlliance(planeClass) != team){ continue; }
            ranking.push({"name": planeClass, "kills": this.botKillCounts[planeClass]});
        }

        // Sort high to low
        ranking.sort((e1, e2) => {
            return e2["kills"] - e1["kills"];
        });

        // Add ranking to text
        for (let nameKillsPair of ranking){
            text += "\n" + nameKillsPair["name"] + ": " + nameKillsPair["kills"]; 
        }
        return text;
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Displays the results of the match (number of kills by team) on the canvas
        Method Return: void
    */
    display(){
        let winnerText = "Winner: " + this.winner;
        let axisText = this.makeTeamText("Axis");
        let allyText = this.makeTeamText("Allies");
        
        // Make winner text
        Menu.makeText(winnerText, this.getWinnerColour(), 0, Math.floor(getScreenHeight()), Math.floor(getScreenWidth()), Math.floor(getScreenHeight()/3));
        Menu.makeText(allyText, AfterMatchStats.getTeamColour("Allies"), 0, Math.floor(getScreenHeight()*2/3), Math.floor(getScreenWidth()/2), Math.floor(getScreenHeight()*2/3));
        Menu.makeText(axisText, AfterMatchStats.getTeamColour("Axis"), Math.floor(getScreenWidth()/2), Math.floor(getScreenHeight()*2/3), Math.floor(getScreenWidth()/2), Math.floor(getScreenHeight()*2/3));
    }

    /*
        Method Name: getTeamColour
        Method Parameters:
            team:
                String representing the name of an alliance
        Method Description: Determines string the colour assigned to a given alliance
        Method Return: String
    */
    static getTeamColour(team){
        return FILE_DATA["team_to_colour"][team];
    }

    // Interface for non-static function
    static reset(){
        AfterMatchStats.instance.reset();
    }

    // Interface for non-static function
    static addBotKill(planeClass){
        AfterMatchStats.instance.addBotKill(planeClass);
    }

    // Interface for non-static function
    static addPlayerKill(alliance){
        AfterMatchStats.instance.addPlayerKill(alliance);
    }
    // Interface for non-static function
    static getWinnerColour(){
        return AfterMatchStats.instance.getWinnerColour();
    }
    // Interface for non-static function
    static setWinner(winner){
        AfterMatchStats.instance.setWinner(winner);
    }
    // Interface for non-static function
    static display(){
        AfterMatchStats.instance.display();
    }

    // Creates the instance of AfterMatchStats to be used in the singleton pattern
    static init(){
        AfterMatchStats.instance = new AfterMatchStats();
    }
}

// Create instance
AfterMatchStats.init();