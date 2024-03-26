/*
    Class Name: DogfightMenu
    Description: A subclass of Menu specific to preparing a dogfight
*/
class DogfightMenu extends Menu {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        super();
        this.planeCounts = {};
        this.userPlanes = this.createUserPlaneSelection();
        this.userPlaneIndex = 0;
        this.alliedPlanes = this.createAlliedPlaneSelection();
        this.alliedPlaneIndex = 0;
        this.axisPlanes = this.createAxisPlaneSelection();
        this.axisPlaneIndex = 0;
        this.currentAlliedPlaneCountComponent = null;
        this.currentAxisPlaneCountComponent = null;
        this.botDetailsComponent = null;
        this.setup();
        this.updateBotDetails();
        this.allyDifficulty = "easy";
        this.axisDifficulty = "easy";
    }

    /*
        Method Name: setup
        Method Parameters: None
        Method Description: Sets up the menu interface
        Method Return: void
    */
    setup(){
        let addRemoveButtonSize = 50;

        // Background
        this.components.push(new AnimatedCloudBackground())

        let backButtonX = () => { return 50; }
        let backButtonY = (innerHeight) => { return innerHeight-27; }
        let backButtonXSize = 200;
        let backButtonYSize = 76;
        this.components.push(new RectangleButton("Main Menu", "#3bc44b", "#e6f5f4", backButtonX, backButtonY, backButtonXSize, backButtonYSize, (instance) => {
            instance.goToMainMenu();
        }));

        let startButtonX = () => { return 50; }
        let startButtonY = () => { return 200; }
        let startButtonXSize = (innerWidth) => { return innerWidth-50*2; }
        let startButtonYSize = 200;
        this.components.push(new RectangleButton("Start", "#c72d12", "#e6f5f4", startButtonX, startButtonY, startButtonXSize, startButtonYSize, (instance) => {
            activeGamemode = new LocalDogfight(this.createJSONRep());
            this.goToGame();
        }));

        // User Section

        let userHeaderX = () => { return 300; }
        let userHeaderY = (innerHeight) => { return innerHeight - 27; }
        let userHeaderXSize = 200;
        let userHeaderYSize = 100;
        this.components.push(new TextComponent("User", "#4b42f5", userHeaderX, userHeaderY, userHeaderXSize, userHeaderYSize));

        let userPlaneX = () => { return 350; };
        let userPlaneScreenY = (innerHeight) => { return innerHeight - 127; }
        let userPlane = new StaticImage(images[this.userPlanes[0]], userPlaneX, userPlaneScreenY);
        userPlane.setOnClick(() => {
            userPlane.setImage(this.switchPlanes()); 
        });
        this.components.push(userPlane);

        // Allied Section
        let alliesHeaderX = () => { return 600; }
        let alliesHeaderY = (innerHeight) => { return innerHeight - 27; }
        let alliesHeaderXSize = 270;
        let alliesHeaderYSize = 100;
        this.components.push(new TextComponent("Allies", PROGRAM_DATA["team_to_colour"]["Allies"], alliesHeaderX, alliesHeaderY, alliesHeaderXSize, alliesHeaderYSize));

        let alliedPlaneX = () => { return 650; }
        let alliedPlaneScreenY = (innerHeight) => { return innerHeight - 127; };
        let alliedPlane = new StaticImage(images[this.alliedPlanes[0]], alliedPlaneX, alliedPlaneScreenY);
        alliedPlane.setOnClick(() => {
            alliedPlane.setImage(this.switchAlliedPlanes()); 
        });
        this.components.push(alliedPlane);

        let alliedMinus5ButtonX = (innerWidth) => { return alliesHeaderX(innerWidth); }
        let alliedMinus5ButtonY = (innerHeight) => { return alliedPlaneScreenY(innerHeight) - alliedPlane.getHeight(); };
        this.components.push(new RectangleButton("-5", PROGRAM_DATA["team_to_colour"]["Allies"], "#e6f5f4", alliedMinus5ButtonX, alliedMinus5ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            this.modifyDisplayedBotPlaneCount("Allies", -5);
        }));

        let allyDifficultyButtonX = (innerWidth) => { return alliesHeaderX(innerWidth); }
        let allyDifficultyButtonY = (innerHeight) => { return alliedPlaneScreenY(innerHeight) - alliedPlane.getHeight() - addRemoveButtonSize; }
        this.components.push(new RectangleButton(() => { return this.getAllyDifficulty(); }, PROGRAM_DATA["team_to_colour"]["Allies"], "#e6f5f4", allyDifficultyButtonX, allyDifficultyButtonY, addRemoveButtonSize*3, addRemoveButtonSize*3, (instance) => {
            this.cycleAllyDifficulty();
        }));

        let alliedMinus1ButtonX = (innerWidth) => { return alliedMinus5ButtonX(innerWidth) + addRemoveButtonSize; }
        let alliedMinus1ButtonY = (innerHeight) => { return alliedPlaneScreenY(innerHeight) - alliedPlane.getHeight(); }
        this.components.push(new RectangleButton("-1", PROGRAM_DATA["team_to_colour"]["Allies"], "#e6f5f4", alliedMinus1ButtonX, alliedMinus1ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            this.modifyDisplayedBotPlaneCount("Allies", -1);
        }));

        let alliedCurrentCountTextX = (innerWidth) => { return alliedMinus1ButtonX(innerWidth) + addRemoveButtonSize; }
        let alliedCurrentCountTextY = (innerHeight) => { return alliedPlaneScreenY(innerHeight) - alliedPlane.getHeight(); }
        let alliedCurrentCountTextXSize = 50;
        let alliedCurrentCountTextYSize = 50;
        this.currentAlliedPlaneCountComponent = new TextComponent("0", PROGRAM_DATA["team_to_colour"]["Allies"], alliedCurrentCountTextX, alliedCurrentCountTextY, alliedCurrentCountTextXSize, alliedCurrentCountTextYSize, CENTER, CENTER);
        this.components.push(this.currentAlliedPlaneCountComponent);

        let alliedPlus1ButtonX = (innerWidth) => { return alliedCurrentCountTextX(innerWidth) + alliedCurrentCountTextXSize; }
        let alliedPlus1ButtonY = (innerHeight) => { return alliedPlaneScreenY(innerHeight) - alliedPlane.getHeight(); }
        this.components.push(new RectangleButton("+1", PROGRAM_DATA["team_to_colour"]["Allies"], "#e6f5f4", alliedPlus1ButtonX, alliedPlus1ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            this.modifyDisplayedBotPlaneCount("Allies", 1);
        }));

        let alliedPlus5ButtonX = (innerWidth) => { return alliedPlus1ButtonX(innerWidth) + addRemoveButtonSize; }
        let alliedPlus5ButtonY = (innerHeight) => { return alliedPlaneScreenY(innerHeight) - alliedPlane.getHeight(); }
        this.components.push(new RectangleButton("+5", PROGRAM_DATA["team_to_colour"]["Allies"], "#e6f5f4", alliedPlus5ButtonX, alliedPlus5ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            this.modifyDisplayedBotPlaneCount("Allies", 5);
        }));

        // Axis Section
        let axisHeaderX = () => { return 900; }
        let axisHeaderY = (innerHeight) => { return innerHeight - 27; }
        let axisHeaderXSize = 200;
        let axisHeaderYSize = 100;
        this.components.push(new TextComponent("Axis", PROGRAM_DATA["team_to_colour"]["Axis"], axisHeaderX, axisHeaderY, axisHeaderXSize, axisHeaderYSize));


        let axisPlaneX = () => { return 950; }
        let axisPlaneScreenY = (innerHeight) => { return innerHeight - 127; }
        let axisPlane = new StaticImage(images[this.axisPlanes[0]], axisPlaneX, axisPlaneScreenY);
        axisPlane.setOnClick(() => {
            axisPlane.setImage(this.switchAxisPlanes()); 
        });
        this.components.push(axisPlane);

        let axisMinus5ButtonX = (innerWidth) => { return axisHeaderX(innerWidth); }
        let axisMinus5ButtonY = (innerHeight) => { return axisPlaneScreenY(innerHeight) - axisPlane.getHeight(); }
        this.components.push(new RectangleButton("-5", PROGRAM_DATA["team_to_colour"]["Axis"], "#e6f5f4", axisMinus5ButtonX, axisMinus5ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            this.modifyDisplayedBotPlaneCount("Axis", -5);
        }));

        let axisDifficultyButtonX = (innerWidth) => { return axisHeaderX(innerWidth); }
        let axisDifficultyButtonY = (innerHeight) => { return axisPlaneScreenY(innerHeight) - axisPlane.getHeight() - addRemoveButtonSize; }
        this.components.push(new RectangleButton(() => { return this.getAxisDifficulty(); }, PROGRAM_DATA["team_to_colour"]["Axis"], "#e6f5f4", axisDifficultyButtonX, axisDifficultyButtonY, addRemoveButtonSize*3, addRemoveButtonSize*3, (instance) => {
            this.cycleAxisDifficulty();
        }));

        let axisMinus1ButtonX = (innerWidth) => { return axisMinus5ButtonX(innerWidth) + addRemoveButtonSize; }
        let axisMinus1ButtonY = (innerHeight) => { return axisPlaneScreenY(innerHeight) - axisPlane.getHeight(); }
        this.components.push(new RectangleButton("-1", PROGRAM_DATA["team_to_colour"]["Axis"], "#e6f5f4", axisMinus1ButtonX, axisMinus1ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            this.modifyDisplayedBotPlaneCount("Axis", -1);
        }));

        let axisCurrentCountTextX = (innerWidth) => { return axisMinus1ButtonX(innerWidth) + addRemoveButtonSize; }
        let axisCurrentCountTextY = (innerHeight) => { return axisPlaneScreenY(innerHeight) - axisPlane.getHeight(); }
        let axisCurrentCountTextXSize = 50;
        let axisCurrentCountTextYSize = 50;
        this.currentAxisPlaneCountComponent = new TextComponent("0", PROGRAM_DATA["team_to_colour"]["Axis"], axisCurrentCountTextX, axisCurrentCountTextY, axisCurrentCountTextXSize, axisCurrentCountTextYSize, CENTER, CENTER);
        this.components.push(this.currentAxisPlaneCountComponent);

        let axisPlus1ButtonX = (innerWidth) => { return axisCurrentCountTextX(innerWidth) + axisCurrentCountTextXSize; }
        let axisPlus1ButtonY = (innerHeight) => { return axisPlaneScreenY(innerHeight) - axisPlane.getHeight(); }
        this.components.push(new RectangleButton("+1", PROGRAM_DATA["team_to_colour"]["Axis"], "#e6f5f4", axisPlus1ButtonX, axisPlus1ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            this.modifyDisplayedBotPlaneCount("Axis", 1);
        }));

        let axisPlus5ButtonX = (innerWidth) => { return axisPlus1ButtonX(innerWidth) + addRemoveButtonSize; }
        let axisPlus5ButtonY = (innerHeight) => { return axisPlaneScreenY(innerHeight) - axisPlane.getHeight(); }
        this.components.push(new RectangleButton("+5", PROGRAM_DATA["team_to_colour"]["Axis"], "#e6f5f4", axisPlus5ButtonX, axisPlus5ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            this.modifyDisplayedBotPlaneCount("Axis", 5);
        }));

        // Bot Details Section
        let botHeaderX = (innerWidth) => { return 1200; }
        let botHeaderY = (innerHeight) => { return innerHeight-27; }
        let botHeaderXSize = 700;
        let botHeaderYSize = 150;
        this.components.push(new TextComponent("Bot Details", "#000000", botHeaderX, axisHeaderY, botHeaderXSize, botHeaderYSize));

        let botBodyX = (innerWidth) => { return botHeaderX(innerWidth); }
        let botBodyY = (innerHeight) => { return botHeaderY(innerHeight) - botHeaderYSize; }
        let botBodyXSize = botHeaderXSize;
        let botBodyYSize = PROGRAM_DATA["settings"]["expected_canvas_height"] - botHeaderYSize - startButtonYSize;
        this.botDetailsComponent = new TextComponent("", "#000000", botBodyX, botBodyY, botBodyXSize, botBodyYSize); 
        this.components.push(this.botDetailsComponent);
        
    }

    // TODO: Comments
    createJSONRep(){
        let jsonRep = {};
        jsonRep["users"] = [];
        // If not a freecam, then add to users list
        let userEntityType = this.userPlanes[this.userPlaneIndex];
        // If not a freecam, then add to users list
        if (userEntityType != "freecam"){
            jsonRep["users"].push({
                "model": userEntityType,
                "id": USER_DATA["name"]
            });
        }

        jsonRep["plane_counts"] = this.planeCounts;
        jsonRep["ally_difficulty"] = this.allyDifficulty;
        jsonRep["axis_difficulty"] = this.axisDifficulty;
        return jsonRep;
    }

    /*
        Method Name: switchPlanes
        Method Parameters: None
        Method Description: Switches between the actively shown planes
        Method Return: void
    */
    switchPlanes(){
        this.userPlaneIndex = (this.userPlaneIndex + 1) % this.userPlanes.length;
        let planeName = this.userPlanes[this.userPlaneIndex];
        return images[planeName];
    }

    /*
        Method Name: switchAxisPlanes
        Method Parameters: None
        Method Description: Switches between the actively shown axis planes
        Method Return: void
    */
    switchAxisPlanes(){
        this.axisPlaneIndex = (this.axisPlaneIndex + 1) % this.axisPlanes.length;
        let planeName = this.axisPlanes[this.axisPlaneIndex];
        this.currentAxisPlaneCountComponent.setText(this.planeCounts[planeName].toString());
        return images[planeName];
    }

    /*
        Method Name: switchAlliedPlanes
        Method Parameters: None
        Method Description: Switches between the actively shown ally planes
        Method Return: void
    */
    switchAlliedPlanes(){
        this.alliedPlaneIndex = (this.alliedPlaneIndex + 1) % this.alliedPlanes.length;
        let planeName = this.alliedPlanes[this.alliedPlaneIndex];
        this.currentAlliedPlaneCountComponent.setText(this.planeCounts[planeName].toString());
        return images[planeName];
    }

    /*
        Method Name: createUserPlaneSelection
        Method Parameters: None
        Method Description: Creates a list of planes for the user to choose between
        Method Return: void
    */
    createUserPlaneSelection(){
        let userPlanes = ["freecam"];
        for (let [planeName, planeData] of Object.entries(PROGRAM_DATA["plane_data"])){
            userPlanes.push(planeName);
        }
        return userPlanes;
    }

    /*
        Method Name: createAlliedPlaneSelection
        Method Parameters: None
        Method Description: Creates a list of ally planes for the user to choose between
        Method Return: void
    */
    createAlliedPlaneSelection(){
        let alliedPlanes = [];
        for (let [planeName, planeData] of Object.entries(PROGRAM_DATA["plane_data"])){
            if (planeModelToAlliance(planeName) == "Allies"){
                alliedPlanes.push(planeName);
                this.planeCounts[planeName] = 0;
            }
        }
        return alliedPlanes;
    }

    /*
        Method Name: createAxisPlaneSelection
        Method Parameters: None
        Method Description: Creates a list of axis planes for the user to choose between
        Method Return: void
    */
    createAxisPlaneSelection(){
        let axisPlanes = [];
        for (let [planeName, planeData] of Object.entries(PROGRAM_DATA["plane_data"])){
            if (planeModelToAlliance(planeName) == "Axis"){
                axisPlanes.push(planeName);
                this.planeCounts[planeName] = 0;
            }
        }
        return axisPlanes;
    }

    /*
        Method Name: modifyDisplayedBotPlaneCount
        Method Parameters:
            alliance:
                Which alliance is gaining/losing plane count
            amount:
                How many (or negative) planes are added/removed from the count
        Method Description: Modifies the counts of planes
        Method Return: void
    */
    modifyDisplayedBotPlaneCount(alliance, amount){
        // Determine which plane is relevant
        let planeName = this.alliedPlanes[this.alliedPlaneIndex];
        if (alliance == "Axis"){
            planeName = this.axisPlanes[this.axisPlaneIndex];
        }

        // Modify the plane's count
        this.planeCounts[planeName] = Math.max(0, this.planeCounts[planeName] + amount);
        
        // Update the text component
        if (alliance == "Axis"){
            this.currentAxisPlaneCountComponent.setText(this.planeCounts[planeName].toString());
        }else{
            this.currentAlliedPlaneCountComponent.setText(this.planeCounts[planeName].toString());
        }

        // Update the "bot details" section
        this.updateBotDetails();
    }

    /*
        Method Name: updateBotDetails
        Method Parameters: None
        Method Description: Modifies the displayed details about the number of bots
        Method Return: void
    */
    updateBotDetails(){
        let botDetailsText = "";
        let alliedDetails = [];
        let axisDetails = [];
        let alliedCount = 0;
        let axisCount = 0;

        // Loop through all plane counts and determine total count per alliance
        for (let [planeName, planeCount] of Object.entries(this.planeCounts)){
            let alliance = planeModelToAlliance(planeName);
            if (alliance == "Allies"){
                alliedDetails.push([planeName, planeCount]);
                alliedCount += planeCount;
            }else{
                axisDetails.push([planeName, planeCount]);
                axisCount += planeCount;
            }
        }

        // Add ally details
        botDetailsText += "Allies" + ": " + alliedCount.toString() + "\n";
        for (let [planeName, planeCount] of alliedDetails){
            botDetailsText += planeName + ": " + planeCount.toString() + "\n";
        }

        // Add axis details
        botDetailsText += "Axis" + ": " + axisCount.toString() + "\n";
        for (let [planeName, planeCount] of axisDetails){
            botDetailsText += planeName + ": " + planeCount.toString() + "\n";
        }
        this.botDetailsComponent.setText(botDetailsText);
    }

    /*
        Method Name: goToGame
        Method Parameters: None
        Method Description: Switches from this menu to the game
        Method Return: void
    */
    goToGame(){
        menuManager.switchTo("game");
    }

    /*
        Method Name: goToMainMenu
        Method Parameters: None
        Method Description: Switches from this menu to the main menu
        Method Return: void
    */
    goToMainMenu(){
        menuManager.switchTo("main");
    }

    /*
        Method Name: cycleAxisDifficulty
        Method Parameters: None
        Method Description: Cycles the ally difficulty
        Method Return: void
        Note: There are many ways to do this. Maybe some are better? Definitely some are cleaner. It's not a big anyway idc.
    */
    cycleAxisDifficulty(){
        let currentIndex = 0;
        for (let key of Object.keys(PROGRAM_DATA["ai"]["fighter_plane"]["bias_ranges"])){
            if (key == this.axisDifficulty){
                break;
            }
            currentIndex++;   
        }
        let maxIndex = Object.keys(PROGRAM_DATA["ai"]["fighter_plane"]["bias_ranges"]).length;
        currentIndex = (currentIndex + 1) % maxIndex;
        this.axisDifficulty = Object.keys(PROGRAM_DATA["ai"]["fighter_plane"]["bias_ranges"])[currentIndex];
    }

    /*
        Method Name: cycleAllyDifficulty
        Method Parameters: None
        Method Description: Cycles the ally difficulty
        Method Return: void
        Note: There are many ways to do this. Maybe some are better? Definitely some are cleaner. It's not a big anyway idc.
    */
    cycleAllyDifficulty(){
        let currentIndex = 0;
        for (let key of Object.keys(PROGRAM_DATA["ai"]["fighter_plane"]["bias_ranges"])){
            if (key == this.allyDifficulty){
                break;
            }
            currentIndex++;   
        }
        let maxIndex = Object.keys(PROGRAM_DATA["ai"]["fighter_plane"]["bias_ranges"]).length;
        currentIndex = (currentIndex + 1) % maxIndex;
        this.allyDifficulty = Object.keys(PROGRAM_DATA["ai"]["fighter_plane"]["bias_ranges"])[currentIndex];
    }

    /*
        Method Name: getAllyDifficulty
        Method Parameters: None
        Method Description: Getter
        Method Return: void
    */
    getAllyDifficulty(){
        return this.allyDifficulty;
    }

    /*
        Method Name: getAxisDifficulty
        Method Parameters: None
        Method Description: Getter
        Method Return: void
    */
    getAxisDifficulty(){
        return this.axisDifficulty;
    }
}