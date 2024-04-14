/*
    Class Name: PerformanceTimer
    Description: Used for testing the performance of various parts of a program
*/
class PerformanceTimer {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.nodes = [];
    }

    /*
        Method Name: get
        Method Parameters:
            name:
                Name of the timer
        Method Description: Finds a node with a given name, if not found then create it, returns it.
        Method Return: PerformanceTimerNode
    */
    get(name){
        let node = null;
        // Get the node
        if (!this.has(name)){
            node = new PerformanceTimerNode(name);
            this.nodes.push(node);
        }else{
            node = this.find(name);
        }
        return node;
    }

    /*
        Method Name: find
        Method Parameters:
            name:
                Name of the timer
        Method Description: Finds a node with a given name, if not found return null
        Method Return: PerformanceTimerNode
    */
    find(name){
        for (let node of this.nodes){
            if (node.getName() == name){
                return node;
            }
        }
        return null;
    }

    /*
        Method Name: has
        Method Parameters:
            name:
                Name of the timer
        Method Description: Determines if a node with the given name exists
        Method Return: Boolean, true -> has, false -> does not have
    */
    has(name){
        return this.find(name) != null;
    }

    /*
        Method Name: view
        Method Parameters: None
        Method Description: Sorts timers high to low (average time) and prints to console
        Method Return: void
    */
    view(){
        this.nodes.sort((e1, e2) => {
            return e1.getMaxTime() <= e2.getMaxTime();
        });
        console.log("Mean, Median, Max, Min");
        for (let node of this.nodes){
            console.log(node.getName() + ":", node.getMeanTime() + ", " +  node.getMedianTime() + ", " +  node.getMaxTime() + ", " + node.getMinTime());
        }
    }

    /*
        Method Name: reset
        Method Parameters: None
        Method Description: Resets all timers
        Method Return: void
    */
    reset(){
        for (let node of this.nodes){
            node.reset();
        }
    }
}

/*
    Class Name: PerformanceTimerNode
    Description: Used for testing the performance of a specific block of code
*/
class PerformanceTimerNode {
    /*
        Method Name: constructor
        Method Parameters:
            name:
                Timer name
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(name){
        this.name = name;
        this.startTime = Date.now();
        this.runTimes = [];
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
        Method Name: start
        Method Parameters: None
        Method Description: Sets the start time
        Method Return: void
    */
    start(){
        this.startTime = Date.now();
    }

    /*
        Method Name: end
        Method Parameters: None
        Method Description: Records the time
        Method Return: void
    */
    end(){
        this.runTimes.push(Date.now() - this.startTime);
    }

    /*
        Method Name: getMeanTime
        Method Parameters: None
        Method Description: Calculates the average time, -1 if none
        Method Return: void
    */
    getMeanTime(){
        // Can't divide by 0 so -1 to signify 0 runs
        if (this.runTimes.length == 0){
            return -1;
        }
        return listMean(this.runTimes);
    }

    /*
        Method Name: getMaxTime
        Method Parameters: None
        Method Description: Calculates the max time, -1 if none
        Method Return: void
    */
    getMaxTime(){
        // Can't divide by 0 so -1 to signify 0 runs
        if (this.runTimes.length == 0){
            return -1;
        }
        return listMax(this.runTimes);
    }

    /*
        Method Name: getMinTime
        Method Parameters: None
        Method Description: Calculates the min time, -1 if none
        Method Return: void
    */
    getMinTime(){
        // Can't divide by 0 so -1 to signify 0 runs
        if (this.runTimes.length == 0){
            return -1;
        }
        return listMin(this.runTimes);
    }

    /*
        Method Name: getMedianTime
        Method Parameters: None
        Method Description: Calculates the median time, -1 if none
        Method Return: void
    */
    getMedianTime(){
        // Can't divide by 0 so -1 to signify 0 runs
        if (this.runTimes.length == 0){
            return -1;
        }
        return listMedian(this.runTimes);
    }

    /*
        Method Name: reset
        Method Parameters: None
        Method Description: Reset the timer
        Method Return: void
    */
    reset(){
        this.runTotalTime = 0;
        this.runCount = 0;
    }

    /*
        Method Name: getLastTime
        Method Parameters: None
        Method Description: Finds the last recorded time
        Method Return: Integer
    */
    getLastTime(){
        return this.runTimes[this.runTimes.length-1];
    }
}