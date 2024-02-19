// TODO: File needs comments
class ProgramTester {
    constructor(){
        this.outputEnablers = new NotSamLinkedList();
        this.values = new NotSamLinkedList();
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

    getValue(valueName){
        for (let [value, index] of this.values){
            if (value.getName() == valueName){
                return value;
            }
        }
        return null;
    }

    hasValue(valueName){
        return this.getValue(valueName) != null;
    }

    getOrCreateValue(valueName){
        let value;
        if (!this.hasValue(valueName)){
            value = new ValueAnalysis(valueName);
            this.values.add(value);
        }else{
            value = this.getValue(valueName);
        }
        return value;
    }

    recordValue(valueName, value){
        let valueAnalysis = this.getOrCreateValue(valueName);
        valueAnalysis.record(value);
    }
}

class ValueAnalysis {
    constructor(name){
        this.name = name;
        this.lastValue = null;
        this.differences = [];
        this.times = [];
    }

    getName(){ return this.name; }

    record(value){
        this.times.push(Date.now());
        if (this.lastValue == null){
            this.lastValue = value;
            return;
        }
        this.differences.push(value - this.lastValue);
    }

    print(){
        let mean = this.mean();
        let median = this.median();
        let max = this.max();
        let min = this.min();
        console.log("Mean Difference: %f\nMedian Difference: %f\nMax Difference: %f\nMin Difference: %f", mean, median, max, min);
    }

    mean(){
        let sum = 0;
        for (let value of this.differences){
            sum += value;
        }
        return safeDivide(sum, this.differences.length, 0, null);
    }

    median(){
        if (this.differences.length == 0){ return null; }
        let sorted = copyArray(this.differences).sort();
        return sorted[Math.floor(sorted.length/2)];
    }

    max(){
        let maxValue = null;
        for (let value of this.differences){
            if (maxValue == null || value > maxValue){
                maxValue = value;
            }
        }
        return maxValue;
    }

    min(){
        let minValue = null;
        for (let value of this.differences){
            if (minValue == null || value < minValue){
                minValue = value;
            }
        }
        return minValue;
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