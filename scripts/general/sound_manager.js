/*
    Class Name: SoundManager
    Description: A class for managing the playing of sounds.
*/
class SoundManager {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.soundQueue = new NotSamLinkedList();
        this.sounds = [];
        this.mainVolume = getLocalStorage("main volume", 0);
        this.loadSounds();
    }

    /*
        Method Name: loadSounds
        Method Parameters: None
        Method Description: Loads all the sounds that are identified in the file data
        Method Return: void
    */
    loadSounds(){
        for (let soundName of FILE_DATA["sound_data"]["sounds"]){
            this.sounds.push(new Sound(soundName, this.mainVolume));
        }
    }

    /*
        Method Name: loadSounds
        Method Parameters:
            soundName:
                The name of the sound to play
            x:
                The x location at which the sound occurs
            y:
                The y location at which the sound occurs
        Method Description: Prepares to play a sound when playAll is next called
        Method Return: void
    */
    play(soundName, x, y){
        if (!this.hasSound(soundName)){
            return;
        }
        this.soundQueue.push(new SoundRequest(this.findSound(soundName), x, y));
    }

    /*
        Method Name: loadSounds
        Method Parameters:
            soundName:
                The name of the sound to find
        Method Description: Finds a sound and returns it
        Method Return: Sound
    */
    findSound(soundName){
        for (let sound of this.sounds){
            if (sound.getName() == soundName){
                return sound;
            }
        }
        return null;
    }

    /*
        Method Name: hasSound
        Method Parameters:
            soundName:
                The name of the sound to find
        Method Description: Determines if a sound is present
        Method Return: Boolean, true -> sound is present, false -> sound is not present.
    */
    hasSound(soundName){
        return this.findSound(soundName) != null;
    }

    /*
        Method Name: playAll
        Method Parameters:
            lX:
                Left x game coordinate of the screen
            rX:
                Right x game coordinate of the screen
            bY:
                Bottom y game coordinate of the screen
            tY:
                Top y game coordinate of the screen
        Method Description: Plays all the sounds within a specified game coordinate area
        Method Return: void
    */
    playAll(lX, rX, bY, tY){
        this.pauseAll();
        // Play all sounds that take place on the screen
        while (this.soundQueue.getLength() > 0){
            let soundRequest = this.soundQueue.get(0);
            soundRequest.tryToPlay(lX, rX, bY, tY);
            this.soundQueue.pop(0);
        }
    }

    /*
        Method Name: pauseAll
        Method Parameters: None
        Method Description: Pauses all active sounds
        Method Return: void
    */
    pauseAll(){
        for (let sound of this.sounds){
            sound.pause();
        }
    }

    /*
        Method Name: updateVolume
        Method Parameters:
            soundName:
                Name of sound whose volume is being updated
            newVolume:
                The new volume for the sound
        Method Description: Updates the volume of a sound
        Method Return: void
    */
    updateVolume(soundName, newVolume){
        setLocalStorage(soundName, newVolume);
        if (soundName == "main volume"){
            this.mainVolume = newVolume;
            for (let sound of this.sounds){
                sound.adjustByMainVolume(this.mainVolume);
            }
            return;
        }
        if (!this.hasSound(soundName)){ return; }
        let sound = this.findSound(soundName);
        sound.updateVolume(newVolume, this.mainVolume);
    }

    /*
        Method Name: getVolume
        Method Parameters:
            soundName:
                Name of sound whose volume is being updated
        Method Description: Determines the volume of a sound
        Method Return: int
    */
    getVolume(soundName){
        if (soundName == "main volume"){
            return this.mainVolume;
        }
        if (!this.hasSound(soundName)){ return 0; }
        let sound = this.findSound(soundName);
        return sound.getVolume();
    }
}

/*
    Class Name: SoundRequest
    Description: A class to store a sound request
*/
class SoundRequest {
     /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(sound, x, y){
        this.sound = sound;
        this.x = x;
        this.y = y;
    }

    /*
        Method Name: tryToPlay
        Method Parameters:
            lX:
                Left x game coordinate of the screen
            rX:
                Right x game coordinate of the screen
            bY:
                Bottom y game coordinate of the screen
            tY:
                Top y game coordinate of the screen
        Method Description: Plays the sound IF it is within the specified game region.
        Method Return: void
    */
    tryToPlay(lX, rX, bY, tY){
        if (this.x >= lX && this.x <= rX && this.y >= bY && this.y <= tY){
            this.sound.play();
        }
    }
}

/*
    Class Name: Sound
    Description: A class to handle a sound.
*/
class Sound {
    /*
        Method Name: constructor
        Method Parameters: 
            soundName:
                The name of the sound
            mainVolume:
                The main volume of program
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(soundName, mainVolume){
        this.name = soundName;
        this.audio = new Audio(FILE_DATA["sound_data"]["url"] + "/" + this.name + FILE_DATA["sound_data"]["file_type"]);
        this.volume = getLocalStorage(soundName, 0);
        this.adjustByMainVolume(mainVolume);
    }

    /*
        Method Name: getName
        Method Parameters: None
        Method Description: Getter
        Method Return: void
    */
    getName(){
        return this.name;
    }

    /*
        Method Name: play
        Method Parameters: None
        Method Description: Plays the sound
        Method Return: void
    */
    play(){
        this.audio.play();
    }

    /*
        Method Name: isRunning
        Method Parameters: None
        Method Description: Determines if the sound is currently running
        Method Return: Boolean, true -> is running, false -> is not running
    */
    isRunning(){
        return this.audio.currentTime < this.audio.duration && this.audio.currentTime > 0;
    }

    /*
        Method Name: pause
        Method Parameters: None
        Method Description: Pauses a sound (if it is running)
        Method Return: void
    */
    pause(){
        if (this.isRunning()){
            this.audio.pause();
        }
    }

    /*
        Method Name: adjustByMainVolume
        Method Parameters:
            mainVolume:
                The main volume of the program
        Method Description: Adjusts the volume of a sound based on the main program volume
        Method Return: void
    */
    adjustByMainVolume(mainVolume){
        this.updateVolume(this.volume, mainVolume);
    }

    /*
        Method Name: updateVolume
        Method Parameters:
            newVolume:
                The new volume value of a sound
            mainVolume:
                The main volume of the program
        Method Description: Adjusts the volume of a sound based on the main program volume and its own volume value.
        Method Return: void
    */
    updateVolume(newVolume, mainVolume){
        this.volume = newVolume;
        this.audio.volume = (newVolume / 100) * (mainVolume / 100);
    }

    /*
        Method Name: getVolume
        Method Parameters: None
        Method Description: Getter
        Method Return: void
    */
    getVolume(){
        return this.volume;
    }
}