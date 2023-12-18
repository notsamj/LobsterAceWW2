class Lock{
    constructor(ready=true){
        this.ready = ready;
        this.promiseUnlock = null;
    }

    isReady(){
        return this.ready;
    }

    lock(){
        this.ready = false;
    }

    unlock(){
        this.ready = true;
        // Do the promised unlock
        if (this.promiseUnlock != null){
            this.promiseUnlock();
            this.promiseUnlock = null;
        }
    }

    awaitUnlock(){
        if (this.ready){ return; }
        let instance = this;
        return new Promise((resolve, reject) => {
            instance.promiseUnlock = resolve;
        });
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
        if (Date.now() > this.lastLocked + this.cooldown){
            this.unlock();
        }
        return this.ready;
    }

    getCooldown(){
        return this.cooldown;
    }
}
if (typeof window === "undefined"){
    module.exports = { Lock, CooldownLock };
}