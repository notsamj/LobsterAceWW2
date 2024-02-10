/*
    Class Name: ExtraSettingsMenu
    Description: A subclass of Menu specific to setting up certain settings
*/
class ExtraSettingsMenu extends Menu {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        super();
        this.setup();
    }

    /*
        Method Name: setup
        Method Parameters: None
        Method Description: Sets up the menu interface
        Method Return: void
    */
    setup(){
        let sectionYSize = 50;

        // Background
        this.components.push(new AnimatedCloudBackground())

        // Back Button
        let backButtonX = () => { return 50; }
        let backButtonY = (innerHeight) => { return innerHeight-27; }
        let backButtonXSize = 200;
        let backButtonYSize = 76;
        this.components.push(new RectangleButton("Main Menu", "#3bc44b", "#e6f5f4", backButtonX, backButtonY, backButtonXSize, backButtonYSize, (menuInstance) => {
            menuInstance.goToMainMenu();
        }));

        // Interface for changing settings
        let i = 0;
        for (let setting of FILE_DATA["extra_settings"]){
            this.createSetting(setting["name"], setting["path"], i++);
        }
    }

    /*
        Method Name: createSetting
        Method Parameters:
            settingName:
                Name of the setting
            settingPath:
                Series of keys to lead from FILE_DATA to the value
            offSetIndex:
                The index of the setting used to offset its y position
        Method Description: Creates a setting in the menu
        Method Return: void
    */
    createSetting(settingName, settingPath, offSetIndex){
        let sectionYSize = 100;
        let onOffButtonSize = 50;
        let sectionYStart = sectionYSize * offSetIndex;

        let settingLabelXSize = 300;
        let settingLabelX = 600;
        let settingLabelYSize = 100;
        let settingLabelY = (innerHeight) => { return innerHeight - 27 - sectionYStart + onOffButtonSize/2; }

        let settingOnOffButtonX = settingLabelX + settingLabelXSize;
        let settingOnOffButtonY = (innerHeight) => { return innerHeight - 27 - sectionYStart; }

        // Components

        this.components.push(new TextComponent(settingName, "#e6f5f4", settingLabelX, settingLabelY, settingLabelXSize, settingLabelYSize, CENTER, CENTER));

        let onOffButtonComponentIndex = this.components.length; // Note: Assumes index never changes
        let startingValue = this.getSettingValue(settingName, settingPath) ? "On" : "Off";
        this.components.push(new RectangleButton(startingValue, "#3bc44b", "#e6f5f4", settingOnOffButtonX, settingOnOffButtonY, onOffButtonSize, onOffButtonSize, (menuInstance) => {
            let onOrOff = menuInstance.getSettingValue(settingName, settingPath);
            onOrOff = !onOrOff; // Flip it
            menuInstance.setSettingValue(settingName, settingPath, onOrOff);
            menuInstance.components[onOffButtonComponentIndex].setText(onOrOff ? "On" : "Off");
        }));
    }

    /*
        Method Name: getSettingValue
        Method Parameters:
            settingName:
                Name of the setting
            path:
                Sequence of keys to navigate to the setting in FILE_DATA
        Method Description: Find the value for a setting
        Method Return: Variable
    */
    getSettingValue(settingName, path){
        let currentJSONObject = FILE_DATA;
        for (let key of path){
            currentJSONObject = currentJSONObject[key];
        }
        return currentJSONObject[settingName];
    }

    /*
        Method Name: setSettingValue
        Method Parameters:
            settingName:
                Name of the setting
            settingPath:
                Series of keys to lead from FILE_DATA to the value
            value:
                Value of the setting
        Method Description: Sets the value of a setting
        Method Return: void
    */
    setSettingValue(settingName, path, value){
        let currentJSONObject = FILE_DATA;
        for (let key of path){
            currentJSONObject = currentJSONObject[key];
        }
        currentJSONObject[settingName] = value;
    }

    /*
        Method Name: goToMainMenu
        Method Parameters: None
        Method Description: Switches from this menu to the main menu
        Method Return: void
    */
    goToMainMenu(){
        menuManager.switchTo("main");
    }
}