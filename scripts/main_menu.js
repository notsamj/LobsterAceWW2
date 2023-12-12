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
    }

    goToDogFightMenu(){
        menuManager.switchTo("dogfight");
    }

}