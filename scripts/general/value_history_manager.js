// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    NotSamLinkedList = require("../scripts/notsam_linked_list");
    Lock = require("../scripts/lock.js");
}
/*
    Class Name: ValueHistoryManager
    Description: A tool to manage previous values at points in time.
*/
class ValueHistoryManager {
    /*
        Method Name: constructor
        Method Parameters:
            tickHistoryToSave:
                The number of ticks to save. E.g. save 500 ticks at a time
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(tickHistoryToSave){
        this.data = new NotSamLinkedList();
        this.numSavedTicks = tickHistoryToSave;
        this.syncLock = new Lock();
    }

    /*
        Method Name: get
        Method Parameters:
            id:
                The id of the value that is being requested
            numTicks:
                The num ticks of the value that is being requested
        Method Description: Get the Node @ [id,numTicks]
        Method Return: ValueHistoryNode
    */
    async get(id, numTicks){
        await this.syncLock.awaitUnlock(true);
        for (let [item, itemIndex] of this.data){
            if (item.getID() == id && item.getNumTicks() == numTicks){
                this.syncLock.unlock();
                return item;
            }
        }
        this.syncLock.unlock();
        return null;
    }

    /*
        Method Name: getValue
        Method Parameters:
            id:
                The id of the value that is being requested
            numTicks:
                The num ticks of the value that is being requested
        Method Description: Get the Value @ [id,numTicks]
        Method Return: Object (Unknown type)
    */
    async getValue(id, numTicks){
        let item = await this.get(id, numTicks);
        return item.getValue();
    }

    /*
        Method Name: modify
        Method Parameters:
            id:
                The id of the value that is being requested
            numTicks:
                The num ticks of the value that is being requested
            JSONObj:
                A json representation of the previous value
        Method Description: Set the Value @ [id,numTicks]
        Method Return: Promise (implicit)
    */
    async modify(id, numTicks, jsonOBJ){
        await this.get(id, numTicks).fromJSON(jsonOBJ);
    }

    /*
        Method Name: has
        Method Parameters:
            id:
                The id of the value that is being requested
            numTicks:
                The num ticks of the value that is being requested
        Method Description: Checks for the existence of a value
        Method Return: Boolean, true -> has, false -> does not have
    */
    async has(id, numTicks){
        return await this.get(id, numTicks) != null;
    }

    /*
        Method Name: put
        Method Parameters:
            id:
                The id of the value that is being requested
            numTicks:
                The num ticks of the value that is being requested
            value:
                Value to store
            canBeOverwritten:
                Whether or not the value can be overwritten
        Method Description: Set the value at the position to a new value
        Method Return: Promise (implicit)
    */
    async put(id, numTicks, value, canBeOverwritten=true){
        await this.syncLock.awaitUnlock(true);
        if (await this.has(id, numTicks)){
            let entry = await this.get(id, numTicks);
            entry.modify(id, numTicks, value, canBeOverwritten);
        }else{
            this.data.append(new ValueHistoryNode(id, numTicks, value, canBeOverwritten));
        }
        // Else doesn't have it
        this.syncLock.unlock();
        this.deletionProcedure();
    }

    /*
        Method Name: toJSON
        Method Parameters: None
        Method Description: Get a JSON rep of the data structure
        Method Return: JSON Object
    */
    async toJSON(){
        await this.syncLock.awaitUnlock(true);
        let dataList = [];
        for (let node of this.data){
            dataList.push(node.toJSON());
        }
        this.syncLock.unlock();
        return { "data": dataList };
    }

    /*
        Method Name: fromJSON
        Method Parameters: 
            jsonOBJ:
                A jason rep of the data structure
        Method Description: Fill up the ValueHistoryManager from a json representation
        Method Return: Promise (implicit)
    */
    async fromJSON(jsonOBJ){
        for (let nodeOBJ of jsonOBJ["data"]){
            if (this.has(nodeOBJ["id"], nodeOBJ["num_ticks"])){
                this.modify(nodeOBJ["id"], nodeOBJ["num_ticks"], nodeOBJ);
            }else{
                await this.syncLock.awaitUnlock(true);
                this.data.append(ValueHistoryNode.fromJSON(nodeOBJ));
                this.syncLock.unlock();
            }
        }
    }

    /*
        Method Name: importJSON
        Method Parameters: 
            jsonOBJ:
                A jason rep of the data structure
        Method Description: Reset then fill up the ValueHistoryManager from a json representation
        Method Return: Promise (implicit)
    */
    async importJSON(jsonOBJ){
        await this.syncLock.awaitUnlock(true);
        this.data = new NotSamLinkedList();
        for (let node of jsonOBJ["data"]){
            this.data.append(ValueHistoryNode.fromJSON(nodeOBJ));
        }
        this.syncLock.unlock();
    }

    /*
        Method Name: deletionProcedure
        Method Parameters: None
        Method Description: Delete old entries
        Method Return: Promise (implicit)
    */
    async deletionProcedure(){
        await this.syncLock.awaitUnlock(true);
        let stillDeleting = true;
        let maxTicks = -1;
        for (let [node, nodeIndex] of this.data){
            maxTicks = Math.max(maxTicks, node.getNumTicks());
        }
        while (stillDeleting){
            stillDeleting = false;
            for (let [node, nodeIndex] of this.data){
                if (node.getNumTicks() < maxTicks - this.numSavedTicks){
                    stillDeleting = true;
                    this.data.remove(nodeIndex);
                    break;
                }
            }
        }
        this.syncLock.unlock();
    }

    /*
        Method Name: findLast
        Method Parameters:
            id:
                identifier of a value
        Method Description: Find the latest entry for a given id
        Method Return: Promise (implicit)
    */
    async findLast(id){
        await this.syncLock.awaitUnlock(true);
        let maxNumTicks = 0;
        let maxValue = null;
        for (let [item, itemIndex] of this.data){
            if (item.getID() == id && item.getNumTicks() > maxNumTicks){
                maxNumTicks = item.getNumTicks();
                maxValue = item.getValue();
            }
        }
        this.syncLock.unlock();
        return maxValue;
    }

    /*
        Method Name: findLast
        Method Parameters:
            id:
                identifier of a value
            maxTickINCL:
                Inclusive, maximum tick to search up to
        Method Description: Find the latest entry for a given id up to and including the set point
        Method Return: Promise (implicit)
    */
    async getLastUpTo(id, maxTickINCL){
        await this.syncLock.awaitUnlock(true);
        let maxNumTicks = 0;
        let maxValue = null;
        for (let [item, itemIndex] of this.data){
            if (item.getID() == id && item.getNumTicks() > maxNumTicks && item.getNumTicks() <= maxTickINCL){
                maxNumTicks = item.getNumTicks();
                maxValue = item.getValue();
            }
        }
        this.syncLock.unlock();
        return maxValue;
    }
}

/*
    Class Name: ValueHistoryNode
    Description: A node to store data in the value history manager.
    Note: Yes I could just JSON but I don't like JSON as much
*/
class ValueHistoryNode {
    /*
        Method Name: constructor
        Method Parameters:
            id:
                The id of the value that is being requested
            numTicks:
                The num ticks of the value that is being requested
            value:
                Value to store
            canBeOverwritten:
                Whether or not the value can be overwritten
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(id, numTicks, value, canBeOverwritten=true){
        this.id = id;
        this.numTicks = numTicks;
        this.value = value;
        this.canBeOverwritten = canBeOverwritten;
    }

    /*
        Method Name: getNumTicks
        Method Parameters: None
        Method Description: Getter
        Method Return: int
    */
    getNumTicks(){
        return this.numTicks;
    }

    /*
        Method Name: getID
        Method Parameters: None
        Method Description: Getter
        Method Return: Unknown type
    */
    getID(){
        return this.id;
    }

    /*
        Method Name: getValue
        Method Parameters: None
        Method Description: Getter
        Method Return: Unknown type
    */
    getValue(){
        return this.value;
    }

    /*
        Method Name: modify
        Method Parameters:
            id:
                The id of the value that is being requested
            numTicks:
                The num ticks of the value that is being requested
            value:
                Value to store
            canBeOverwritten:
                Whether or not the value can be overwritten
        Method Description: Modify the properties of a node
        Method Return: void
    */
    modify(id, numTicks, value, canBeOverwritten=true){
        if (!this.canBeOverwritten){ return; }
        this.id = id;
        this.numTicks = numTicks;
        this.value = value;
        this.canBeOverwritten = canBeOverwritten;
    }

    /*
        Method Name: toJSON
        Method Parameters: None
        Method Description: Get a JSON rep of the node
        Method Return: JSON Object
    */
    toJSON(){
        return { "id": this.id, "num_ticks": this.numTicks, "value": this.value, "can_be_overwritten": this.canBeOverwritten };
    }

    /*
        Method Name: fromJSON
        Method Parameters: 
            jsonOBJ:
                A jason rep of the node
        Method Description: Modifies a node based on a JSON rep
        Method Return: void
    */
    fromJSON(jsonOBJ){
        if (!this.canBeOverwritten){
            return;
        }
        this.id = jsonOBJ["id"];
        this.numTicks = jsonOBJ["num_ticks"];
        this.value = jsonOBJ["value"];
        this.canBeOverwritten = jsonOBJ["can_be_overwritten"];
    }

    /*
        Method Name: fromJSON
        Method Parameters: 
            jsonOBJ:
                A jason rep of the data structure
        Method Description: Creates a new from a JSON rep
        Method Return: ValueHistoryNode
    */
    static fromJSON(jsonOBJ){
        return new ValueHistoryNode(jsonOBJ["id"], jsonOBJ["num_ticks"], jsonOBJ["value"], jsonOBJ["can_be_overwritten"])
    }
}
// If using NodeJS -> export the class
if (typeof window === "undefined"){
    module.exports=ValueHistoryManager;
}