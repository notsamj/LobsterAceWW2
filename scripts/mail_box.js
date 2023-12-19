class MailBox {
    constructor(sendFunc){
        this.sendFunc = sendFunc;
        this.promiseResolve = null;
    }

    deliver(message){
        if (this.promiseResolve != null){
            this.promiseResolve(message);
        }
    }

    send(message){
        return new Promise((resolve, reject) => {
            this.sendFunc(message);
            this.promiseResolve = resolve;
        })
    }
}