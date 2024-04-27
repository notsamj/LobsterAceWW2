if (typeof window === "undefined"){
    helperFunctions = require("./helper_functions.js");
    copyArray = helperFunctions.copyArray;
}
/*
    Class Name: ProgramTester
    Description: A class for testing various parts of the program
*/
class ProgramTester {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.outputEnablers = new NotSamLinkedList();
        this.values = new NotSamLinkedList();
    }

    /*
        Method Name: getOutputEnabler
        Method Parameters:
            enablerName:
                Name of the output enabler to find
        Method Description: Finds an output enabler and returns it
        Method Return: OutputEnabler
    */
    getOutputEnabler(enablerName){
        for (let [outputEnabler, index] of this.outputEnablers){
            if (outputEnabler.getName() == enablerName){
                return outputEnabler;
            }
        }
        return null;
    }

    /*
        Method Name: hasOutputEnabler
        Method Parameters:
            enablerName:
                Name of the output enabler to find
        Method Description: Determines if an output enabler with a given name exists
        Method Return: Boolean
    */
    hasOutputEnabler(enablerName){
        return this.getOutputEnabler(enablerName) != null;
    }

    /*
        Method Name: getOrCreateOutputEnabler
        Method Parameters:
            enablerName:
                Name of the output enabler to create or find
        Method Description: Creates or finds an output enabler
        Method Return: OutputEnabler
    */
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

    /*
        Method Name: enableOutput
            enablerName:
                Name of the output enabler to enable output for
        Method Description: Enabes an output enabler
        Method Return: void
    */
    enableOutput(enablerName){
        let outputEnabler = this.getOrCreateOutputEnabler(enablerName);
        outputEnabler.enable();
    }

    /*
        Method Name: tryToOutput
        Method Parameters:
            enablerName:
                Name of the output enabler to check
            value:
                Value to output
        Method Description: Try to output a value if a certain output enabler is enabled. The function then disables the output enabler.
        Method Return: void
    */
    tryToOutput(enablerName, value){
        let outputEnabler = this.getOrCreateOutputEnabler(enablerName);
        if (outputEnabler.isDisabled()){ return; }
        console.log(enablerName + ":", value);
        outputEnabler.disable();
    }

    /*
        Method Name: getValue
        Method Parameters:
            valueName:
                The name of the value to find
        Method Description: Finds a value that matches the name provided
        Method Return: ValueAnalysis
    */
    getValue(valueName){
        for (let [value, index] of this.values){
            if (value.getName() == valueName){
                return value;
            }
        }
        return null;
    }

    /*
        Method Name: hasValue
        Method Parameters:
            valueName:
                Name of the value to find
        Method Description: Determines if an value with a given name exists
        Method Return: Boolean
    */
    hasValue(valueName){
        return this.getValue(valueName) != null;
    }

    /*
        Method Name: getOrCreateValue
        Method Parameters:
            valueName:
                Name of the value to create or find
        Method Description: Creates or finds a value
        Method Return: ValueAnalysis
    */
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

    /*
        Method Name: recordValue
        Method Parameters:
            valueName:
                The name of the value
            value:
                The new value
        Method Description: Records a new value with a given value name
        Method Return: void
    */
    recordValue(valueName, value){
        let valueAnalysis = this.getOrCreateValue(valueName);
        valueAnalysis.record(value);
    }
}

/*
    Class Name: ValueAnalysis
    Description: Takes recorded values (Numbers) and performs analysis
*/
class ValueAnalysis {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(name){
        this.name = name;
        this.lastValue = null;
        this.differences = [];
        this.times = [];
    }

    /*
        Method Name: getName
        Method Parameters: None
        Method Description: Getter
        Method Return: String
    */
    getName(){ return this.name; }

    /*
        Method Name: record
        Method Parameters:
            value:
                A value to record (Number)
        Method Description: Records a value and the time at which it was received
        Method Return: void
    */
    record(value){
        this.times.push(Date.now());
        if (this.lastValue == null){
            this.lastValue = value;
            return;
        }
        this.differences.push(value - this.lastValue);
    }

    /*
        Method Name: print
        Method Parameters: None
        Method Description: Prints information about the value
        Method Return: void
    */
    print(){
        let mean = this.mean();
        let median = this.median();
        let max = this.max();
        let min = this.min();
        console.log("Mean Difference: %f\nMedian Difference: %f\nMax Difference: %f\nMin Difference: %f", mean, median, max, min);
    }

    /*
        Method Name: mean
        Method Parameters: None
        Method Description: Determines the mean value collected
        Method Return: Number
    */
    mean(){
        let sum = 0;
        for (let value of this.differences){
            sum += value;
        }
        return safeDivide(sum, this.differences.length, 0, null);
    }

    /*
        Method Name: median
        Method Parameters: None
        Method Description: Determines the median value collected
        Method Return: Number
    */
    median(){
        if (this.differences.length == 0){ return null; }
        let sorted = copyArray(this.differences).sort();
        return sorted[Math.floor(sorted.length/2)];
    }

    /*
        Method Name: max
        Method Parameters: None
        Method Description: Determines the maximum value collected
        Method Return: Number
    */
    max(){
        let maxValue = null;
        for (let value of this.differences){
            if (maxValue == null || value > maxValue){
                maxValue = value;
            }
        }
        return maxValue;
    }

    /*
        Method Name: min
        Method Parameters: None
        Method Description: Determines the minimum value collected
        Method Return: Number
    */
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

/*
    Class Name: OutputEnabler
    Description: Used for determining when to print certain values
*/
class OutputEnabler {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(name){
        this.name = name;
        this.outputLock = new Lock();
        this.outputLock.lock();
    }

    /*
        Method Name: getName
        Method Parameters: None
        Method Description: Getter
        Method Return: String
    */
    getName(){
        return this.name;
    }

    /*
        Method Name: isEnabled
        Method Parameters: None
        Method Description: Determines if the output enabled is enabled
        Method Return: Boolean
    */
    isEnabled(){
        return this.outputLock.isUnlocked();
    }

    /*
        Method Name: isDisabled
        Method Parameters: None
        Method Description: Determines if the output enabled is disabled
        Method Return: Boolean
    */
    isDisabled(){
        return !this.isEnabled();
    }

    /*
        Method Name: disable
        Method Parameters: None
        Method Description: Disables the output enabler
        Method Return: void
    */
    disable(){
        this.outputLock.lock();
    }

    /*
        Method Name: enable
        Method Parameters: None
        Method Description: Enables the output enabler
        Method Return: void
    */
    enable(){
        this.outputLock.unlock();
    }
}
// If using NodeJS -> Export
if (typeof window === "undefined"){
    module.exports=ProgramTester;
}