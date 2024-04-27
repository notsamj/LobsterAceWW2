/*
    Class Name: ParticipantMenu
    Description: A subclass of Menu specific to being a participant in a lobby
*/
class ParticipantMenu extends Menu {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        super();
        this.userPlanes = this.createDogfightUserSelection();
        this.userPlaneIndex = 0;
        this.botDetailsComponent = null;
        this.setup();
    }

    /*
        Method Name: resetSettings
        Method Parameters: None
        Method Description: Resets the settings of the menu so they user can choose a new plane
        Method Return: void
    */
    resetSettings(){
        this.userPlaneIndex = 0;

        // Update the UI
        this.userPlaneStaticImage.setImage(IMAGES[this.userPlanes[this.userPlaneIndex]]);
    }

    /*
        Method Name: resetParticipantType
        Method Parameters:
            mission:
                A Json object with details about a mission
        Method Description: Resets settings and the plane selection based on the game mode
        Method Return: void
    */
    resetParticipantType(mission=null){
        let dogfightNotMission = mission == null;
        if (dogfightNotMission){
            this.userPlanes = this.createDogfightUserSelection();
        }else{
            this.userPlanes = this.createMissionPlanes(mission);
        }
        this.resetSettings();
    }

    /*
        Method Name: createMissionPlanes
        Method Parameters:
            mission:
                A Json object with details about a mission
        Method Description: Creates list of plane models for the user to choose from
        Method Return: List of plane models
    */
    createMissionPlanes(mission){
        let userPlanes = ["freecam"];
        for (let planeName of mission["user_planes"]){
            userPlanes.push(planeName);
        }
        return userPlanes;
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
        let userPlane = new StaticImage(IMAGES[this.userPlanes[0]], userPlaneX, userPlaneScreenY, 128, 128);
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
        return IMAGES[planeName];
    }

    /*
        Method Name: createDogfightUserSelection
        Method Parameters: None
        Method Description: Creates a list of planes for the user to choose between
        Method Return: void
    */
    createDogfightUserSelection(){
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
        MENU_MANAGER.switchTo("game");
    }

    /*
        Method Name: goToMainMenu
        Method Parameters: None
        Method Description: Switches from this menu to the main menu
        Method Return: void
    */
    goToMainMenu(){
        SERVER_CONNECTION.sendJSON({"action": "leave_game"});
        MENU_MANAGER.switchTo("main");
    }
}