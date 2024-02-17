/*
    Class Name: MultiplayerMenu
    Description: A subclass of Menu that is an interface for multiplayer.
    Note: TODO: Comment this class
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
        this.setup()
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
            menuManager.switchTo("host");
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
            menuManager.switchTo("main");
        }));

        // Create join window
        this.joinWindow = new JoinWindow(this);
    }

    async refresh(){
        // Disable the button so it can't be clicked until refresh is complete. And show it as grey
        this.refreshButton.disable();
        this.refreshButton.setColour("#cccccc");

        // Disable the host button, will be reenabled based on refresh
        this.hostButton.disable();
        this.hostButton.setColour("#cccccc");

        let response = await SERVER_CONNECTION.request("refresh");
        // If a response has been received
        if (response){
            this.updateScreen(response);
        }

        // Enable the button so it can be clicked now that the refresh is complete. And show it as green again.
        this.refreshButton.setColour("#3bc44b");
        this.refreshButton.enable();
    }

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
}

// TODO: Comment class
class JoinWindow {
    constructor(menuInstance){
        this.setup(menuInstance);
    }

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

    hide(){
        this.joinButton.disableDisplay();
        this.serverDetails.disableDisplay();
    }

    show(serverResponse){
        if (!serverResponse["game_in_progress"]){
            this.joinButton.enableDisplay();
        }
        this.serverDetails.enableDisplay();
        this.serverDetails.setText(serverResponse["server_details"]);
    }
}