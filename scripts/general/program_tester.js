// TODO: Class needs comments
class ProgramTester {
    constructor(){
        this.outputEnablers = new NotSamLinkedList();
    }

    getOutputEnabler(enablerName){
        for (let [outputEnabler, index] of this.outputEnablers){
            if (outputEnabler.getName() == enablerName){
                return outputEnabler;
            }
        }
        return null;
    }

    hasOutputEnabler(enablerName){
        return this.getOutputEnabler(enablerName) != null;
    }

    getOrCreateOutputEnabler(enablerName){
        let outputEnabler;
        if (!this.hasOutputEnabler(enablerName)){
            outputEnabler = new OutputEnabler(enablerName);
            this.outputEnablers.add(outputEnabler);
        }else{
            outputEnabler = this.getOutputEnabler(enablerName);
        }
        return outputEnabler;
    }

    enableOutput(enablerName){
        let outputEnabler = this.getOrCreateOutputEnabler(enablerName);
        outputEnabler.enable();
    }

    tryToOutput(enablerName, value){
        let outputEnabler = this.getOrCreateOutputEnabler(enablerName);
        if (outputEnabler.isDisabled()){ return; }
        console.log(enablerName + ":", value);
        outputEnabler.disable();
    }
}

class OutputEnabler {
    constructor(name){
        this.name = name;
        this.outputLock = new Lock();
        this.outputLock.lock();
    }

    getName(){
        return this.name;
    }

    isEnabled(){
        return this.outputLock.isUnlocked();
    }

    isDisabled(){
        return !this.isEnabled();
    }

    disable(){
        this.outputLock.lock();
    }

    enable(){
        this.outputLock.unlock();
    }
}