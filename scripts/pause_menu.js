class PauseMenu extends Menu {
    constructor(){
        super();
        this.setup();
    }

    setup(){
        let buttonSizeX = 800;
        let buttonSizeY = 120;
        let buttonX = (fileData["constants"]["CANVAS_WIDTH"] - buttonSizeX)/2;

        // Resume
        let resumeButtonY = 800;
        this.components.push(new RectangleButton("Resume game", "#3bc44b", "#e6f5f4", buttonX, resumeButtonY, buttonSizeX, buttonSizeY, (instance) => {
            menuManager.switchTo("game");
        }));

        // Main Menu
        let mainMenuButtonY = 600;
        this.components.push(new RectangleButton("Return to main menu", "#3bc44b", "#e6f5f4", buttonX, mainMenuButtonY, buttonSizeX, buttonSizeY, (instance) => {
            instance.goToMainMenu();
            activeGameMode = null;
        }));
    }
    goToMainMenu(){
        scene.disableDisplay();
        menuManager.switchTo("main");
    }
}