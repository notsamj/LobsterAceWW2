// TODO: This class needs comments
class UserInputManager {
    constructor(){
        this.handlerNodes = [];
    }

    register(alias, eventName, checker, onOff=true){
        let node = this.get(alias);
        document.addEventListener(eventName, (event) => {
            if (checker(event)){
                node.activate(onOff);
            }
        });
    }

    has(alias){
        return this.get(alias) != null;
    }

    get(alias){
        // Check if we have this node
        for (let handlerNode of this.handlerNodes){
            if (handlerNode.getAlias() == alias){
                return handlerNode;
            }
        }
        // Else doesn't exist -> create it
        let newNode = new UserInputNode(alias);
        this.handlerNodes.push(newNode);
        return newNode;
    }
    
    getActive(alias){
        return this.has(alias) ? this.get(alias).getActive() : false;
    }
}

// TODO: This class needs comments
class UserInputNode {
    constructor(alias){
        this.alias = alias;
        this.active = false;
    }

    getAlias(){
        return this.alias;
    }

    activate(onOff){
        this.active = onOff;
    }

    getActive(){
        return this.active;
    }
}