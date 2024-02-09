// TODO: Comments
class HUD {
    constructor(){
        this.hudElements = [];
    }

    updateElement(name, value){
        let foundElement = null;
        for (let element of this.hudElements){
            if (name == element.getName()){
                foundElement = element;
                break;
            }
        }
        // If element doesn't exist, create it
        if (foundElement == null){
            foundElement = new HUDElement(name, value);
            this.hudElements.push(foundElement);
        }else{
            foundElement.update(value);
        }

    }

    display(){
        let sizeOfText = FILE_DATA["hud"]["text_size"];
        textSize(sizeOfText);
        textAlign(LEFT, TOP);
        let i = 1;
        for (let element of this.hudElements){
            if (!element.isReadyToDisplay()){
                continue;
            }
            element.display(10, i * sizeOfText);
            i++;
        }
    }
}

class HUDElement {
    constructor(name, value){
        this.name = name;
        this.readyToDisplay = true;
        this.value = null;
    }

    update(value){
        this.value = value;
        this.readyToDisplay = true;
    }

    getValue(){
        return this.value;
    }

    getName(){
        return this.name;
    }

    display(x, y){
        fill(FILE_DATA["hud"]["key_colour"]);
        let key = this.name + ": ";
        text(key, x, y);
        let xOffset = textWidth(key);
        fill(FILE_DATA["hud"]["value_colour"]);
        text(`${this.value}`, x + xOffset, y);
        this.readyToDisplay = false;
    }

    isReadyToDisplay(){
        return this.readyToDisplay;
    }
}