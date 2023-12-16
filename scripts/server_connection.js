class ServerConnection {
    constructor(){
        this.ip = fileData["constants"]["server_ip"];
        this.port = fileData["constants"]["server_port"];
        this.commsLock = new Lock();
    }

    async requestGET(target){
        await this.commsLock.awaitUnlock();
        this.commsLock.lock();
        let response = await fetch("http://" + this.ip + ":" + this.port + "/" + target);
        let responseJSON = await response.json();
        // After received response
        this.commsLock.unlock();
        return responseJSON;
    }

    async requestPOST(target, body){
        let requestBody = {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }
        await this.commsLock.awaitUnlock();
        this.commsLock.lock();
        let response = await fetch("http://" + this.ip + ":" + this.port + "/" + target, requestBody);
        let responseJSON = await response.json();
        // After received response
        this.commsLock.unlock();
        return responseJSON;
    }
}