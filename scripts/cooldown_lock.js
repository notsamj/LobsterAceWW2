if (typeof window === "undefined"){
    Lock = require("../scripts/lock.js");
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
    module.exports = CooldownLock;
}