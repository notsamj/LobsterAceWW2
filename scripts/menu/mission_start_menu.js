/*
    Class Name: MissionStartMenu
    Description: A subclass of Menu specific to preparing a dogfight
*/
class MissionStartMenu extends Menu {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        super();
        this.userPlanes = ["freecam"];
        this.userPlaneIndex = 0;
        this.allyDifficulty = "easy";
        this.axisDifficulty = "easy";
        this.mission = null;
        this.setup();
    }

    /*
        Method Name: loadMission
        Method Parameters: None
        Method Description: Sets the current mission to the mission at the index
        Method Return: void
    */
    loadMission(missionIndex){
        this.mission = PROGRAM_DATA["missions"][missionIndex];
        this.userPlanes = this.createUserPlaneSelection();
        this.allyDifficulty = "easy";
        this.axisDifficulty = "easy";
        this.userPlaneIndex = 0;
        this.userPlane.setImage(IMAGES[this.userPlanes[this.userPlaneIndex]]); 
    }

    /*
        Method Name: setup
        Method Parameters: None
        Method Description: Sets up the menu interface
        Method Return: void
    */
    setup(){
        let difficultyButtonSize = 150;

        // Background
        this.components.push(new AnimatedCloudBackground())

        let backButtonX = () => { return 50; }
        let backButtonY = (innerHeight) => { return innerHeight-27; }
        let backButtonXSize = 200;
        let backButtonYSize = 76;
        this.components.push(new RectangleButton("Main Menu", "#3bc44b", "#e6f5f4", backButtonX, backButtonY, backButtonXSize, backButtonYSize, (instance) => {
            instance.goToMainMenu();
        }));

        let startButtonX = () => { return 50; }
        let startButtonY = () => { return 200; }
        let startButtonXSize = (innerWidth) => { return innerWidth-50*2; }
        let startButtonYSize = 200;
        this.components.push(new RectangleButton("Start", "#c72d12", "#e6f5f4", startButtonX, startButtonY, startButtonXSize, startButtonYSize, (instance) => {
            GAMEMODE_MANAGER.setActiveGamemode(new LocalMissionClient(this.mission, this.createJSONRep()));
            this.goToGame();
        }));

        // User Section

        let userHeaderX = () => { return 300; }
        let userHeaderY = (innerHeight) => { return innerHeight - 27; }
        let userHeaderXSize = 200;
        let userHeaderYSize = 100;
        this.components.push(new TextComponent("User", "#4b42f5", userHeaderX, userHeaderY, userHeaderXSize, userHeaderYSize));

        let userPlaneX = () => { return 350; };
        let userPlaneScreenY = (innerHeight) => { return innerHeight - 127; }
        this.userPlane = new StaticImage(IMAGES[this.userPlanes[0]], userPlaneX, userPlaneScreenY, 128, 128);
        let userPlaneImage = this.userPlane;
        this.userPlane.setOnClick(() => {
            userPlaneImage.setImage(this.switchPlanes()); 
        });
        this.components.push(this.userPlane);

        // Allied Section
        let alliesHeaderX = () => { return 600; }
        let alliesHeaderY = (innerHeight) => { return innerHeight - 27; }
        let alliesHeaderXSize = 270;
        let alliesHeaderYSize = 100;
        this.components.push(new TextComponent("Allied Difficulty", PROGRAM_DATA["team_to_colour"]["Allies"], alliesHeaderX, alliesHeaderY, alliesHeaderXSize, alliesHeaderYSize));

        let allyDifficultyButtonX = (innerWidth) => { return alliesHeaderX(innerWidth); }
        let allyDifficultyButtonY = (innerHeight) => { return alliesHeaderY(innerHeight) - difficultyButtonSize; }
        this.components.push(new RectangleButton(() => { return this.getAllyDifficulty(); }, PROGRAM_DATA["team_to_colour"]["Allies"], "#e6f5f4", allyDifficultyButtonX, allyDifficultyButtonY, difficultyButtonSize, difficultyButtonSize, (instance) => {
            this.cycleAllyDifficulty();
        }));

        // Axis Section
        let axisHeaderX = () => { return 900; }
        let axisHeaderY = (innerHeight) => { return innerHeight - 27; }
        let axisHeaderXSize = 200;
        let axisHeaderYSize = 100;
        this.components.push(new TextComponent("Axis Difficulty", PROGRAM_DATA["team_to_colour"]["Axis"], axisHeaderX, axisHeaderY, axisHeaderXSize, axisHeaderYSize));

        let axisDifficultyButtonX = (innerWidth) => { return axisHeaderX(innerWidth); }
        let axisDifficultyButtonY = (innerHeight) => { return axisHeaderY(innerHeight) - difficultyButtonSize; }
        this.components.push(new RectangleButton(() => { return this.getAxisDifficulty(); }, PROGRAM_DATA["team_to_colour"]["Axis"], "#e6f5f4", axisDifficultyButtonX, axisDifficultyButtonY, difficultyButtonSize, difficultyButtonSize, (instance) => {
            this.cycleAxisDifficulty();
        }));
    }

    /*
        Method Name: createJSONRep
        Method Parameters: None
        Method Description: Creates a JSON representation of the mission customized by the user
        Method Return: JSON Object
    */
    createJSONRep(){
        let jsonRep = {};
        jsonRep["users"] = [];
        let userEntityType = this.userPlanes[this.userPlaneIndex];
        // If not a freecam, then add to users list
        if (userEntityType != "freecam"){
            jsonRep["users"].push({
                "model": userEntityType,
                "id": USER_DATA["name"]
            });
        }
        jsonRep["ally_difficulty"] = this.allyDifficulty;
        jsonRep["axis_difficulty"] = this.axisDifficulty;
        jsonRep["use_physics_bullets"] = PROGRAM_DATA["settings"]["use_physics_bullets"];
        jsonRep["human_health_multiplier"] = PROGRAM_DATA["settings"]["human_health_multiplier"];
        jsonRep["human_damage_multiplier"] = PROGRAM_DATA["settings"]["human_damage_multiplier"];
        return jsonRep;
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
        return IMAGES[planeName];
    }

    /*
        Method Name: createUserPlaneSelection
        Method Parameters: None
        Method Description: Creates a list of planes for the user to choose between
        Method Return: void
    */
    createUserPlaneSelection(){
        let userPlanes = ["freecam"];
        for (let planeName of this.mission["user_planes"]){
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
        MENU_MANAGER.switchTo("main");
    }

    /*
        Method Name: cycleAxisDifficulty
        Method Parameters: None
        Method Description: Cycles the ally difficulty
        Method Return: void
        Note: There are many ways to do this. Maybe some are better? Definitely some are cleaner. It's not a big anyway idc.
    */
    cycleAxisDifficulty(){
        let currentIndex = 0;
        for (let key of Object.keys(PROGRAM_DATA["ai"]["fighter_plane"]["bias_ranges"])){
            if (key == this.axisDifficulty){
                break;
            }
            currentIndex++;   
        }
        let maxIndex = Object.keys(PROGRAM_DATA["ai"]["fighter_plane"]["bias_ranges"]).length;
        currentIndex = (currentIndex + 1) % maxIndex;
        this.axisDifficulty = Object.keys(PROGRAM_DATA["ai"]["fighter_plane"]["bias_ranges"])[currentIndex];
    }

    /*
        Method Name: cycleAllyDifficulty
        Method Parameters: None
        Method Description: Cycles the ally difficulty
        Method Return: void
        Note: There are many ways to do this. Maybe some are better? Definitely some are cleaner. It's not a big anyway idc.
    */
    cycleAllyDifficulty(){
        let currentIndex = 0;
        for (let key of Object.keys(PROGRAM_DATA["ai"]["fighter_plane"]["bias_ranges"])){
            if (key == this.allyDifficulty){
                break;
            }
            currentIndex++;   
        }
        let maxIndex = Object.keys(PROGRAM_DATA["ai"]["fighter_plane"]["bias_ranges"]).length;
        currentIndex = (currentIndex + 1) % maxIndex;
        this.allyDifficulty = Object.keys(PROGRAM_DATA["ai"]["fighter_plane"]["bias_ranges"])[currentIndex];
    }

    /*
        Method Name: getAllyDifficulty
        Method Parameters: None
        Method Description: Getter
        Method Return: void
    */
    getAllyDifficulty(){
        return this.allyDifficulty;
    }

    /*
        Method Name: getAxisDifficulty
        Method Parameters: None
        Method Description: Getter
        Method Return: void
    */
    getAxisDifficulty(){
        return this.axisDifficulty;
    }
}