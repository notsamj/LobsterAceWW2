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
        let buttonX = (innerWidth) => { return (innerWidth - buttonSizeX)/2; }
            
        // Background
        this.components.push(new StaticImage(images["clouds"], () => { return 0; }, (innerHeight) => { return innerHeight; }));

        // Dog Fight
        let dogFightButtonY = (innerHeight) => { return 800; };
        this.components.push(new RectangleButton("Dogfight", "#3bc44b", "#e6f5f4", buttonX, dogFightButtonY, buttonSizeX, buttonSizeY, (instance) => {
            menuManager.switchTo("dogfight");
        }));

        // Information
        let infoY = 250;
        let infoXSize = FILE_DATA["constants"]["EXPECTED_CANVAS_WIDTH"];
        let infoYSize = 200;
        this.components.push(new TextComponent("Made by notsamj. Using p5js version 1.5.\nScroll down for controls.", "black", 0, infoY, infoXSize, infoYSize));

        // Set up Multiplayer button if enabled
        if (!FILE_DATA["constants"]["MULTIPLAYER_DISABLED"]){
            // Multiplayer
            let multiplayerButtonY = (innerHeight) => { return 600; };
            this.components.push(new RectangleButton("Multiplayer", "#3bc44b", "#e6f5f4", buttonX, multiplayerButtonY, buttonSizeX, buttonSizeY, async (instance) => {
                menuManager.switchTo("multiplayer");
            }));
        }

        // Sound
        let soundButtonY = 400;
        this.components.push(new RectangleButton("Sound", "#3bc44b", "#e6f5f4", buttonX, soundButtonY, buttonSizeX, buttonSizeY, async (instance) => {
            menuManager.switchTo("sound");
        }));
    }

}