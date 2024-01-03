class MailBox {
    constructor(sendFunc){
        this.sendFunc = sendFunc;
        this.promiseResolve = null;
        this.awaiting = false;
    }

    isAwaiting(){
        return this.awaiting;
    }

    deliver(message){
        if (this.promiseResolve != null){
            this.promiseResolve(message);
        }
        this.awaiting = false;
    }

    send(message){
        this.awaiting = true;
        return new Promise((resolve, reject) => {
            this.sendFunc(message);
            this.promiseResolve = resolve;
        })
    }

    await(){
        this.awaiting = true;
        return new Promise((resolve, reject) => {
            this.promiseResolve = resolve;
        })
    }
}