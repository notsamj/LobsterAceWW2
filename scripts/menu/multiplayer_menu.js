/*
    Class Name: MultiplayerMenu
    Description: A subclass of Menu that is an interface for multiplayer.
*/
class MultiplayerMenu extends Menu {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        super();
        this.setup();
        this.hostLock = new Lock();
        this.joinLock = new Lock();
    }

    /*
        Method Name: setup
        Method Parameters: None
        Method Description: Sets up the interface
        Method Return: void
    */
    setup(){
        // Background
        this.components.push(new AnimatedCloudBackground())

        // Refresh Button
        let refreshButtonXSize = (innerWidth) => { return innerWidth; }
        let refreshButtonYSize = 100;
        let refreshButtonX = 0;
        let refreshButtonY = 100;
        let refreshButton = new RectangleButton("Refresh", "#3bc44b", "#e6f5f4", refreshButtonX, refreshButtonY, refreshButtonXSize, refreshButtonYSize, async (menuInstance) => {
            menuInstance.refresh();
        });
        this.refreshButton = refreshButton;
        this.components.push(refreshButton);

        // Host Button
        let hostButtonXSize = (innerWidth) => { return innerWidth; }
        let hostButtonYSize = 100;
        let hostButtonX = 0;
        let hostButtonY = refreshButtonY + refreshButtonYSize;
        let hostButton = new RectangleButton("Host", "#cccccc", "#e6f5f4", hostButtonX, hostButtonY, hostButtonXSize, hostButtonYSize, async (menuInstance) => {
            if (this.hostLock.isLocked() || this.joinLock.isLocked()){
                return;
            }
            this.hostLock.lock();
            let response = await SERVER_CONNECTION.hostRequest();
            if (!response){
                return;
            }
            if (!response["success"]){
                return;
            }
            MENU_MANAGER.getMenuByName("host").resetSettings();
            MENU_MANAGER.switchTo("host");
            this.hostLock.unlock();
        });
        hostButton.disable();
        this.hostButton = hostButton;
        this.components.push(hostButton);

        // Back Button
        let backButtonX = () => { return 50; }
        let backButtonY = (innerHeight) => { return innerHeight-27; }
        let backButtonXSize = 200;
        let backButtonYSize = 76;
        this.components.push(new RectangleButton("Main Menu", "#3bc44b", "#e6f5f4", backButtonX, backButtonY, backButtonXSize, backButtonYSize, (instance) => {
            MENU_MANAGER.switchTo("main");
        }));

        // Create join window
        this.joinWindow = new JoinWindow(this);
    }

    /*
        Method Name: refresh
        Method Parameters: None
        Method Description: Finds out about active games from the server
        Method Return: void
    */
    async refresh(){
        // Disable the button so it can't be clicked until refresh is complete. And show it as grey
        this.refreshButton.disable();
        this.refreshButton.setColour("#cccccc");

        // Disable the host button, will be reenabled based on refresh
        this.hostButton.disable();
        this.hostButton.setColour("#cccccc");

        let response = await SERVER_CONNECTION.refresh();
        // If a response has been received
        if (response){
            this.updateScreen(response);
        }
        // Enable the button so it can be clicked now that the refresh is complete. And show it as green again.
        this.refreshButton.setColour("#3bc44b");
        this.refreshButton.enable();
    }

    /*
        Method Name: updateScreen
        Method Parameters:
            response:
                Server response to refresh request
        Method Description: Updates the screen repeting on the server's response to a refresh request 
        Method Return: void
    */
    updateScreen(response){
        this.joinWindow.hide();
        let availableToHost = response["server_free"];
        // If available to host, enable the host button
        if (availableToHost){
            this.hostButton.enable();
            this.hostButton.setColour("#3bc44b");
            return;
        }
        // Else not able to host, server did response, so join window must be able to display
        this.joinWindow.show(response);
    }

    /*
        Method Name: join
        Method Parameters: None
        Method Description: Tries to join the game
        Method Return: void
    */
    async join(){
        console.log(this.hostLock.isLocked(), this.joinLock.isLocked())
        if (this.hostLock.isLocked() || this.joinLock.isLocked()){
            return;
        }
        this.joinLock.lock();
        console.log("Sending Join Request")
        let response = await SERVER_CONNECTION.joinRequest();
        this.joinLock.unlock();
        console.log("Join request response....", response)
        if (response && response["success"]){
            MENU_MANAGER.getMenuByName("participant").resetSettings();
            MENU_MANAGER.switchTo("participant");
        }else if (response){
            MENU_MANAGER.addTemporaryMessage("Failed to join: " + response["reason"], "#ff0000", 5000);
        }else{
            MENU_MANAGER.addTemporaryMessage("Failed to get join response", "#ff0000", 5000);
        }
    }
}

/*
    Class Name: JoinWindow
    Description: A window that pops up allowing the user to join a game mode
*/
class JoinWindow {
    /*
        Method Name: constructor
        Method Parameters:
            menuInstance:
                The menu that the join window is part of
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(menuInstance){
        this.setup(menuInstance);
    }

    /*
        Method Name: setup
        Method Parameters:
            menuInstance:
                The instance of the multiplayer menu
        Method Description: Sets up a join window
        Method Return: void
    */
    setup(menuInstance){
        let windowSizeX = 600;
        let windowX = (innerWidth) => { return (innerWidth - windowSizeX) / 2; }
        let windowY = (innerHeight) => { return innerHeight; }
        
        // Button with details (e.g. "Dogfight" or Mission 1)
        let serverDetailsYSize = 300;
        let serverDetails = new TextComponent("", "#000000", windowX, windowY, windowSizeX, serverDetailsYSize);
        this.serverDetails = serverDetails;
        menuInstance.addComponent(serverDetails);
        
        // Join button
        let joinButtonYSize = 100;
        let joinButtonY = (innerHeight) => { return innerHeight - serverDetailsYSize; } ;
        let joinButton = new RectangleButton("Join", "#3bc44b", "#e6f5f4", windowX, joinButtonY, windowSizeX, joinButtonYSize, async (menuInstance) => {
            menuInstance.join();
        });
        this.joinButton = joinButton;
        menuInstance.addComponent(joinButton);
        this.hide();
    }

    /*
        Method Name: hide
        Method Parameters: None
        Method Description: Hides the join window
        Method Return: void
    */
    hide(){
        this.joinButton.disableDisplay();
        this.serverDetails.disableDisplay();
    }

    /*
        Method Name: show
        Method Parameters:
            serverResponse:
                Response from the server to refresh request
        Method Description: Enables the display of the join window
        Method Return: void
    */
    show(serverResponse){
        if (!serverResponse["game_in_progress"]){
            this.joinButton.enableDisplay();
        }
        this.serverDetails.enableDisplay();
        this.serverDetails.setText(serverResponse["server_details"]);
    }
}