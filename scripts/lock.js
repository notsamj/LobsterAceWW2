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
    }
    
    lock(){
        super.lock();
        setTimeout(() => { this.unlock(); }, this.cooldown);
    }
}