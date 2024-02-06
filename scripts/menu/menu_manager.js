/*
    Class Name: MenuManager
    Description: A helper class for menus
*/
class MenuManager {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.mainMenu = new MainMenu();
        this.multiplayerMenu = new MultiplayerMenu();
        this.pauseMenu = new PauseMenu();
        this.dogfightMenu = new DogfightMenu();
        this.soundMenu = new SoundMenu();
        this.missionStartMenu = new MissionStartMenu();
        this.campaignMenu = new CampaignMenu();
        this.extraSettingsMenu = new ExtraSettingsMenu();
        this.activeMenu = this.mainMenu;
    }

    // TODO: Comments
    getWidth(){
        return getScreenWidth();
    }

    // TODO: Comments
    getHeight(){
        return getScreenHeight();
    }

    /*
        Method Name: hasActiveMenu
        Method Parameters: None
        Method Description: Determine if there is an active menu displayed
        Method Return: Boolean
    */
    hasActiveMenu(){
        return this.activeMenu != null;
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Display the active menu on the screen
        Method Return: void
    */
    display(){
        if (!this.hasActiveMenu()){ return; }
        this.activeMenu.display();
    }

    /*
        Method Name: click
        Method Parameters: 
            screenX:
                x location (in screen coordinates) of a click
            screenY:
                y location (in screen coordinates) of a click
        Method Description: Handles the event of a user click
        Method Return: void
    */
    click(screenX, screenY){
        if (!this.hasActiveMenu()){ return; }
        this.activeMenu.click(screenX, this.changeFromScreenY(screenY));
    }

    /*
        Method Name: changeFromScreenY
        Method Parameters: 
            y:
                y coordinate in screen coordinate system
        Method Description: Converts a screen y to a game y
        Method Return: int
    */
    changeFromScreenY(y){
        return this.getHeight() - y;
    }

    /*
        Method Name: changeToScreenY
        Method Parameters: 
            y:
                y coordinate in game coordinate system
        Method Description: Converts a game y to a screen y
        Method Return: int
    */
    changeToScreenY(y){ return this.changeFromScreenY(y); }

    /*
        Method Name: setupClickListener
        Method Parameters: None
        Method Description: Sets up listeners for clicks and escape
        Method Return: void
    */
    static setupClickListener(){
        document.getElementById("defaultCanvas0").addEventListener("click", (event) => {
            menuManager.click(event.clientX, event.clientY);
        });

        document.onkeydown = (event) => {
            if (event.key === "Escape"){
                menuManager.escapeKey();
            }
        };
    }

    /*
        Method Name: lostFocus
        Method Parameters: None
        Method Description: Called when focus is lost and launches the pause menu
        Method Return: void
    */
    lostFocus(){
        if (!this.hasActiveMenu()){
            this.switchTo("pauseMenu");
        }
    }

    /*
        Method Name: escapeKey
        Method Parameters: None
        Method Description: Called when escape key is pressed and launches the pause menu (or gets away from it)
        Method Return: void
    */
    escapeKey(){
        if (this.activeMenu == this.pauseMenu){
            this.switchTo("game");
        }else if (!this.hasActiveMenu()){
            this.switchTo("pauseMenu");
        }
    }

    /*
        Method Name: switchTo
        Method Parameters: 
            newMenu:
                String, name of new menu
        Method Description: Switches to desired menu
        Method Return: void
    */
    switchTo(newMenu){
        if (newMenu == "main"){
            this.activeMenu = this.mainMenu;
        }else if (newMenu == "dogfight"){
            this.activeMenu = this.dogfightMenu;
        }else if (newMenu == "pauseMenu"){
            scene.disableTicks();
            this.activeMenu = this.pauseMenu;
        }else if (newMenu == "game"){
            scene.enable();
            this.activeMenu = null;
        }else if (newMenu == "multiplayer"){
            this.activeMenu = this.multiplayerMenu;
        }else if (newMenu == "sound"){
            this.activeMenu = this.soundMenu;
        }else if (newMenu == "campaign"){
            this.activeMenu = this.campaignMenu;
        }else if (newMenu == "missionStart"){
            this.activeMenu = this.missionStartMenu;
        }else if (newMenu == "extraSettings"){
            this.activeMenu = this.extraSettingsMenu;
        }else{
            this.activeMenu = null;
        }
    }

    /*
        Method Name: getMenuByName
        Method Parameters: 
            menuName:
                String, name of menu
        Method Description: Gets a menu instance by its name
        Method Return: Menu
    */
    getMenuByName(menuName){
        if (menuName == "main"){
            return this.mainMenu;
        }else if (menuName == "dogfight"){
            return this.dogfightMenu;
        }else if (menuName == "pauseMenu"){
            return this.pauseMenu;
        }else if (menuName == "multiplayer"){
            return this.multiplayerMenu;
        }else if (menuName == "sound"){
            return this.soundMenu;
        }else if (menuName == "campaign"){
            return this.campaignMenu;
        }else if (menuName == "missionStart"){
            return this.missionStartMenu;
        }else if (menuName == "extraSettings"){
            return this.extraSettingsMenu;
        }
        // Else
        return null;
    }


}