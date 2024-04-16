/*
    Class Name: MailService
    Description: A service for sending out messages and receiving them.
*/
class MailService {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.mailboxes = new NotSamLinkedList();
    }

    /*
        Method Name: hasMailbox
        Method Parameters:
            mailboxName:
                The mailbox being looked for
        Method Description: Checks if a mailbox exists with a given name
        Method Return: Boolean
    */
    hasMailbox(mailboxName){
        return this.getMailbox(mailboxName) != null;
    }

    /*
        Method Name: getMailbox
        Method Parameters:
            mailboxName:
                The mailbox being looked for
        Method Description: Searched for a mailbox, returns it if found otherwise null
        Method Return: Mailbox
    */
    getMailbox(mailboxName){
        for (let [mailbox, mailboxIndex] of this.mailboxes){
            if (mailbox.getName() == mailboxName){
                return mailbox;
            }
        }
        return null;
    }

    /*
        Method Name: sendJSON
        Method Parameters:
            mailboxName:
                The return adress for the mail
            messageJSON:
                The messageJSON object being sent
            timeout:
                The time to wait for a reply to the message
        Method Description: Sends a message and gets a response
        Method Return: JSON Object
    */
    async sendJSON(mailboxName, messageJSON, timeout=1000){
        if (!this.hasMailbox(mailboxName)){
            this.mailboxes.add(new Mailbox(mailboxName));
        }
        let mailbox = this.getMailbox(mailboxName);
        return await mailbox.sendJSON(messageJSON, timeout);
    }

    /*
        Method Name: deliver
        Method Parameters:
            message:
                A message to deliver
        Method Description: Delivers a message to an indicated mailbox
        Method Return: Boolean, true -> delivered, false -> not delivered
    */
    deliver(message){
        let messageJSON = JSON.parse(message);
        if (objectHasKey(messageJSON, "mail_box")){
            this.getMailbox(messageJSON["mail_box"]).deliver(message);
            return true;
        }
        return false;
    }

    /*
        Method Name: addMonitor
        Method Parameters:
            mailboxName:
                Name of the mailbox being monitored
        Method Description: Adds a monitor for a mailbox to await mail
        Method Return: void
    */
    addMonitor(mailboxName, callback){
        if (!this.hasMailbox(mailboxName)){
            this.mailboxes.add(new Mailbox(mailboxName));
        }
        new MailMonitor(this.getMailbox(mailboxName), callback);
    }
}

/*
    Class Name: Mailbox
    Description: A object used to receive mail (messages)
*/
class Mailbox {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(mailboxName){
        this.mailboxName = mailboxName;
        this.awaiting = false;
        this.receiver = null;
    }

    /*
        Method Name: sendJSON
        Method Parameters:
            messageJSON:
                The messageJSON object being sent
            timeout:
                The time to wait for a reply to the message
        Method Description: Sends a JSON object and return the response
        Method Return: JSON Object
    */
    async sendJSON(messageJSON, timeout=1000){
        //let tempNumber = randomNumberInclusive(1,1000);
        //console.log("Sending", tempNumber, messageJSON)
        if (this.awaiting){
            throw new Error("Mail sent with return address before previous response has returned: " + this.getName());
        }
        this.awaiting = true;
        messageJSON["mail_box"] = this.getName();
        let result = await MessageResponse.sendAndReceiveJSON(this, messageJSON, timeout);
        //console.log("Received", tempNumber);
        return result;
    }

    /*
        Method Name: addReceiver
        Method Parameters:
            receiver:
                An object with a member function called complete that takes a message
        Method Description: Adds an object that will receive mail from this mailbox
        Method Return: void
    */
    addReceiver(receiver){
        this.receiver = receiver;
    }

    /*
        Method Name: deliver
        Method Parameters:
            message:
                A message to deliver
        Method Description: Delivers a message to a receiver
        Method Return: void
    */
    deliver(message){
        if (!this.awaiting){
            return; // No error because it is expected behavior when a timeout exists
            // throw new Error("Mail delivered with nobody awaiting.");
        }
        this.awaiting = false;
        this.receiver.complete(message);
    }

    /*
        Method Name: getName
        Method Parameters: None
        Method Description: Getter
        Method Return: String
    */
    getName(){
        return this.mailboxName;
    }

    /*
        Method Name: stopAwaiting
        Method Parameters: None
        Method Description: Tells a mailbox to stop awaiting a reply
        Method Return: void
        Note: Used so that you don't run into issue endlessly awaiting say refresh and you send another then get still awaiting cannot send. Instead with thise method you will get nobody is awaiting if the refresh is actually answered at some time 
    */
    stopAwaiting(){
        this.awaiting = false;
    }

    /*
        Method Name: setAwaiting
        Method Parameters:
            shouldBeAwaiting:
                A boolean indicated whether or not the mailbox should be in an awaiting state
        Method Description: Setter
        Method Return: void
    */
    setAwaiting(shouldBeAwaiting){
        this.awaiting = shouldBeAwaiting;
    }
}
/*
    Class Name: MessageResponse
    Description: A class representing the response to a message
*/
class MessageResponse {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(mailbox, timeout){
        this.result = null;
        this.completedLock = new Lock();
        this.completedLock.lock();
        this.mailbox = mailbox;
        mailbox.addReceiver(this);
        this.timeout = setTimeout(() => { this.complete(); }, timeout)
    }

    /*
        Method Name: complete
        Method Parameters: None
        Method Description: Sets the result of the action of awaiting a message. Null if timeout.
        Method Return: void
    */
    complete(result=null){
        // If this is a timeout then tell the mailbox to give up waiting for a response to the previous message
        if (result == null){
            this.mailbox.stopAwaiting();
        }else{
            clearTimeout(this.timeout);
        }
        // If already completed return
        if (this.completedLock.isReady()){ return; }
        this.result = result;
        this.completedLock.unlock();
    }

    /*
        Method Name: awaitResponse
        Method Parameters: None
        Method Description: Waits for the response to come in the returns it
        Method Return: String
    */
    async awaitResponse(){
        // Wait for the lock to no longer be completed
        await this.completedLock.awaitUnlock();
        return this.result;
    }

    /*
        Method Name: sendAndReceiveJSON
        Method Parameters:
            mailbox:
                A mailbox object that will receive the mail
            messageJSON:
                A message to send
            timeout:
                The time (ms) before giving up on getting return mail
        Method Description: Adds a password and then sends a JSON object     
        Method Return: JSON Object
    */
    static async sendAndReceiveJSON(mailBox, messageJSON, timeout){
        messageJSON["password"] = USER_DATA["server_data"]["password"];
        return JSON.parse(await MessageResponse.sendAndReceive(mailBox, JSON.stringify(messageJSON), timeout));
    }

    /*
        Method Name: sendAndReceive
        Method Parameters:
            mailbox:
                A mailbox object that will receive the mail
            messageJSON:
                A message to send
            timeout:
                The time (ms) before giving up on getting return mail
        Method Description: Sends a string and returns the response    
        Method Return: String
    */
    static async sendAndReceive(mailBox, message, timeout){
        SERVER_CONNECTION.send(message);
        let messageResponse = new MessageResponse(mailBox, timeout);
        let response = await messageResponse.awaitResponse();
        return response;
    }
}

/*
    Class Name: MailMonitor
    Description: Monitors a mailbox for incoming mail. This mail is not in response to a specific message.
*/
class MailMonitor {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(mailbox, callback){
        this.mailbox = mailbox;
        this.mailbox.setAwaiting(true);
        this.callback = callback;
        mailbox.addReceiver(this);
    }

    /*
        Method Name: complete
        Method Parameters:
            result:
                A message in the mailbox
        Method Description: Receieves a message from the mailbox
        Method Return: void
    */
    complete(result){
        this.mailbox.setAwaiting(true);
        this.callback(result);
    }
}