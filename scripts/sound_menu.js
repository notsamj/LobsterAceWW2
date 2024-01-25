/*
    Class Name: SoundMenu
    Description: A subclass of Menu specific to setting the game volume
*/
class SoundMenu extends Menu {
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
        this.components.push(new StaticImage(images["clouds"], () => { return 0; }, (innerHeight) => { return innerHeight; }));

        // Back Button
        let backButtonX = () => { return 50; }
        let backButtonY = (innerHeight) => { return innerHeight-27; }
        let backButtonXSize = 200;
        let backButtonYSize = 76;
        this.components.push(new RectangleButton("Main Menu", "#3bc44b", "#e6f5f4", backButtonX, backButtonY, backButtonXSize, backButtonYSize, (instance) => {
            instance.goToMainMenu();
        }));

        // Interface for sound amounts
        let i = 0;
        this.createSoundSettings("main volume", i++);
        for (let soundName of FILE_DATA["sound_data"]["sounds"]){
            this.createSoundSettings(soundName, i++);
        }
        
    }

    createSoundSettings(soundName, offSetIndex){
        let sectionYSize = 150;
        let addRemoveButtonSize = 50;
        let sectionYStart = sectionYSize * offSetIndex;

        let soundLabelX = 600;
        let soundLabelY = (innerHeight) => { return innerHeight - 27 - sectionYStart; }
        let soundLabelXSize = 300;
        let soundLabelYSize = sectionYSize;

        let soundMinus5ButtonX = soundLabelX + soundLabelXSize;
        let soundMinute5ButtonY = (innerHeight) => { return innerHeight - 27 - sectionYStart; }

        let soundMinus1ButtonX = soundMinus5ButtonX + addRemoveButtonSize;
        let soundMinus1ButtonY = (innerHeight) => { return innerHeight - 27 - sectionYStart; }

        let soundCurrentCountTextX = soundMinus1ButtonX + addRemoveButtonSize;
        let soundCurrentCountTextY = (innerHeight) => { return innerHeight - 27 - sectionYStart; }
        let soundCurrentCountTextXSize = 50;
        let soundCurrentCountTextYSize = 50;

        let soundPlus1ButtonX = soundCurrentCountTextX + soundCurrentCountTextXSize;
        let soundPlus1ButtonY = (innerHeight) => { return innerHeight - 27 - sectionYStart; }

        let soundPlus5ButtonX = soundPlus1ButtonX + addRemoveButtonSize;
        let soundPlus5ButtonY = (innerHeight) => { return innerHeight - 27 - sectionYStart; }

        // Components
        let startVolume = SOUND_MANAGER.getVolume(soundName);

        let currentVolumeComponent = new TextComponent(startVolume.toString(), "#f5d442", soundCurrentCountTextX, soundCurrentCountTextY, soundCurrentCountTextXSize, soundCurrentCountTextYSize);
        this.components.push(currentVolumeComponent);

        this.components.push(new TextComponent(soundName, "#f5d442", soundLabelX, soundLabelY, soundLabelXSize, soundLabelYSize));

        this.components.push(new RectangleButton("-10", "#f5d442", "#e6f5f4", soundMinus5ButtonX, soundMinute5ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            let currentVolume = SOUND_MANAGER.getVolume(soundName);
            let newVolume = Math.max(currentVolume - 10, 0);
            SOUND_MANAGER.updateVolume(soundName, newVolume);
            currentVolumeComponent.setText(newVolume.toString());
        }));

        this.components.push(new RectangleButton("-1", "#f5d442", "#e6f5f4", soundMinus1ButtonX, soundMinus1ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            let currentVolume = SOUND_MANAGER.getVolume(soundName);
            let newVolume = Math.max(currentVolume - 1, 0);
            SOUND_MANAGER.updateVolume(soundName, newVolume);
            currentVolumeComponent.setText(newVolume.toString());
        }));

        this.components.push(new RectangleButton("+1", "#f5d442", "#e6f5f4", soundPlus1ButtonX, soundPlus1ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            let currentVolume = SOUND_MANAGER.getVolume(soundName);
            let newVolume = Math.min(currentVolume + 1, 100);
            SOUND_MANAGER.updateVolume(soundName, newVolume);
            currentVolumeComponent.setText(newVolume.toString());
        }));

        this.components.push(new RectangleButton("+10", "#f5d442", "#e6f5f4", soundPlus5ButtonX, soundPlus5ButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            let currentVolume = SOUND_MANAGER.getVolume(soundName);
            let newVolume = Math.min(currentVolume + 10, 100);
            SOUND_MANAGER.updateVolume(soundName, newVolume);
            currentVolumeComponent.setText(newVolume.toString());
        }));
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