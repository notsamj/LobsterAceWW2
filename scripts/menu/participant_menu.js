/*
    Class Name: ParticipantMenu
    Description: A subclass of Menu specific to being a participant in a lobby
*/
// TODO: File needs comments
class ParticipantMenu extends Menu {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        super();
        this.userPlanes = this.createUserPlaneSelection();
        this.userPlaneIndex = 0;
        this.botDetailsComponent = null;
        this.setup();
    }

    resetSettings(){
        this.userPlaneIndex = 0;

        // Update the UI
        this.userPlaneStaticImage.setImage(images[this.userPlanes[this.userPlaneIndex]]);
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
        this.components.push(new AnimatedCloudBackground())

        // Back Button
        let backButtonX = () => { return 50; }
        let backButtonY = (innerHeight) => { return innerHeight-27; }
        let backButtonXSize = 200;
        let backButtonYSize = 76;
        this.components.push(new RectangleButton("Main Menu", "#3bc44b", "#e6f5f4", backButtonX, backButtonY, backButtonXSize, backButtonYSize, (instance) => {
            instance.goToMainMenu();
        }));

        // User Section

        let userHeaderX = () => { return 300; }
        let userHeaderY = (innerHeight) => { return innerHeight - 27; }
        let userHeaderXSize = 200;
        let userHeaderYSize = 100;
        this.components.push(new TextComponent("User", "#4b42f5", userHeaderX, userHeaderY, userHeaderXSize, userHeaderYSize));

        let userPlaneX = () => { return 350; };
        let userPlaneScreenY = (innerHeight) => { return innerHeight - 127; }
        let userPlane = new StaticImage(images[this.userPlanes[0]], userPlaneX, userPlaneScreenY);
        userPlane.setOnClick(() => {
            userPlane.setImage(this.switchPlanes()); 
        });
        this.userPlaneStaticImage = userPlane;
        this.components.push(userPlane);
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
        return images[planeName];
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
        Method Name: goToGame
        Method Parameters: None
        Method Description: Switches from this menu to the game
        Method Return: void
    */
    goToGame(){
        menuManager.switchTo("game");
    }

    /*
        Method Name: goToMainMenu
        Method Parameters: None
        Method Description: Switches from this menu to the main menu
        Method Return: void
    */
    goToMainMenu(){
        SERVER_CONNECTION.sendJSON({"action": "leave_game"});
        menuManager.switchTo("main");
    }
}