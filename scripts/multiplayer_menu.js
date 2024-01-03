class MultiplayerMenu extends Menu {
    constructor(){
        super();
        this.planeCounts = {};
        this.userPlanes = this.createUserPlaneSelection();
        this.userPlaneIndex = 0;
        this.alliedPlanes = this.createAlliedPlaneSelection();
        this.alliedPlaneIndex = 0;
        this.axisPlanes = this.createAxisPlaneSelection();
        this.axisPlaneIndex = 0;
        this.currentAlliedPlaneCountComponent = null;
        this.currentAxisPlaneCountComponent = null;
        this.botDetailsComponent = null;
        this.setup();
        this.updateBotDetails();
    }

    setup(){
        let addRemoveButtonSize = 50;

        // Background
        this.components.push(new StaticImage(images["clouds"], 0, 927));
        // Welcome Message
        let welcomeMessageX = 0;
        let welcomeMessageY = 500;
        let welcomeMessageXSize = 1400;
        let welcomeMessageYSize = 100;
        this.components.push(new TextComponent("Welcome: " + USER_DATA["name"], "#4b42f5", welcomeMessageX, welcomeMessageY, welcomeMessageXSize, welcomeMessageYSize));

        let backButtonX = 50;
        let backButtonY = 900;
        let backButtonXSize = 200;
        let backButtonYSize = 76;
        this.components.push(new RectangleButton("Main Menu", "#3bc44b", "#e6f5f4", backButtonX, backButtonY, backButtonXSize, backButtonYSize, (instance) => {
            instance.goToMainMenu();
        }));

        let startButtonX = 50;
        let startButtonY = 200;
        let startButtonXSize = 1920-50*2;
        let startButtonYSize = 200;
        this.components.push(new RectangleButton("Ready", "#c72d12", "#e6f5f4", startButtonX, startButtonY, startButtonXSize, startButtonYSize, async (instance) => {
            activeGameMode = await RemoteDogfight.create(new ServerConnection(), this.userPlanes[this.userPlaneIndex], this.planeCounts);
            this.goToGame();
        }));

        // User Section

        let userHeaderX = 300;
        let userHeaderY = 900;
        let userHeaderXSize = 200;
        let userHeaderYSize = 100;
        this.components.push(new TextComponent("User", "#4b42f5", userHeaderX, userHeaderY, userHeaderXSize, userHeaderYSize));

        let userPlaneX = 350;
        let userPlaneScreenY = 800;
        let userPlane = new StaticImage(images[this.userPlanes[0] + ((this.userPlanes[0] != "freecam") ? "_right_0" : "")], userPlaneX, userPlaneScreenY);
        userPlane.setOnClick(() => {
            userPlane.setImage(this.switchPlanes()); 
        });
        this.components.push(userPlane);

        // Allied Section
        let alliesHeaderX = 600;
        let alliesHeaderY = 900;
        let alliesHeaderXSize = 270;
        let alliesHeaderYSize = 100;
        this.components.push(new TextComponent("Allies", "#f5d442", alliesHeaderX, alliesHeaderY, alliesHeaderXSize, alliesHeaderYSize));

        let alliedPlaneX = 650;
        let alliedPlaneScreenY = 800;
        let alliedPlane = new StaticImage(images[this.alliedPlanes[0] + "_right_0"], alliedPlaneX, alliedPlaneScreenY);
        alliedPlane.setOnClick(() => {
            alliedPlane.setImage(this.switchAlliedPlanes()); 
        });
        this.components.push(alliedPlane);

        let alliedMinus5ButtonX = alliesHeaderX;
        let alliedMinute5ButtonY = alliedPlaneScreenY - alliedPlane.getHeight();
        this.components.push(new RectangleButton("-5", "#f5d442", "#e6f5f4", alliedMinus5ButtonX, alliedMinute5ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            this.modifyDisplayedBotPlaneCount("Allies", -5);
        }));

        let alliedMinus1ButtonX = alliedMinus5ButtonX + addRemoveButtonSize;
        let alliedMinus1ButtonY = alliedPlaneScreenY - alliedPlane.getHeight();
        this.components.push(new RectangleButton("-1", "#f5d442", "#e6f5f4", alliedMinus1ButtonX, alliedMinus1ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            this.modifyDisplayedBotPlaneCount("Allies", -1);
        }));

        let alliedCurrentCountTextX = alliedMinus1ButtonX + addRemoveButtonSize;
        let alliedCurrentCountTextY = alliedPlaneScreenY - alliedPlane.getHeight();
        let alliedCurrentCountTextXSize = 50;
        let alliedCurrentCountTextYSize = 50;
        this.currentAlliedPlaneCountComponent = new TextComponent("0", "#f5d442", alliedCurrentCountTextX, alliedCurrentCountTextY, alliedCurrentCountTextXSize, alliedCurrentCountTextYSize);
        this.components.push(this.currentAlliedPlaneCountComponent);

        let alliedPlus1ButtonX = alliedCurrentCountTextX + alliedCurrentCountTextXSize;
        let alliedPlus1ButtonY = alliedPlaneScreenY - alliedPlane.getHeight();
        this.components.push(new RectangleButton("+1", "#f5d442", "#e6f5f4", alliedPlus1ButtonX, alliedPlus1ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            this.modifyDisplayedBotPlaneCount("Allies", 1);
        }));

        let alliedPlus5ButtonX = alliedPlus1ButtonX + addRemoveButtonSize;
        let alliedPlus5ButtonY = alliedPlaneScreenY - alliedPlane.getHeight();
        this.components.push(new RectangleButton("+5", "#f5d442", "#e6f5f4", alliedPlus5ButtonX, alliedPlus5ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            this.modifyDisplayedBotPlaneCount("Allies", 5);
        }));

        // Axis Section
        let axisHeaderX = 900;
        let axisHeaderY = 900;
        let axisHeaderXSize = 200;
        let axisHeaderYSize = 100;
        this.components.push(new TextComponent("Axis", "#8427db", axisHeaderX, axisHeaderY, axisHeaderXSize, axisHeaderYSize));


        let axisPlaneX = 950;
        let axisPlaneScreenY = 800;
        let axisPlane = new StaticImage(images[this.axisPlanes[0] + "_right_0"], axisPlaneX, axisPlaneScreenY);
        axisPlane.setOnClick(() => {
            axisPlane.setImage(this.switchAxisPlanes()); 
        });
        this.components.push(axisPlane);

        let axisMinus5ButtonX = axisHeaderX;
        let axisMinute5ButtonY = axisPlaneScreenY - axisPlane.getHeight();
        this.components.push(new RectangleButton("-5", "#8427db", "#e6f5f4", axisMinus5ButtonX, axisMinute5ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            this.modifyDisplayedBotPlaneCount("Axis", -5);
        }));

        let axisMinus1ButtonX = axisMinus5ButtonX + addRemoveButtonSize;
        let axisMinus1ButtonY = axisPlaneScreenY - axisPlane.getHeight();
        this.components.push(new RectangleButton("-1", "#8427db", "#e6f5f4", axisMinus1ButtonX, axisMinus1ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            this.modifyDisplayedBotPlaneCount("Axis", -1);
        }));

        let axisCurrentCountTextX = axisMinus1ButtonX + addRemoveButtonSize;
        let axisCurrentCountTextY = axisPlaneScreenY - axisPlane.getHeight();
        let axisCurrentCountTextXSize = 50;
        let axisCurrentCountTextYSize = 50;
        this.currentAxisPlaneCountComponent = new TextComponent("0", "#8427db", axisCurrentCountTextX, axisCurrentCountTextY, axisCurrentCountTextXSize, axisCurrentCountTextYSize);
        this.components.push(this.currentAxisPlaneCountComponent);

        let axisPlus1ButtonX = axisCurrentCountTextX + axisCurrentCountTextXSize;
        let axisPlus1ButtonY = axisPlaneScreenY - axisPlane.getHeight();
        this.components.push(new RectangleButton("+1", "#8427db", "#e6f5f4", axisPlus1ButtonX, axisPlus1ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            this.modifyDisplayedBotPlaneCount("Axis", 1);
        }));

        let axisPlus5ButtonX = axisPlus1ButtonX + addRemoveButtonSize;
        let axisPlus5ButtonY = axisPlaneScreenY - axisPlane.getHeight();
        this.components.push(new RectangleButton("+5", "#8427db", "#e6f5f4", axisPlus5ButtonX, axisPlus5ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            this.modifyDisplayedBotPlaneCount("Axis", 5);
        }));

        // Bot Details Section
        let botHeaderX = 1500;
        let botHeaderY = 900;
        let botHeaderXSize = 200;
        let botHeaderYSize = 100;
        this.components.push(new TextComponent("Bot Details", "#000000", botHeaderX, axisHeaderY, botHeaderXSize, botHeaderYSize));

        let botBodyX = botHeaderX;
        let botBodyY = botHeaderY - botHeaderYSize;
        let botBodyXSize = 400;
        let botBodyYSize = 800;
        this.botDetailsComponent = new TextComponent("", "#000000", botBodyX, botBodyY, botBodyXSize, botBodyYSize); 
        this.components.push(this.botDetailsComponent);
        
    }

    switchPlanes(){
        this.userPlaneIndex = (this.userPlaneIndex + 1) % this.userPlanes.length;
        let planeName = this.userPlanes[this.userPlaneIndex];
        return images[planeName + ((planeName != "freecam") ? "_right_0" : "")];
    }

    switchAxisPlanes(){
        this.axisPlaneIndex = (this.axisPlaneIndex + 1) % this.axisPlanes.length;
        let planeName = this.axisPlanes[this.axisPlaneIndex];
        this.currentAxisPlaneCountComponent.setText(this.planeCounts[planeName].toString());
        return images[planeName + "_right_0"];
    }

    switchAlliedPlanes(){
        this.alliedPlaneIndex = (this.alliedPlaneIndex + 1) % this.alliedPlanes.length;
        let planeName = this.alliedPlanes[this.alliedPlaneIndex];
        this.currentAlliedPlaneCountComponent.setText(this.planeCounts[planeName].toString());
        return images[planeName + "_right_0"];
    }

    createUserPlaneSelection(){
        let userPlanes = ["freecam"];
        for (let [planeName, planeData] of Object.entries(fileData["plane_data"])){
            userPlanes.push(planeName);
        }
        return userPlanes;
    }

    createAlliedPlaneSelection(){
        let alliedPlanes = [];
        for (let [planeName, planeData] of Object.entries(fileData["plane_data"])){
            if (planeModelToAlliance(planeName) == "Allies"){
                alliedPlanes.push(planeName);
                this.planeCounts[planeName] = 0;
            }
        }
        return alliedPlanes;
    }

    createAxisPlaneSelection(){
        let axisPlanes = [];
        for (let [planeName, planeData] of Object.entries(fileData["plane_data"])){
            if (planeModelToAlliance(planeName) == "Axis"){
                axisPlanes.push(planeName);
                this.planeCounts[planeName] = 0;
            }
        }
        return axisPlanes;
    }

    modifyDisplayedBotPlaneCount(alliance, amount){
        let planeName = this.alliedPlanes[this.alliedPlaneIndex];
        if (alliance == "Axis"){
            planeName = this.axisPlanes[this.axisPlaneIndex];
        }
        this.planeCounts[planeName] = Math.max(0, this.planeCounts[planeName] + amount);
        if (alliance == "Axis"){
            this.currentAxisPlaneCountComponent.setText(this.planeCounts[planeName].toString());
        }else{
            this.currentAlliedPlaneCountComponent.setText(this.planeCounts[planeName].toString());
        }
        this.updateBotDetails();
    }

    updateBotDetails(){
        let botDetailsText = "";
        let alliedDetails = [];
        let axisDetails = [];
        let alliedCount = 0;
        let axisCount = 0;

        for (let [planeName, planeCount] of Object.entries(this.planeCounts)){
            let alliance = planeModelToAlliance(planeName);
            if (alliance == "Allies"){
                alliedDetails.push([planeName, planeCount]);
                alliedCount += planeCount;
            }else{
                axisDetails.push([planeName, planeCount]);
                axisCount += planeCount;
            }
        }

        botDetailsText += "Allies" + ": " + alliedCount.toString() + "\n";
        for (let [planeName, planeCount] of alliedDetails){
            botDetailsText += planeName + ": " + planeCount.toString() + "\n";
        }

        botDetailsText += "Axis" + ": " + axisCount.toString() + "\n";
        for (let [planeName, planeCount] of axisDetails){
            botDetailsText += planeName + ": " + planeCount.toString() + "\n";
        }
        //console.log(botDetailsText)
        this.botDetailsComponent.setText(botDetailsText);
    }

    goToGame(){
        menuManager.switchTo("game");
    }


    goToMainMenu(){
        menuManager.switchTo("main");
    }
}