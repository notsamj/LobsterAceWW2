// TODO: File needs comments
/*
    Note: This class will have persisent mailboxes with custom ids to properly return mail to what its asked
    for example
    await mailbox["heartbeat"]
    etc. smh I'm dying
*/
class MailService {
    constructor(socket){
        this.mailboxes = new NotSamLinkedList();
    }

    hasMailbox(mailboxName){
        return this.getMailbox(mailboxName) != null;
    }

    getMailbox(mailboxName){
        for (let [mailbox, mailboxIndex] of this.mailboxes){
            if (mailbox.getName() == mailboxName){
                return mailbox;
            }
        }
        return null;
    }

    // TODO: Add awaiting mail (without sending anything) like for errors

    async sendJSON(mailboxName, messageJSON, timeout=1000){
        if (!this.hasMailbox(mailboxName)){
            this.mailboxes.add(new Mailbox(mailboxName));
        }
        let mailbox = this.getMailbox(mailboxName);
        return await mailbox.sendJSON(messageJSON, timeout);
    }

    deliver(message){
        let messageJSON = JSON.parse(message);
        if (objectHasKey(messageJSON, "mail_box")){
            this.getMailbox(messageJSON["mail_box"]).deliver(message);
            return true;
        }
        return false;
    }
}

class Mailbox {
    constructor(mailboxName){
        this.mailboxName = mailboxName;
        this.awaiting = false;
        this.responder = null;
    }

    async sendJSON(messageJSON, timeout=1000){
        if (this.awaiting){
            throw new Error("Mail sent with return address before previous response has returned: " + this.getName());
        }
        this.awaiting = true;
        messageJSON["mail_box"] = this.getName();
        return await MessageResponse.sendAndReceiveJSON(this, messageJSON, timeout);
    }

    addResponder(responder){
        this.responder = responder;
    }

    deliver(message){
        if (!this.awaiting){
            throw new Error("Mail delivered with nobody awaiting.");
        }
        this.responder.complete(message);
        this.awaiting = false;
    }

    getName(){
        return this.mailboxName;
    }
}

class MessageResponse {
    constructor(mailbox, timeout){
        this.result = null;
        this.completedLock = new Lock();
        this.completedLock.lock();
        mailbox.addResponder(this);
        setTimeout(() => { this.complete(); }, timeout)
    }

    complete(result=null){
        // If already completed return
        if (this.completedLock.isReady()){ return; }
        this.result = result;
        this.completedLock.unlock();
    }

    async awaitResponse(){
        // Wait for the lock to no longer be completed
        await this.completedLock.awaitUnlock();
        return this.result;
    }

    static async sendAndReceiveJSON(mailBox, messageJSON, timeout){
        messageJSON["password"] = USER_DATA["server_data"]["password"]
        return JSON.parse(await MessageResponse.sendAndReceive(mailBox, JSON.stringify(messageJSON), timeout));
    }

    static async sendAndReceive(mailBox, message, timeout){
        SERVER_CONNECTION.send(message);
        let messageResponse = new MessageResponse(mailBox, timeout);
        let response = await messageResponse.awaitResponse();
        return response;
    }
}