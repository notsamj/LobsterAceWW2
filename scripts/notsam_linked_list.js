class LLNode{
    constructor(value){
        this.value = value;
        this.next = null;
    }
}
class NotSamLinkedList{
    constructor(array=null){
        this.head = null;
        if (array != null){
            this.convertFromArray(array);
        }
    }

    convertFromArray(array){
        for (let i = 0; i < array.length; i++){
            this.insert(array[i]);
        }
    }

    append(value){
        this.insert(value);
    }
    /*
     *   Method Name: insert
     *   Method Parameters:
     *   Double value:
     *      Value to add to the list
     *   Method Description:
     *   This method inserts a value into the list.
     *   Method Return: None
     */
    insert(value, index=this.getSize()){
        if (index > this.getSize() || index < 0){
            console.log(`Invalid insertion index! (${index})`);
            return; 
        }
        let newNode = new LLNode(value);

        // If empty list
        if (this.getSize() == 0){
            this.head = newNode;
            return;
        }

        let current = this.head;
        let previous = null;
        let i = 0;
        // Go through the list to a proper insertion index
        while (i < index){
            // Only need to set previous once we get to the index
            if (i == index - 1){
                previous = current;
            }
            current = current.next;
            i++;
        }
        // This is only the case when at the end of the list
        if (index == this.getSize()){
            previous.next = newNode;
            newNode.next = null;
        }else{
            // If the list is 1 long
            if (previous != null){
                previous.next = newNode;
            }else{
                this.head = newNode;
            }
            newNode.next = current;
        }
    }

    push(element){ this.insert(element); }
    /*
     *   Method Name: size
     *   Method Parameters: None
     *   Method Description:
     *   This method calculates then returns the size of the list.
     *   Method Return: int (Size of the list)
     */
    getSize(){
        let current = this.head;
        let size = 0;
        // Loop through the list
        while (current != null){
            current = current.next;
            size += 1;
        }
        return size;
    }

    getLength(){
        return this.getSize();
    }
    /*
     *   Method Name: print
     *   Method Parameters: None
     *   Method Description:
     *   This method prints every element in the list
     *   Method Return: None
     */
    print(){
        if (this.getSize() == 0){
            console.log("List Empty --> cannot print!!");
            return;
        }

        let current = this.head;
        let i = 0;
        // Loop through the list and print each value
        while (current != null){
            console.log(`${i}: ${current.value}:`);
            i++;
            current = current.next;
        }
    }
    /*
     *   Method Name: get
     *   Method Parameters:
     *   int index:
     *      Index of desired element
     *   Method Description:
     *   This method returns a value from the list.
     *   Method Return: double
     */
    get(index){
        let node = this.getNode(index);
        return node.value;
    }

    getNode(index){
        // If the index is out of bounds
        if (this.getSize() < index + 1 || index < 0){
            console.log(`Issue @ Index: ${index} (List Size: ${this.getSize()})`);
            return;
        }

        let i = 0;
        let current = this.head;
        // Loop until desired index
        while(i < index){
            current = current.next;
            i++;
        }
        return current;
    }

    has(e){
        return (this.search(e) != -1);
    }

    search(e){
        let index = -1;
        let current = this.head;
        let i = 0;
        // Loop through the list
        while (current != null){
            if (current.value == e){
                return i;
            }
            current = current.next;
            i++;
        }
        return -1; // not found
    }

    remove(index){
        if (!((index >= 0 && index < this.getSize()))){
            return;
        }

        if (index == 0){
            this.head = this.head.next;
            return;
        }
        let previous = this.getNode(index-1); 
        previous.next = previous.next.next;
    }

    set(index, value){
        let node = this.getNode(index);
        node.value = value;
    }

    isEmpty(){
        return this.getSize() == 0;
    }

    pop(index){
        if (!((index >= 0 && index < this.getSize()))){
            return null;
        }
        let element = this.get(index);
        this.remove(index);
        return element;
    }

    *[Symbol.iterator](){
        let current = this.head;
        while (current != null){
            yield current.value;
            current = current.next;
        }
    }
}
if (typeof window === "undefined"){
    module.exports = NotSamLinkedList;
}