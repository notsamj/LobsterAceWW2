class Lock{
    constructor(ready=true){
        this.ready = ready;
    }

    isReady(){
        return this.ready;
    }

    lock(){
        this.ready = false;
    }

    unlock(){
        this.ready = true;
    }
}

class CooldownLock extends Lock{
    constructor(cooldown, ready=true){
        super(ready);
        this.cooldown = cooldown;
        this.lastLocked = 0;
    }
    
    lock(){
        super.lock();
        this.lastLocked = Date.now();
    }

    isReady(){
        //console.log(this.lastLocked, Date.now(), this.lastLocked + this.cooldown)
        if (Date.now() > this.lastLocked + this.cooldown){
            return true;
        }
        return false;
    }
}