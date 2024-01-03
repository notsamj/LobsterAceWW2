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
            // This is very ugly but I'm just doing some checking here first
            if (event.data == "KEEPALIVE"){
                this.sendUDP("KEEPALIVE", JSON.stringify({ "client_id": USER_DATA["name"] }));
                return;
            }
            // TODO: This is just a bandaid add something like TCP_ prefix or something from server's end and check for that here
            if (this.mailBox.isAwaiting()){
                this.mailBox.deliver(event.data);
            }else{
                activeGameMode.updateFromServer(event.data);
            }
        });
    }
    async receiveMail(){
        return await this.mailBox.await();
    }

    // Not actually using UDP (am I? well idk all the rules what constitutes UDP this is like UDP though)
    async sendUDP(target, message){
        await this.openedLock.awaitUnlock();
        this.socket.send("PUT_" + target + "_" + message);
    }
}