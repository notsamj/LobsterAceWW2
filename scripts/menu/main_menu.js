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
        let dogFightButtonY = (innerHeight) => { return innerHeight - gapSize; };
        this.components.push(new RectangleButton("Dogfight", "#3bc44b", "#e6f5f4", buttonX, dogFightButtonY, buttonSizeX, buttonSizeY, (menuInstance) => {
            MENU_MANAGER.switchTo("dogfight");
        }));

        // Information
        let infoY = 250;
        let infoXSize = (PROGRAM_DATA["settings"]["expected_canvas_width"] - buttonSizeX)/2;
        let infoYSize = 200;
        this.components.push(new TextComponent("Made by notsamj.\nScroll down for controls.", "#000000", 0, infoY, infoXSize, infoYSize));

        // Campaign
        let campaignButtonY = (innerHeight) => { return dogFightButtonY(innerHeight) - buttonSizeY - gapSize; }
        this.components.push(new RectangleButton("Campaign", "#3bc44b", "#e6f5f4", buttonX, campaignButtonY, buttonSizeX, buttonSizeY, (menuInstance) => {
            MENU_MANAGER.switchTo("campaign");
        }));

        // Multiplayer
        let multiplayerButtonY = (innerHeight) => { return campaignButtonY(innerHeight) - buttonSizeY - gapSize; }
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
        let soundButtonY = (innerHeight) => { return multiplayerButtonY(innerHeight) - buttonSizeY - gapSize; }
        this.components.push(new RectangleButton("Sound", "#3bc44b", "#e6f5f4", buttonX, soundButtonY, buttonSizeX, buttonSizeY, async (menuInstance) => {
            MENU_MANAGER.switchTo("sound");
        }));

        // Extra Settings
        let extraSettingsY = (innerHeight) => { return soundButtonY(innerHeight) - buttonSizeY - gapSize; }
        this.components.push(new RectangleButton("Settings", "#3bc44b", "#e6f5f4", buttonX, extraSettingsY, buttonSizeX, buttonSizeY, async (menuInstance) => {
            MENU_MANAGER.switchTo("extraSettings");
        }));
    }

}