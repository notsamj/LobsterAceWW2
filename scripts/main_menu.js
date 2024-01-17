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
        let buttonX = (FILE_DATA["constants"]["CANVAS_WIDTH"] - buttonSizeX)/2;
            
        // Background
        this.components.push(new StaticImage(images["clouds"], 0, 927));

        // Dog Fight
        let dogFightButtonY = 800;
        this.components.push(new RectangleButton("Dogfight", "#3bc44b", "#e6f5f4", buttonX, dogFightButtonY, buttonSizeX, buttonSizeY, (instance) => {
            menuManager.switchTo("dogfight");
        }));

        // Do not set up the multiplayer button if its disabled
        if (FILE_DATA["constants"]["MULTIPLAYER_DISABLED"]){
            return;
        }

        // Multiplayer
        let multiplayerButtonY = 600;
        this.components.push(new RectangleButton("Multiplayer", "#3bc44b", "#e6f5f4", buttonX, multiplayerButtonY, buttonSizeX, buttonSizeY, async (instance) => {
            menuManager.switchTo("multiplayer");
        }));
    }

}