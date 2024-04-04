/*
    Class Name: MainMenu
    Description: The main menu inferface
*/
class MainMenu extends Menu {
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
        let buttonSizeX = 800;
        let buttonSizeY = 120;
        let gapSize = 40;
        let buttonX = (innerWidth) => { return (innerWidth - buttonSizeX)/2; }
            
        // Background
        this.components.push(new AnimatedCloudBackground())

        // Dog Fight
        let dogFightButtonY = (innerHeight) => { return 927 - gapSize; };
        this.components.push(new RectangleButton("Dogfight", "#3bc44b", "#e6f5f4", buttonX, dogFightButtonY, buttonSizeX, buttonSizeY, (menuInstance) => {
            MENU_MANAGER.switchTo("dogfight");
        }));

        // Information
        let infoY = 250;
        let infoXSize = (PROGRAM_DATA["settings"]["expected_canvas_width"] - buttonSizeX)/2;
        let infoYSize = 200;
        this.components.push(new TextComponent("Made by notsamj. Using p5js version 1.5.\nScroll down for controls.", "black", 0, infoY, infoXSize, infoYSize));

        // Campaign
        let campaignButtonY = dogFightButtonY() - buttonSizeY - gapSize;
        this.components.push(new RectangleButton("Campaign", "#3bc44b", "#e6f5f4", buttonX, campaignButtonY, buttonSizeX, buttonSizeY, (menuInstance) => {
            MENU_MANAGER.switchTo("campaign");
        }));

        // Multiplayer
        let multiplayerButtonY = campaignButtonY - buttonSizeY - gapSize;
        let multiplayerButton = new RectangleButton("Multiplayer", "#3bc44b", "#e6f5f4", buttonX, multiplayerButtonY, buttonSizeX, buttonSizeY, async (menuInstance) => {
            MENU_MANAGER.switchTo("multiplayer");
        });
        this.components.push(multiplayerButton);
        // If multiplayer is disabled
        if (PROGRAM_DATA["settings"]["multiplayer_disabled"]){
            multiplayerButton.disable();
            multiplayerButton.setColour("#cccccc");
        }

        // Sound
        let soundButtonY = multiplayerButtonY - buttonSizeY - gapSize;
        this.components.push(new RectangleButton("Sound", "#3bc44b", "#e6f5f4", buttonX, soundButtonY, buttonSizeX, buttonSizeY, async (menuInstance) => {
            MENU_MANAGER.switchTo("sound");
        }));

        // Extra Settings
        let extraSettingsY = soundButtonY - buttonSizeY - gapSize;
        this.components.push(new RectangleButton("Settings", "#3bc44b", "#e6f5f4", buttonX, extraSettingsY, buttonSizeX, buttonSizeY, async (menuInstance) => {
            MENU_MANAGER.switchTo("extraSettings");
        }));
    }

}