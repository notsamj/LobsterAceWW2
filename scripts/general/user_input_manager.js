/*
    Class Name: UserInputManager
    Description: A class for managing the user's inputs.
*/
class UserInputManager {
     /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.handlerNodes = [];
        this.tickedAggregators = [];
    }

    /*
        Method Name: registerTickedAggregator
            alias:
                Name of the ticked aggregator
            onEventName:
                Name of the event that enables the ticked aggregator
            onEventChecker:
                Function that checks if the event attributes match what is needed to enable the ticked aggregator
            offEventName:
                Name of the event that disables the ticked aggregator
            offEventChecker:
                Function that checks if the event attributes match what is needed to disable the ticked aggregator
        Method Parameters: None
        Method Description: Registers a new ticked aggregator
        Method Return: void
    */
    registerTickedAggregator(alias, onEventName, onEventChecker, offEventName, offEventChecker){
        let tickedAggregator = new TickedAggregator(alias);
        document.addEventListener(onEventName, (event) => {
            if (onEventChecker(event)){
                tickedAggregator.enableTicks();
            }
        });
        document.addEventListener(offEventName, (event) => {
            if (offEventChecker(event)){
                tickedAggregator.disableTicks();
            }
        });
        this.tickedAggregators.push(tickedAggregator);
    }

    /*
        Method Name: getTickedAggregator
        Method Parameters:
            alias:
                The name of the ticked aggregator
        Method Description: Finds a ticked aggregator if it exists, otherwise returns null
        Method Return: TickedAggregator
    */
    getTickedAggregator(alias){
        for (let tickedAggregator of this.tickedAggregators){
            if (tickedAggregator.getAlias() == alias){ return tickedAggregator; }
        }
        return null;
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Ticks all ticked aggegators
        Method Return: void
    */
    tick(){
        for (let tickedAggregator of this.tickedAggregators){ tickedAggregator.tick(); }
    }

    /*
        Method Name: register
        Method Parameters:
            alias:
                The name of the listener
            eventName:
                The name of the event to await
            checker:
                The function that checks if the event meets requirements
            onOff:
                Whether or not the event activates or deactivates the node
        Method Description: Sets up a listener for an event and potentially creates a node
        Method Return: void
    */
    register(alias, eventName, checker, onOff=true){
        let node = this.get(alias);
        document.addEventListener(eventName, (event) => {
            if (checker(event)){
                node.setActivated(onOff);
            }
        });
    }

    /*
        Method Name: has
        Method Parameters:
            alias:
                The name of the listener
        Method Description: Determines if a listener exists with a given name
        Method Return: boolean, true -> exists, false -> does not exist
    */
    has(alias){
        return this.get(alias) != null;
    }

    /*
        Method Name: get
        Method Parameters:
            alias:
                The name of the listener
        Method Description: Finds a listener if it exists, otherwise, creates it. Returns it.
        Method Return: UserInputNode
    */
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
    
    /*
        Method Name: isActivated
        Method Parameters:
            alias:
                The name of the listener
        Method Description: Determines if a listener node has been activated by an event
        Method Return: boolean, true -> activated, false -> not activated
    */
    isActivated(alias){
        return this.has(alias) ? this.get(alias).isActivated() : false;
    }
}

/*
    Class Name: TickedAggregator
    Description: A class that can used to measure how long an event is active, measured in ticks or miliseconds
*/
class TickedAggregator {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(alias){
        this.alias = alias;
        this.ticksEnabled = false;
        this.ticks = 0;
        this.lastPressTime = null;
    }

    /*
        Method Name: disableTicks
        Method Parameters: None
        Method Description: Disables ticks from occuring
        Method Return: void
    */
    disableTicks(){
        this.ticksEnabled = false;
    }

    /*
        Method Name: enableTicks
        Method Parameters: None
        Method Description: Enables ticks to occur
        Method Return: void
    */
    enableTicks(){
        if (this.ticksEnabled){ return; }
        this.ticksEnabled = true;
        this.lastPressTime = Date.now();
    }

    /*
        Method Name: isTicking
        Method Parameters: None
        Method Description: Checks if ticks are currently enabled
        Method Return: Boolean
    */
    isTicking(){
        return this.ticksEnabled;
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Increases the number of ticks by 1
        Method Return: void
    */
    tick(){
        if (!this.isTicking()){ return; }
        this.ticks++;
    }

    /*
        Method Name: getTicks
        Method Parameters: None
        Method Description: Getter
        Method Return: integer
    */
    getTicks(){
        return this.ticks;
    }

    /*
        Method Name: clear
        Method Parameters: None
        Method Description: Resets the number of ticks and returns the count
        Method Return: integer
    */
    clear(){
        let ticks = this.getTicks();
        this.ticks = 0;
        return ticks;
    }

    /*
        Method Name: getPressTime
        Method Parameters: None
        Method Description: Provides information as to how long the ticked aggregator has been ticking in miliseconds
        Method Return: integer
    */
    getPressTime(){
        if (this.isTicking()){
            return Date.now() - this.lastPressTime;
        }
        return 0;
    }

    /*
        Method Name: getAlias
        Method Parameters: None
        Method Description: Getter
        Method Return: String
    */
    getAlias(){
        return this.alias;
    }
}

/*
    Class Name: UserInputManager
    Description: A class for managing the user's inputs.
*/
class UserInputNode {
    /*
        Method Name: constructor
        Method Parameters:
            alias:
                Alias/name of the node
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(alias){
        this.alias = alias;
        this.activated = false;
    }

    /*
        Method Name: getAlias
        Method Parameters: None
        Method Description: Getter
        Method Return: String
    */
    getAlias(){
        return this.alias;
    }

    /*
        Method Name: setActivated
        Method Parameters:
            onOff:
                Whether to activate or deactivate the node
        Method Description: Getter
        Method Return: void
    */
    setActivated(onOff){
        this.activated = onOff;
    }

    /*
        Method Name: isActivated
        Method Parameters: None
        Method Description: Getter
        Method Return: boolean, true -> activated, false -> not activated
    */
    isActivated(){
        return this.activated;
    }
}