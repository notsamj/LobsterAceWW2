/*
    Class Name: CampaignMenu
    Description: The menu used to select missions
    Note: Assumes >= 1 mission in the data
*/
class CampaignMenu extends Menu {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        super();
        this.setup();
    }

    /*
        Method Name: setup
        Method Parameters: None
        Method Description: Setup components in the menu
        Method Return: void
    */
    setup(){
        // Background
        this.components.push(new AnimatedCloudBackground())

        let backButtonX = () => { return 50; }
        let backButtonY = (innerHeight) => { return innerHeight-27; }
        let backButtonXSize = 200;
        let backButtonYSize = 76;
        this.components.push(new RectangleButton("Main Menu", "#3bc44b", "#e6f5f4", backButtonX, backButtonY, backButtonXSize, backButtonYSize, (menuInstance) => {
            MENU_MANAGER.switchTo("main");
        }));

        // Current mission being examined
        this.missionIndex = 0;

        let nextPreviousButtonSize = 200;
        let nextPreviousButtonY = (innerHeight) => { return innerHeight / 2 + nextPreviousButtonSize/2; }
            
        // Previous Button
        this.components.push(new RectangleButton("Previous", (PROGRAM_DATA["missions"].length > 1 ? "#3bc44b" : "#ebebed"), "#e6f5f4", 0, nextPreviousButtonY, nextPreviousButtonSize, nextPreviousButtonSize, (menuInstance) => {
            menuInstance.previous();
        }));

        // Next Button
        this.components.push(new RectangleButton("Next", (PROGRAM_DATA["missions"].length > 1 ? "#3bc44b" : "#ebebed"), "#e6f5f4", (innerWidth) => { return innerWidth - nextPreviousButtonSize; }, nextPreviousButtonY, nextPreviousButtonSize, nextPreviousButtonSize, (menuInstance) => {
            menuInstance.next();
        }));

        // Go to mission start screen
        let startMissionButtonXSize = 600;
        let startMissionButtonYSize = 200;
        let startMissionButtonX = (innerWidth) => { return innerWidth / 2 - startMissionButtonXSize /2; }
        let startMissionButtonY = startMissionButtonYSize;
        this.components.push(new RectangleButton("Select Mission", "#3bc44b", "#e6f5f4", startMissionButtonX, startMissionButtonY, startMissionButtonXSize, startMissionButtonYSize, (menuInstance) => {
            MENU_MANAGER.getMenuByName("missionStart").loadMission(this.missionIndex);
            MENU_MANAGER.switchTo("missionStart");
        }));

        // Mission Details
        let missionDetailsXSize = startMissionButtonXSize;
        let missionDetailsYSize = 400;
        let missionDetailsX = (innerWidth) => { return innerWidth / 2 - missionDetailsXSize /2; }
        let missionDetailsY = missionDetailsYSize + startMissionButtonYSize;
        this.missionDetailsTextComponent = new TextComponent("", "#000000", missionDetailsX, missionDetailsY, missionDetailsXSize, missionDetailsYSize);
        this.components.push(this.missionDetailsTextComponent);

        // Load details of current mission
        this.loadCurrentMission();
    }

    /*
        Method Name: next
        Method Parameters: None
        Method Description: Selects the next mission
        Method Return: void
    */
    next(){
        if (PROGRAM_DATA["missions"].length < 2){ return; }
        this.missionIndex = (this.missionIndex + 1) % PROGRAM_DATA["missions"].length;
        this.loadCurrentMission();
    }

    /*
        Method Name: previous
        Method Parameters: None
        Method Description: Selects the previous mission
        Method Return: void
    */
    previous(){
        if (PROGRAM_DATA["missions"].length < 2){ return; }
        this.missionIndex = this.missionIndex == 0 ? PROGRAM_DATA["missions"].length - 1 : (this.missionIndex - 1);
        this.loadCurrentMission();
    }

    /*
        Method Name: loadCurrentMission
        Method Parameters: None
        Method Description: Loads the current mission
        Method Return: void
    */
    loadCurrentMission(){
        this.missionDetailsTextComponent.setText(PROGRAM_DATA["missions"][this.missionIndex]["description"]);
    }

}