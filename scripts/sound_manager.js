// TODO: Comment this whole file
class SoundManager {
    constructor(){
        this.soundQueue = new NotSamLinkedList();
        this.sounds = [];
        this.mainVolume = 0; // TODO: Cookies
        this.loadSounds();
    }

    loadSounds(){
        for (let soundName of FILE_DATA["sound_data"]["sounds"]){
            this.sounds.push(new Sound(soundName, this.mainVolume));
        }
    }

    play(soundName, x, y){
        if (!this.hasSound(soundName)){
            return;
        }
        this.soundQueue.push(new SoundRequest(this.findSound(soundName), x, y));
    }

    findSound(soundName){
        for (let sound of this.sounds){
            if (sound.getName() == soundName){
                return sound;
            }
        }
        return null;
    }

    hasSound(soundName){
        return this.findSound(soundName) != null;
    }

    playAll(lX, rX, bY, tY){
        this.pauseAll();
        // Play all sounds that take place on the screen
        while (this.soundQueue.getLength() > 0){
            let soundRequest = this.soundQueue.get(0);
            soundRequest.tryToPlay(lX, rX, bY, tY);
            this.soundQueue.pop(0);
        }
    }

    pauseAll(){
        for (let sound of this.sounds){
            sound.pause();
        }
    }

    updateVolume(soundName, newVolume){
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

    getVolume(soundName){
        if (soundName == "main volume"){
            return this.mainVolume;
        }
        if (!this.hasSound(soundName)){ console.error("broken"); return 0; }
        let sound = this.findSound(soundName);
        return sound.getVolume();
    }
}

class SoundRequest{
    constructor(sound, x, y){
        this.sound = sound;
        this.x = x;
        this.y = y;
    }

    tryToPlay(lX, rX, bY, tY){
        if (this.x >= lX && this.x <= rX && this.y >= bY && this.y <= tY){
            this.sound.play();
        }
    }
}

class Sound{
    constructor(soundName, mainVolume){
        this.name = soundName;
        this.audio = new Audio(FILE_DATA["sound_data"]["url"] + "/" + this.name + FILE_DATA["sound_data"]["file_type"]);
        this.volume = 0; // TODO: Cookies
        this.adjustByMainVolume(mainVolume);
    }

    getName(){
        return this.name;
    }

    play(){
        this.audio.play();
    }

    isRunning(){
        return this.audio.currentTime < this.audio.duration && this.audio.currentTime > 0;
    }

    pause(){
        if (this.isRunning()){
            this.audio.pause();
        }
    }

    adjustByMainVolume(mainVolume){
        this.updateVolume(this.volume, mainVolume);
    }

    updateVolume(newVolume, mainVolume){
        this.volume = newVolume;
        this.audio.volume = (newVolume / 100) * (mainVolume / 100);
    }

    getVolume(){
        return this.volume;
    }
}