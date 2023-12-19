class ServerConnection {
    constructor(){
        this.ip = fileData["constants"]["server_ip"];
        this.port = fileData["constants"]["server_port"];
        this.commsLock = new Lock();
        this.socket = new WebSocket("ws://" + this.ip + ":" + this.port);
        this.openedLock = new Lock();
        this.openedLock.lock();
        this.mailBox = new MailBox((mailData) => {
            this.socket.send(mailData);
        });
        this.socket.addEventListener("open", (event) => {
            console.log("Connection to server opened.");
            this.openedLock.unlock();
        });

        this.socket.addEventListener("message", (event) => {
            this.mailBox.deliver(event.data);
        });
    }

    // Definitely not actually TCP but idc
    async requestTCP(target){
        await this.openedLock.awaitUnlock();
        return await this.mailBox.send("GET_" + target);
    }

    // Not actually using UDP (am I? well idk all the rules what constitutes UDP this is like UDP though)
    async sendUDP(target, message){
        await this.openedLock.awaitUnlock();
        this.socket.send("UDP_" + target + "_" + message);
    }
}