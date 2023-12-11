class MainMenu extends Menu {
    constructor(){
        super();
        this.setup();
    }

    setup(){
        this.background = images["clouds"];
        let buttonSizeX = 800;
        let buttonSizeY = 120;
        let buttonX = (fileData["constants"]["CANVAS_WIDTH"] - buttonSizeX)/2;
        
        // Dog Fight
        let dogFightButtonY = 800;
        this.components.push(new RectangleButton("Dog Fight", "#3bc44b", "#e6f5f4", buttonX, dogFightButtonY, buttonSizeX, buttonSizeY, (instance) => {
            instance.goToDogFightMenu();
        }));
    }

    goToDogFightMenu(){
        console.log("Go to dog fight menu!")
    }

}