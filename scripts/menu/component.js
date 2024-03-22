/*
    Class Name: Component
    Description: An abstract class of a component of a visual interface
*/
class Component {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.enabled = true;
        this.displayEnabled = true;
    }

    /*
        Method Name: enable
        Method Parameters: None
        Method Description: Enables the component
        Method Return: void
    */
    enable(){
        this.enabled = true;
    }

    /*
        Method Name: disable
        Method Parameters: None
        Method Description: Disables the component
        Method Return: void
    */
    disable(){
        this.enabled = false;
    }

    // TODO: Comments
    isDisabled(){
        return !this.enabled;
    }

    // TODO: Comments
    isEnabled(){
        return this.enabled;
    }

    // TODO: Comments
    isDisplayEnabled(){
        return this.displayEnabled;
    }

    // TODO: Comments
    enableDisplay(){
        this.displayEnabled = true;
    }

    // TODO: Comments
    disableDisplay(){
        this.displayEnabled = false;
    }

    // TODO: Comments
    fullDisable(){
        this.displayEnabled = false;
        this.enabled = false;
    }

    fullEnable(){
        this.displayEnabled = true;
        this.enabled = true;
    }


    // Either meant to be blank or meant to be overridden
    covers(){}
    clicked(){}

    // Abstract Method
    display(){}
}