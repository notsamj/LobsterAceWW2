if (typeof window === "undefined"){
    NotSamLinkedList = require("../scripts/notsam_linked_list");
}
class Lock{
    constructor(ready=true){
        this.ready = ready;
        this.promiseUnlock = new NotSamLinkedList();
    }

    isReady(){
        return this.ready;
    }

    notReady(){
        return !this.isReady();
    }

    lock(){
        this.ready = false;
    }

    unlock(){
        this.ready = true;
        // Do the promised unlock
        if (this.promiseUnlock.getLength() > 0){
            let awaitingObject = this.promiseUnlock.get(0);
            let awaitingResolve = awaitingObject["resolve"];
            let relock = awaitingObject["relock"];
            this.ready = !relock;
            this.promiseUnlock.remove(0);
            awaitingResolve();
        }
    }

    awaitUnlock(relock=false){
        if (this.ready){ return; }
        let instance = this;
        return new Promise((resolve, reject) => {
            instance.promiseUnlock.append({"resolve": resolve, "relock": relock});
        });
    }
}

if (typeof window === "undefined"){
    module.exports = Lock;
}