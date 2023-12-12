class Component {
    constructor(){
        this.enabled = true;
    }

    enable(){
        this.enabled = true;
    }

    disable(){
        this.enabled = false;
    }

    // Either meant to be blank or meant to be overridden
    covers(){}
    clicked(){}

    // Abstract Method
    display(){}
}