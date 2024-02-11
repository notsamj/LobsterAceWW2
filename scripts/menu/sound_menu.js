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
        this.components.push(new AnimatedCloudBackground())

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
        for (let soundName of PROGRAM_DATA["sound_data"]["sounds"]){
            this.createSoundSettings(soundName, i++);
        }

        // Information
        let infoY = 700;
        let infoXSize = 600;
        let infoYSize = 400;
        this.components.push(new TextComponent("Note: I must caution the use of sounds.\nI find them useful, however,\n these are of poor quality\nand may be loud and annoying.\nThis is why I have\n disabled them by default.", "black", 20, infoY, infoXSize, infoYSize));
        
    }

    /*
        Method Name: createSoundSettings
        Method Parameters:
            soundName:
                The name of the sound
            offSetIndex:
                The index of the sound relative to other sounds
        Method Description: Creates the settings menu elements for a given sound
        Method Return: void
    */
    createSoundSettings(soundName, offSetIndex){
        let sectionYSize = 150;
        let addRemoveButtonSize = 50;
        let sectionYStart = sectionYSize * offSetIndex;

        let soundLabelXSize = 300;
        let soundLabelX = 600;
        let soundLabelYSize = 100;
        let soundLabelY = (innerHeight) => { return innerHeight - 27 - sectionYStart + addRemoveButtonSize/2; }

        let soundMinusBigButtonX = soundLabelX + soundLabelXSize;
        let soundMinuteBigButtonY = (innerHeight) => { return innerHeight - 27 - sectionYStart; }

        let soundMinusSmallButtonX = soundMinusBigButtonX + addRemoveButtonSize;
        let soundMinusSmallButtonY = (innerHeight) => { return innerHeight - 27 - sectionYStart; }

        let soundCurrentCountTextX = soundMinusSmallButtonX + addRemoveButtonSize;
        let soundCurrentCountTextY = (innerHeight) => { return innerHeight - 27 - sectionYStart; }
        let soundCurrentCountTextXSize = 50;
        let soundCurrentCountTextYSize = 50;

        let soundPlusSmallButtonX = soundCurrentCountTextX + soundCurrentCountTextXSize;
        let soundPlusSmallButtonY = (innerHeight) => { return innerHeight - 27 - sectionYStart; }

        let soundPlusBigButtonX = soundPlusSmallButtonX + addRemoveButtonSize;
        let soundPlusBigButtonY = (innerHeight) => { return innerHeight - 27 - sectionYStart; }

        // Components
        let startVolume = SOUND_MANAGER.getVolume(soundName);

        let currentVolumeComponent = new TextComponent(startVolume.toString(), "#f5d442", soundCurrentCountTextX, soundCurrentCountTextY, soundCurrentCountTextXSize, soundCurrentCountTextYSize, CENTER, CENTER);
        this.components.push(currentVolumeComponent);

        this.components.push(new TextComponent(soundName, "#f5d442", soundLabelX, soundLabelY, soundLabelXSize, soundLabelYSize, CENTER, CENTER));

        this.components.push(new RectangleButton("-10", "#f5d442", "#e6f5f4", soundMinusBigButtonX, soundMinuteBigButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            let currentVolume = SOUND_MANAGER.getVolume(soundName);
            let newVolume = Math.max(currentVolume - 10, 0);
            SOUND_MANAGER.updateVolume(soundName, newVolume);
            currentVolumeComponent.setText(newVolume.toString());
        }));

        this.components.push(new RectangleButton("-1", "#f5d442", "#e6f5f4", soundMinusSmallButtonX, soundMinusSmallButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            let currentVolume = SOUND_MANAGER.getVolume(soundName);
            let newVolume = Math.max(currentVolume - 1, 0);
            SOUND_MANAGER.updateVolume(soundName, newVolume);
            currentVolumeComponent.setText(newVolume.toString());
        }));

        this.components.push(new RectangleButton("+1", "#f5d442", "#e6f5f4", soundPlusSmallButtonX, soundPlusSmallButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
            let currentVolume = SOUND_MANAGER.getVolume(soundName);
            let newVolume = Math.min(currentVolume + 1, 100);
            SOUND_MANAGER.updateVolume(soundName, newVolume);
            currentVolumeComponent.setText(newVolume.toString());
        }));

        this.components.push(new RectangleButton("+10", "#f5d442", "#e6f5f4", soundPlusBigButtonX, soundPlusBigButtonY, addRemoveButtonSize, addRemoveButtonSize, (instance) => {
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