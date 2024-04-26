/*
    Class Name: HostMenu
    Description: A subclass of Menu specific for hosting a dogfight or mission
*/
class HostMenu extends Menu {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        super();

        // Locks
        this.switchGamemodeLock = new Lock();

        // Dogfight & Mission
        this.userPlanes = this.createUserPlaneSelection();
        this.userPlaneIndex = 0;
        this.allyDifficulty = "easy";
        this.axisDifficulty = "easy";
        
        // Dogfight Specific
        this.planeCounts = {};
        this.alliedPlanes = this.createAlliedPlaneSelection();
        this.alliedPlaneIndex = 0;
        this.axisPlanes = this.createAxisPlaneSelection();
        this.axisPlaneIndex = 0;
        this.currentAlliedPlaneCountComponent = null;
        this.currentAxisPlaneCountComponent = null;
        this.botDetailsComponent = null;

        // Mission Specific
        this.mission = PROGRAM_DATA["missions"][0];

        this.setup();

        // Dogfight Specific
        this.updateBotDetails();
    }

    /*
        Method Name: switchToDogfight
        Method Parameters: None
        Method Description: Attempts to switch the current game mode to Dogfight by contacting the server
        Method Return: void
    */
    async switchToDogfight(){
        if (this.switchGamemodeLock.isLocked()){ return; }
        this.switchGamemodeLock.lock();
        let response = await SERVER_CONNECTION.sendMail({"action": "switch_gamemode", "new_gamemode": "dogfight"}, "switch_gamemode");
        this.switchGamemodeLock.unlock();
        if (!response || !response["success"]){
            MENU_MANAGER.addTemporaryMessage("Failed to switch to a dogfight.", "#ff0000", 5000);
            return;
        }
        this.userPlanes = this.createUserPlaneSelection();
        this.userPlaneIndex = 0;
        this.alliedPlaneIndex = 0;
        this.axisPlaneIndex = 0;

        this.alliedHeader.fullEnable();
        this.axisHeader.fullEnable();
        this.botHeader.fullEnable();

        this.alliedPlus5Button.fullEnable();
        this.axisPlus5Button.fullEnable();

        this.alliedPlus1Button.fullEnable();
        this.axisPlus1Button.fullEnable();

        this.alliedMinus1Button.fullEnable();
        this.axisMinus1Button.fullEnable();

        this.alliedMinus5Button.fullEnable();
        this.axisMinus5Button.fullEnable();

        this.currentAlliedPlaneCountComponent.fullEnable();
        this.currentAxisPlaneCountComponent.fullEnable();
        this.botDetailsComponent.fullEnable();

        this.switchToMissionButton.fullEnable();

        this.alliedDifficultyHeader.fullDisable();
        this.axisDifficultyHeader.fullDisable();

        this.switchToDogfightButton.fullDisable();
        this.missionPreviousButton.fullDisable();
        this.missionNextButton.fullDisable();

        this.alliedPlaneImage.fullEnable();
        this.axisPlaneImage.fullEnable();

        this.resetSettings();
    }


    /*
        Method Name: createUserMissionPlaneSelection
        Method Parameters:
            mission:
                A mission object
        Method Description: Creates a list of possible planes for a user to fly in a mission
        Method Return: List of plane models
    */
    createUserMissionPlaneSelection(mission){
        let userPlanes = ["freecam"];
        for (let planeName of mission["user_planes"]){
            userPlanes.push(planeName);
        }
        return userPlanes;
    }


    /*
        Method Name: switchToMission
        Method Parameters: None
        Method Description: Tries to switch the game mode to mission by contacting the server
        Method Return: void
    */
    async switchToMission(){
        if (this.switchGamemodeLock.isLocked()){ return; }
        this.switchGamemodeLock.lock();
        let response = await SERVER_CONNECTION.sendMail({"action": "switch_gamemode", "new_gamemode": "mission"}, "switch_gamemode");
        this.switchGamemodeLock.unlock();
        if (!response || !response["success"]){
            MENU_MANAGER.addTemporaryMessage("Failed to switch to a mission.", "#ff0000", 5000);
            return;
        }
        // Create planes from mission object
        this.mission = PROGRAM_DATA["missions"][0];
        this.userPlanes = this.createUserMissionPlaneSelection(this.mission);
        this.userPlaneIndex = 0;

        this.alliedHeader.fullDisable();
        this.axisHeader.fullDisable();
        this.botHeader.fullDisable();

        this.alliedPlus5Button.fullDisable();
        this.axisPlus5Button.fullDisable();

        this.alliedPlus1Button.fullDisable();
        this.axisPlus1Button.fullDisable();

        this.alliedMinus1Button.fullDisable();
        this.axisMinus1Button.fullDisable();

        this.alliedMinus5Button.fullDisable();
        this.axisMinus5Button.fullDisable();

        this.currentAlliedPlaneCountComponent.fullDisable();
        this.currentAxisPlaneCountComponent.fullDisable();
        this.botDetailsComponent.fullDisable();

        this.switchToMissionButton.fullDisable();

        this.alliedDifficultyHeader.fullEnable();
        this.axisDifficultyHeader.fullEnable();

        this.switchToDogfightButton.fullEnable();
        this.missionPreviousButton.fullEnable();
        this.missionNextButton.fullEnable();

        this.alliedPlaneImage.fullDisable();
        this.axisPlaneImage.fullDisable();

        this.resetSettings();
    }


    /*
        Method Name: resetSettings
        Method Parameters: None
        Method Description: Resets the settings of the menu
        Method Return: void
    */
    resetSettings(){
        // Reset the settings
        this.userPlaneIndex = 0;
        this.alliedPlaneIndex = 0;
        this.axisPlaneIndex = 0;
        this.allyDifficulty = "easy";
        this.axisDifficulty = "easy";

        // Update plane counts
        for (let key of Object.keys(this.planeCounts)){
            this.planeCounts[key] = 0;
        }

        // Update the UI
        this.userPlaneStaticImage.setImage(IMAGES[this.userPlanes[this.userPlaneIndex]]);
        this.axisPlaneImage.setImage(IMAGES[this.axisPlanes[this.axisPlaneIndex]]);
        this.alliedPlaneImage.setImage(IMAGES[this.alliedPlanes[this.alliedPlaneIndex]]);
        this.currentAxisPlaneCountComponent.setText("0");
        this.currentAlliedPlaneCountComponent.setText("0");
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
        this.components.push(new AnimatedCloudBackground());

        // Back Button
        let backButtonX = () => { return 50; }
        let backButtonY = (innerHeight) => { return innerHeight-27; }
        let backButtonXSize = 200;
        let backButtonYSize = 76;
        this.components.push(new RectangleButton("Main Menu", "#3bc44b", "#e6f5f4", backButtonX, backButtonY, backButtonXSize, backButtonYSize, (menuInstance) => {
            menuInstance.goToMainMenu();
        }));

        // Start Button
        let startButtonX = () => { return 50; }
        let startButtonY = () => { return 200; }
        let startButtonXSize = (innerWidth) => { return innerWidth-50*2; }
        let startButtonYSize = 200;
        this.components.push(new RectangleButton("Start", "#c72d12", "#e6f5f4", startButtonX, startButtonY, startButtonXSize, startButtonYSize, async (menuInstance) => {
            let response = await SERVER_CONNECTION.sendMail({"action": "host_start_game"}, "host");
            if (!response || !response["success"]){
                MENU_MANAGER.addTemporaryMessage("Failed to start game.", "#ff0000", 50000);
                return;
            }
            menuInstance.resetSettings();
        }));

        // User Section
        let userHeaderX = () => { return 300; }
        let userHeaderY = (innerHeight) => { return innerHeight - 27; }
        let userHeaderXSize = 200;
        let userHeaderYSize = 100;
        this.components.push(new TextComponent("User", "#4b42f5", userHeaderX, userHeaderY, userHeaderXSize, userHeaderYSize));

        let userPlaneX = () => { return 350; };
        let userPlaneScreenY = (innerHeight) => { return innerHeight - 127; }
        let userPlane = new StaticImage(IMAGES[this.userPlanes[0]], userPlaneX, userPlaneScreenY, 128, 128);
        userPlane.setOnClick(() => {
            userPlane.setImage(this.switchPlanes()); 
        });
        this.userPlaneStaticImage = userPlane;
        this.components.push(userPlane);

        // Allied Section
        let alliedHeaderX = () => { return 600; }
        let alliesHeaderY = (innerHeight) => { return innerHeight - 27; }
        let alliedHeaderXSize = 270;
        let alliesHeaderYSize = 100;
        this.alliedHeader = new TextComponent("Allies", PROGRAM_DATA["team_to_colour"]["Allies"], alliedHeaderX, alliesHeaderY, alliedHeaderXSize, alliesHeaderYSize);
        this.components.push(this.alliedHeader);

        let alliedPlaneX = () => { return 650; }
        let alliedPlaneScreenY = (innerHeight) => { return innerHeight - 127; };
        let alliedPlane = new StaticImage(IMAGES[this.alliedPlanes[0]], alliedPlaneX, alliedPlaneScreenY, 128, 128);
        alliedPlane.setOnClick(() => {
            alliedPlane.setImage(this.switchAlliedPlanes()); 
        });
        this.alliedPlaneImage = alliedPlane;
        this.components.push(alliedPlane);

        let alliedMinus5ButtonX = (innerWidth) => { return alliedHeaderX(innerWidth); }
        let alliedMinus5ButtonY = (innerHeight) => { return alliedPlaneScreenY(innerHeight) - alliedPlane.getMaxHeight(); };
        this.alliedMinus5Button = new RectangleButton("-5", PROGRAM_DATA["team_to_colour"]["Allies"], "#e6f5f4", alliedMinus5ButtonX, alliedMinus5ButtonY, addRemoveButtonSize, addRemoveButtonSize, (menuInstance) => {
            this.modifyDisplayedBotPlaneCount("Allies", -5);
        });
        this.components.push(this.alliedMinus5Button);

        let allyDifficultyButtonX = (innerWidth) => { return alliedHeaderX(innerWidth); }
        let allyDifficultyButtonY = (innerHeight) => { return alliedPlaneScreenY(innerHeight) - alliedPlane.getMaxHeight() - addRemoveButtonSize; }
        this.components.push(new RectangleButton(() => { return this.getAllyDifficulty(); }, PROGRAM_DATA["team_to_colour"]["Allies"], "#e6f5f4", allyDifficultyButtonX, allyDifficultyButtonY, addRemoveButtonSize*3, addRemoveButtonSize*3, (menuInstance) => {
            this.cycleAllyDifficulty();
        }));

        let alliedMinus1ButtonX = (innerWidth) => { return alliedMinus5ButtonX(innerWidth) + addRemoveButtonSize; }
        let alliedMinus1ButtonY = (innerHeight) => { return alliedPlaneScreenY(innerHeight) - alliedPlane.getMaxHeight(); }
        this.alliedMinus1Button = new RectangleButton("-1", PROGRAM_DATA["team_to_colour"]["Allies"], "#e6f5f4", alliedMinus1ButtonX, alliedMinus1ButtonY, addRemoveButtonSize, addRemoveButtonSize, (menuInstance) => {
            this.modifyDisplayedBotPlaneCount("Allies", -1);
        })
        this.components.push(this.alliedMinus1Button);

        let alliedCurrentCountTextX = (innerWidth) => { return alliedMinus1ButtonX(innerWidth) + addRemoveButtonSize; }
        let alliedCurrentCountTextY = (innerHeight) => { return alliedPlaneScreenY(innerHeight) - alliedPlane.getMaxHeight(); }
        let alliedCurrentCountTextXSize = 50;
        let alliedCurrentCountTextYSize = 50;
        this.currentAlliedPlaneCountComponent = new TextComponent("0", PROGRAM_DATA["team_to_colour"]["Allies"], alliedCurrentCountTextX, alliedCurrentCountTextY, alliedCurrentCountTextXSize, alliedCurrentCountTextYSize, "center", "middle");
        this.components.push(this.currentAlliedPlaneCountComponent);

        let alliedPlus1ButtonX = (innerWidth) => { return alliedCurrentCountTextX(innerWidth) + alliedCurrentCountTextXSize; }
        let alliedPlus1ButtonY = (innerHeight) => { return alliedPlaneScreenY(innerHeight) - alliedPlane.getMaxHeight(); }
        this.alliedPlus1Button = new RectangleButton("+1", PROGRAM_DATA["team_to_colour"]["Allies"], "#e6f5f4", alliedPlus1ButtonX, alliedPlus1ButtonY, addRemoveButtonSize, addRemoveButtonSize, (menuInstance) => {
            this.modifyDisplayedBotPlaneCount("Allies", 1);
        });
        this.components.push(this.alliedPlus1Button);

        let alliedPlus5ButtonX = (innerWidth) => { return alliedPlus1ButtonX(innerWidth) + addRemoveButtonSize; }
        let alliedPlus5ButtonY = (innerHeight) => { return alliedPlaneScreenY(innerHeight) - alliedPlane.getMaxHeight(); }
        this.alliedPlus5Button = new RectangleButton("+5", PROGRAM_DATA["team_to_colour"]["Allies"], "#e6f5f4", alliedPlus5ButtonX, alliedPlus5ButtonY, addRemoveButtonSize, addRemoveButtonSize, (menuInstance) => {
            this.modifyDisplayedBotPlaneCount("Allies", 5);
        });
        this.components.push(this.alliedPlus5Button);

        // Axis Section
        let axisHeaderX = () => { return 900; }
        let axisHeaderY = (innerHeight) => { return innerHeight - 27; }
        let axisHeaderXSize = 200;
        let axisHeaderYSize = 100;
        this.axisHeader = new TextComponent("Axis", PROGRAM_DATA["team_to_colour"]["Axis"], axisHeaderX, axisHeaderY, axisHeaderXSize, axisHeaderYSize);
        this.components.push(this.axisHeader);


        let axisPlaneX = () => { return 950; }
        let axisPlaneScreenY = (innerHeight) => { return innerHeight - 127; }
        let axisPlane = new StaticImage(IMAGES[this.axisPlanes[0]], axisPlaneX, axisPlaneScreenY, 128, 128);
        axisPlane.setOnClick(() => {
            axisPlane.setImage(this.switchAxisPlanes()); 
        });
        this.axisPlaneImage = axisPlane;
        this.components.push(axisPlane);

        let axisMinus5ButtonX = (innerWidth) => { return axisHeaderX(innerWidth); }
        let axisMinus5ButtonY = (innerHeight) => { return axisPlaneScreenY(innerHeight) - axisPlane.getMaxHeight(); }
        this.axisMinus5Button = new RectangleButton("-5", PROGRAM_DATA["team_to_colour"]["Axis"], "#e6f5f4", axisMinus5ButtonX, axisMinus5ButtonY, addRemoveButtonSize, addRemoveButtonSize, (menuInstance) => {
            this.modifyDisplayedBotPlaneCount("Axis", -5);
        });
        this.components.push(this.axisMinus5Button);

        let axisDifficultyButtonX = (innerWidth) => { return axisHeaderX(innerWidth); }
        let axisDifficultyButtonY = (innerHeight) => { return axisPlaneScreenY(innerHeight) - axisPlane.getMaxHeight() - addRemoveButtonSize; }
        this.components.push(new RectangleButton(() => { return this.getAxisDifficulty(); }, PROGRAM_DATA["team_to_colour"]["Axis"], "#e6f5f4", axisDifficultyButtonX, axisDifficultyButtonY, addRemoveButtonSize*3, addRemoveButtonSize*3, (menuInstance) => {
            this.cycleAxisDifficulty();
        }));

        let axisMinus1ButtonX = (innerWidth) => { return axisMinus5ButtonX(innerWidth) + addRemoveButtonSize; }
        let axisMinus1ButtonY = (innerHeight) => { return axisPlaneScreenY(innerHeight) - axisPlane.getMaxHeight(); }
        this.axisMinus1Button = new RectangleButton("-1", PROGRAM_DATA["team_to_colour"]["Axis"], "#e6f5f4", axisMinus1ButtonX, axisMinus1ButtonY, addRemoveButtonSize, addRemoveButtonSize, (menuInstance) => {
            this.modifyDisplayedBotPlaneCount("Axis", -1);
        });
        this.components.push(this.axisMinus1Button);

        let axisCurrentCountTextX = (innerWidth) => { return axisMinus1ButtonX(innerWidth) + addRemoveButtonSize; }
        let axisCurrentCountTextY = (innerHeight) => { return axisPlaneScreenY(innerHeight) - axisPlane.getMaxHeight(); }
        let axisCurrentCountTextXSize = 50;
        let axisCurrentCountTextYSize = 50;
        this.currentAxisPlaneCountComponent = new TextComponent("0", PROGRAM_DATA["team_to_colour"]["Axis"], axisCurrentCountTextX, axisCurrentCountTextY, axisCurrentCountTextXSize, axisCurrentCountTextYSize, "center", "middle");
        this.components.push(this.currentAxisPlaneCountComponent);

        let axisPlus1ButtonX = (innerWidth) => { return axisCurrentCountTextX(innerWidth) + axisCurrentCountTextXSize; }
        let axisPlus1ButtonY = (innerHeight) => { return axisPlaneScreenY(innerHeight) - axisPlane.getMaxHeight(); }
        this.axisPlus1Button = new RectangleButton("+1", PROGRAM_DATA["team_to_colour"]["Axis"], "#e6f5f4", axisPlus1ButtonX, axisPlus1ButtonY, addRemoveButtonSize, addRemoveButtonSize, (menuInstance) => {
            this.modifyDisplayedBotPlaneCount("Axis", 1);
        });
        this.components.push(this.axisPlus1Button);

        let axisPlus5ButtonX = (innerWidth) => { return axisPlus1ButtonX(innerWidth) + addRemoveButtonSize; }
        let axisPlus5ButtonY = (innerHeight) => { return axisPlaneScreenY(innerHeight) - axisPlane.getMaxHeight(); }
        this.axisPlus5Button = new RectangleButton("+5", PROGRAM_DATA["team_to_colour"]["Axis"], "#e6f5f4", axisPlus5ButtonX, axisPlus5ButtonY, addRemoveButtonSize, addRemoveButtonSize, (menuInstance) => {
            this.modifyDisplayedBotPlaneCount("Axis", 5);
        });
        this.components.push(this.axisPlus5Button);

        // Bot Details Section
        this.botDetailsComponent = new BotDetails(this, axisHeaderY);
            
        // Switch Buttons
        let switchButtonX = 150;
        let switchButtonY = 400;
        let switchButtonXSize = 300;
        let switchButtonYSize = 200;

        // Switch to Mission Button
        this.switchToMissionButton = new RectangleButton("Switch To Mission", "#3bc44b", "#e6f5f4", switchButtonX, switchButtonY, switchButtonXSize, switchButtonYSize, (menuInstance) => {
            menuInstance.switchToMission();
        });
        this.components.push(this.switchToMissionButton);
        // Switch to Dogfight Button
        this.switchToDogfightButton = new RectangleButton("Switch To Dogfight", "#3bc44b", "#e6f5f4", switchButtonX, switchButtonY, switchButtonXSize, switchButtonYSize, (menuInstance) => {
            menuInstance.switchToDogfight();
        });
        this.components.push(this.switchToDogfightButton);
        this.switchToDogfightButton.fullDisable();

        // Mission Details Area
        let missionDetailsButtonXSize = 600;
        let missionDetailsButtonYSize = 400;
        let missionDetailsX = switchButtonX;
        let missionDetailsY = switchButtonY + missionDetailsButtonYSize;
        this.missionDetails = new TextComponent("", "#6f5f4", missionDetailsX, missionDetailsY, missionDetailsButtonXSize, missionDetailsButtonYSize);
        this.missionDetails.fullDisable();

        let nextPreviousButtonSize = 100;
        let nextPreviousButtonY = switchButtonY;
        
        // Switch Mission Previous Button
        this.missionPreviousButton = new RectangleButton("Previous", (PROGRAM_DATA["missions"].length > 1 ? "#3bc44b" : "#ebebed"), "#e6f5f4", switchButtonX - nextPreviousButtonSize, nextPreviousButtonY, nextPreviousButtonSize, nextPreviousButtonSize, (menuInstance) => {
            menuInstance.previous();
        });
        this.missionPreviousButton.fullDisable();
        this.components.push(this.missionPreviousButton);

        // Switch Mission Next Button  
        this.missionNextButton = new RectangleButton("Next", (PROGRAM_DATA["missions"].length > 1 ? "#3bc44b" : "#ebebed"), "#e6f5f4", switchButtonX+switchButtonXSize, nextPreviousButtonY, nextPreviousButtonSize, nextPreviousButtonSize, (menuInstance) => {
            menuInstance.next();
        })
        this.missionNextButton.fullDisable();
        this.components.push(this.missionNextButton);

        // Ally and Axis Difficulty Headers
        let alliedDifficultyHeaderX = () => { return 600; }
        let alliedDifficultyHeaderY = (innerHeight) => { return innerHeight - 27; }
        let alliedDifficultyHeaderXSize = 270;
        let alliedDifficultyHeaderYSize = 100;
        this.alliedDifficultyHeader = new TextComponent("Allied Difficulty", PROGRAM_DATA["team_to_colour"]["Allies"], alliedDifficultyHeaderX, alliedDifficultyHeaderY, alliedDifficultyHeaderXSize, alliedDifficultyHeaderYSize);
        this.alliedDifficultyHeader.fullDisable();
        this.components.push(this.alliedDifficultyHeader);

        let axisDifficultyHeaderX = () => { return 900; }
        let axisDifficultyHeaderY = (innerHeight) => { return innerHeight - 27; }
        let axisDifficultyHeaderXSize = 200;
        let axisDifficultyHeaderYSize = 100;
        this.axisDifficultyHeader = new TextComponent("Axis Difficulty", PROGRAM_DATA["team_to_colour"]["Axis"], axisDifficultyHeaderX, axisDifficultyHeaderY, axisDifficultyHeaderXSize, axisDifficultyHeaderYSize);
        this.axisDifficultyHeader.fullDisable();
        this.components.push(this.axisDifficultyHeader);
    }

    /*
        Method Name: next
        Method Parameters: None
        Method Description: Selects the next mission
        Method Return: void
    */
    async next(){
        if (PROGRAM_DATA["missions"].length < 2){ return; }
        if (this.switchGamemodeLock.isLocked()){ return; }
        this.switchGamemodeLock.lock();
        let newMission = PROGRAM_DATA["missions"][this.mission["id"]+1 % PROGRAM_DATA["missions"].length];
        let response = await SERVER_CONNECTION.sendMail({"action": "switch_mission", "new_mission_id": newMission["id"]}, "switch_mission");
        this.switchGamemodeLock.unlock();
        if (!response || !response["success"]){
            MENU_MANAGER.addTemporaryMessage("Failed to switch to next mission.", "#ff0000", 5000);
            return;
        }
        this.mission = newMission;
        this.loadCurrentMission();
    }

    /*
        Method Name: previous
        Method Parameters: None
        Method Description: Selects the previous mission
        Method Return: void
    */
    async previous(){
        if (PROGRAM_DATA["missions"].length < 2){ return; }
        if (this.switchGamemodeLock.isLocked()){ return; }
        this.switchGamemodeLock.lock();
        let newMission = this.mission["id"] == 0 ? PROGRAM_DATA["missions"][PROGRAM_DATA["missions"].length - 1] : PROGRAM_DATA["missions"][this.mission["id"] - 1];
        let response = await SERVER_CONNECTION.sendMail({"action": "switch_mission", "new_mission_id": newMission["id"]}, "switch_mission");
        this.switchGamemodeLock.unlock();
        if (!response || !response["success"]){
            MENU_MANAGER.addTemporaryMessage("Failed to switch to previous mission.", "#ff0000", 5000);
            return;
        }
        this.mission = newMission;
        this.loadCurrentMission();
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
        SERVER_CONNECTION.updateUserPreference(planeName);
        return IMAGES[planeName];
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
        return IMAGES[planeName];
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
        return IMAGES[planeName];
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
        this.sendSettingUpdateToServer();
    }

    /*
        Method Name: updateBotDetails
        Method Parameters: None
        Method Description: Modifies the displayed details about the number of bots
        Method Return: void
    */
    updateBotDetails(){
        this.botDetailsComponent.update(this.planeCounts);
    }

    /*
        Method Name: goToMainMenu
        Method Parameters: None
        Method Description: Switches from this menu to the main menu
        Method Return: void
    */
    goToMainMenu(){
        SERVER_CONNECTION.sendJSON({"action": "leave_game"});
        //MENU_MANAGER.switchTo("main");
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
        this.sendSettingUpdateToServer();
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
        this.sendSettingUpdateToServer();
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


    /*
        Method Name: sendSettingUpdateToServer
        Method Parameters: None
        Method Description: Sends a JSON object of settings to the server
        Method Return: void
    */
    sendSettingUpdateToServer(){
        let settings = {
            "bot_counts": this.planeCounts,
            "axis_difficulty": this.axisDifficulty,
            "ally_difficulty": this.allyDifficulty,
            "bullet_physics_enabled": PROGRAM_DATA["settings"]["use_physics_bullets"],
            "human_health_multiplier": PROGRAM_DATA["settings"]["human_health_multiplier"],
            "human_damage_multiplier": PROGRAM_DATA["settings"]["human_damage_multiplier"],
            "mission_id": this.mission["id"]
        }
        SERVER_CONNECTION.hostUpdateSettings(settings);
    }
}