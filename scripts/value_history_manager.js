if (typeof window === "undefined"){
    NotSamLinkedList = require("../scripts/notsam_linked_list");
    Lock = require("../scripts/lock.js");
}
class ValueHistoryManager {
    constructor(tickHistoryToSave){
        this.data = new NotSamLinkedList();
        this.numSavedTicks = tickHistoryToSave;
        this.syncLock = new Lock();
    }

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

    async getValue(id, numTicks){
        let item = await this.get(id, numTicks);
        return item.getValue();
    }

    async modify(id, numTicks, jsonOBJ){
        await this.get(id, numTicks).fromJSON(jsonOBJ);
    }

    async has(id, numTicks){
        return await this.get(id, numTicks) != null;
    }

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

    async toJSON(){
        await this.syncLock.awaitUnlock(true);
        let dataList = [];
        for (let node of this.data){
            dataList.push(node.toJSON());
        }
        this.syncLock.unlock();
        return { "data": dataList };
    }

    async fromJSON(jsonOBJ){
        for (let nodeOBJ of jsonOBJ["data"]){
            if (this.has(nodeOBJ["id"], nodeOBJ["numTicks"])){
                this.modify(nodeOBJ["id"], nodeOBJ["numTicks"], nodeOBJ);
            }else{
                await this.syncLock.awaitUnlock(true);
                this.data.append(ValueHistoryNode.fromJSON(nodeOBJ));
                this.syncLock.unlock();
            }
        }
    }

    async importJSON(jsonOBJ){
        await this.syncLock.awaitUnlock(true);
        this.data = new NotSamLinkedList();
        for (let node of jsonOBJ["data"]){
            this.data.append(ValueHistoryNode.fromJSON(nodeOBJ));
        }
        this.syncLock.unlock();
    }

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
}

// Yes I could just JSON but I don't like JSON as much
class ValueHistoryNode {
    constructor(id, numTicks, value, canBeOverwritten=true){
        this.id = id;
        this.numTicks = numTicks;
        this.value = value;
        this.canBeOverwritten = canBeOverwritten;
    }

    getNumTicks(){
        return this.numTicks;
    }

    getID(){
        return this.id;
    }

    getValue(){
        return this.value;
    }

    modify(id, numTicks, value, canBeOverwritten=true){
        if (!this.canBeOverwritten){ return; }
        this.id = id;
        this.numTicks = numTicks;
        this.value = value;
        this.canBeOverwritten = canBeOverwritten;
    }

    toJSON(){
        return { "id": this.id, "numTicks": this.numTicks, "value": this.value, "canBeOverwritten": this.canBeOverwritten };
    }

    fromJSON(jsonOBJ){
        if (!this.canBeOverwritten){
            return;
        }
        this.id = jsonOBJ["id"];
        this.numTicks = jsonOBJ["numTicks"];
        this.value = jsonOBJ["value"];
        this.canBeOverwritten = jsonOBJ["canBeOverwritten"];
    }

    static fromJSON(jsonOBJ){
        return new ValueHistoryNode(jsonOBJ["id"], jsonOBJ["numTicks"], jsonOBJ["value"], jsonOBJ["canBeOverwritten"])
    }
}

if (typeof window === "undefined"){
    module.exports=ValueHistoryManager;
}