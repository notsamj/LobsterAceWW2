// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    helperFunctions = require("../general/helper_functions.js");
    objectHasKey = helperFunctions.objectHasKey;
}
/*
    Class Name: AfterMatchStats
    Description: Records the events taking place in a Dogfight for later review
*/
class AfterMatchStats {
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
        this.playerKillCounts = {"Allies": {}, "Axis": {}};
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
            userName:
                Name of the user who killed the other plane
            alliance:
                A string representing the alliance of the player who killed an opponent
        Method Description: Updates the number of kills of the player
        Method Return: void
    */
    addPlayerKill(userName, alliance){
        if (!objectHasKey(this.playerKillCounts[alliance], userName)){
            this.playerKillCounts[alliance][userName] = 1;
        }else{
            this.playerKillCounts[alliance][userName] += 1;
        }
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
        Method Name: getWinner
        Method Parameters: None
        Method Description: Getter
        Method Return: String
    */
    getWinner(){
        return this.winner;
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
        for (let playerName of Object.keys(this.playerKillCounts[team])){
            ranking.push({"name": playerName, "kills": this.playerKillCounts[team][playerName]})
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
        Menu.makeText(winnerText, this.getWinnerColour(), Math.floor(getScreenWidth()/2), Math.floor(getScreenHeight() * 0.9), Math.floor(getScreenWidth()*0.70), Math.floor(getScreenHeight()/4), "center", "hanging");
        Menu.makeText(allyText, AfterMatchStats.getTeamColour("Allies"), 0, Math.floor(getScreenHeight()*2/3), Math.floor(getScreenWidth()/2), Math.floor(getScreenHeight()*2/3), "left", "middle");
        Menu.makeText(axisText, AfterMatchStats.getTeamColour("Axis"), Math.floor(getScreenWidth()/2), Math.floor(getScreenHeight()*2/3), Math.floor(getScreenWidth()/2), Math.floor(getScreenHeight()*2/3), "left", "middle");
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
        return PROGRAM_DATA["team_to_colour"][team];
    }

    /*
        Method Name: toJSON
        Method Parameters: None
        Method Description: Create a JSON representation of the current stats
        Method Return: JSON Object
    */
    toJSON(){
        return {
            "winner": this.winner,
            "player_kills": this.playerKillCounts,
            "bot_kills": this.botKillCounts
        }
    }

    /*
        Method Name: fromJSON
        Method Parameters:
            statsObject:
                A Json representation of an aftermatchstats instance
        Method Description: Load instance details from a JSON object
        Method Return: void
    */
    fromJSON(statsObject){
        this.winner = statsObject["winner"];
        this.playerKillCounts = statsObject["player_kills"];
        this.botKillCounts = statsObject["bot_kills"];
    }
}

// If using NodeJS then export the lock class
if (typeof window === "undefined"){
    module.exports = AfterMatchStats;
}