class MainMenu extends Menu {
    constructor(){
        super();
        this.setup();
    }

    setup(){
        let buttonSizeX = 800;
        let buttonSizeY = 120;
        let buttonX = (fileData["constants"]["CANVAS_WIDTH"] - buttonSizeX)/2;
            
        // Background
        this.components.push(new StaticImage(images["clouds"], 0, 927));

        // Dog Fight
        let dogFightButtonY = 800;
        this.components.push(new RectangleButton("Dogfight", "#3bc44b", "#e6f5f4", buttonX, dogFightButtonY, buttonSizeX, buttonSizeY, (instance) => {
            instance.goToDogFightMenu();
        }));

        // Multiplayer
        let multiplayerButtonY = 600;
        this.components.push(new RectangleButton("Multiplayer", "#3bc44b", "#e6f5f4", buttonX, multiplayerButtonY, buttonSizeX, buttonSizeY, async (instance) => {
            activeGameMode = await RemoteDogfight.create(new ServerConnection());
            menuManager.switchTo("game");
        }));
    }

    goToDogFightMenu(){
        menuManager.switchTo("dogfight");
    }

}