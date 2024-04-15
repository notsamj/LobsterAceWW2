// TODO: Comments
class NSEventHandler {
    constructor(){
        this.events = [];
    }

    getEvent(eventName){
        for (let event of this.events){
            if (event.getName() == eventName){
                return event;
            }
        }
        return null;
    }

    hasEvent(eventName){
        return this.getEvent(eventName) != null;
    }

    getOrCreate(eventName){
        let event;
        if (!this.hasEvent(eventName)){
            event = new NSEvent(eventName)
            this.events.push(event);
        }else{
            event = this.getEvent(eventName);
        }
        return event;
    }

    addHandler(eventName, handlerFunction, priority=0){
        let event = this.getOrCreate(eventName);
        let handlerID = event.addHandler(handlerFunction, priority);
        return handlerID;
    }

    removeHandler(eventName, handlerID){
        if (!this.hasEvent(eventName)){
            throw new Error("Event does not exist: " + eventName);
        }
        let event = this.getEvent(eventName);
        event.removeHandler(handlerID);
    }

    emit(eventDetails){
        let event = this.getOrCreate(eventDetails["name"]);
        event.emit(eventDetails);
    }
}

class NSEvent {
    constructor(name){
        this.name = name;
        this.currentHandlerIndex = 0;
        this.handlers = [];
    }

    getName(){
        return this.name;
    }

    addHandler(handlerFunction, priority){
        let handlerID = this.currentHandlerIndex;
        this.currentHandlerIndex++;
        this.handlers.push({"handler_id": handlerID, "handler_function": handlerFunction, "priority": priority});
        this.handlers.sort((a, b) => {
            return a["priority"] - b["priority"];
        })
        return handlerID;
    }

    removeHandler(handlerID){
        let foundIndex = -1;
        
        // Find handler
        for (let i = 0; i < this.handlers.length; i++){
            let handlerObject = this.handlers[i];
            if (handlerObject["handler_id"] == handlerID){
                foundIndex = i;
                break;
            }
        }

        // If handler not found
        if (foundIndex == -1){
            throw new Error(this.getName() + " handler with id not found: " + handlerID);
        }

        // Shift all down
        for (let i = foundIndex; i < this.handlers.length - 1; i++){
            this.handlers[i] = this.handlers[i+1];
        }

        // Remove last element
        this.handlers.pop();
    }

    emit(eventDetails){
        for (let handlerObject of this.handlers){
            handlerObject["handler_function"](eventDetails);
        }
    }
}