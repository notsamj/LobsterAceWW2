/*
    Class Name: NotSamSinglyLinkedList
    Description: An implementation of the Singly LinkedList pattern.
    Note:
    This implementation was initially created in 2020 / 2021 by Samuel
    using the moniker NotSam for reasons that I chose not to disclose.
    It has been reappropriated for this program in 2023 and keeps the 'NotSam' to differentiate it 
    from a non-custom ArrayList.
*/
class NotSamSinglyLinkedList {
        /*
        Method Name: constructor
        Method Parameters:
            array:
                An array used to initialize the data for this array list
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(array=null){
        this.head = null;
        if (array != null){
            this.convertFromArray(array);
        }
    }

    /*
        Method Name: convert_from_array
        Method Parameters:
            array:
                An array used to initialize the data for this list
        Method Description: Adds all elements from array to the list
        Method Return: void
    */
    convertFromArray(array){
        for (let i = 0; i < array.length; i++){
            this.insert(array[i]);
        }
    }

    /*
     *   Method Name: append
     *   Method Parameters:
     *   Double value:
     *      Value to add to the list
     *   Method Description:
     *   This method inserts a value into the end of the list.
     *   Method Return: None
     */
    append(value){
        this.insert(value);
    }

    /*
     *   Method Name: insert
     *   Method Parameters:
     *   Double value:
     *      Value to add to the list
     *   Integer index:
     *      Index at which to insert the value
     *   Method Description:
     *   This method inserts a value into the list.
     *   Method Return: None
     */
    insert(value, index=this.getSize()){
        if (index > this.getSize() || index < 0){
            console.log(`Invalid insertion index! (${index})`);
            return; 
        }
        let newNode = new SLLNode(value);

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

    /*
     *   Method Name: push
     *   Method Parameters:
     *   Double value:
     *      Value to add to the list
     *   Method Description:
     *   This method inserts a value into the end of the list.
     *   Method Return: None
     */
    push(element){ this.insert(element); }
    
    /*
     *   Method Name: getSize
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

    /*
     *   Method Name: getSize
     *   Method Parameters: None
     *   Method Description:
     *   This method calculates then returns the size of the list.
     *   Method Return: int (Size of the list)
     */
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

    /*
     *   Method Name: getNode
     *   Method Parameters:
     *   int index:
     *      Index of desired node
     *   Method Description:
     *   This method returns a value from the list.
     *   Method Return: SLLNode
     */
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

    /*
        Method Name: has
        Method Parameters:
            e:
                Value to be checked
        Method Description: Check if the linked list includes a value
        Method Return: boolean, true -> list has the value, false -> list does NOT have the value
    */
    has(e){
        return (this.search(e) != -1);
    }

    /*
        Method Name: search
        Method Parameters:
            e:
                Value to be checked
        Method Description: Search the linked list for a value and return the index found (-1 if not found)
        Method Return: int
    */
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

    /*
        Method Name: remove
        Method Parameters:
            index:
                Index at which to find element that is being looked for
        Method Description: Remove the element @ index {index}
        Method Return: void
    */
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

    /*
        Method Name: set
        Method Parameters:
            index:
                index at which to set the value
            value:
                value to put @ {index}
        Method Description: Put value into position {index}
        Method Return: void
    */
    set(index, value){
        let node = this.getNode(index);
        node.value = value;
    }

    /*
        Method Name: isEmpty
        Method Parameters: None
        Method Description: Determine if the array list is empty
        Method Return: boolean, true -> empty, false -> not empty
    */
    isEmpty(){
        return this.getSize() == 0;
    }

    /*
        Method Name: pop
        Method Parameters:
            index:
                Index at which to pop the element
        Method Description: Remove the element and return it
        Method Return: Object (Unknown type)
    */
    pop(index){
        if (!((index >= 0 && index < this.getSize()))){
            return null;
        }
        let element = this.get(index);
        this.remove(index);
        return element;
    }

    /*
        Method Name: *[Symbol.iterator]
        Method Parameters: None
        Method Description: Provide each element of the linked list and its index
        Method Return: N/A
    */
    *[Symbol.iterator](){
        let current = this.head;
        let i = 0;
        while (current != null){
            yield [current.value, i];
            current = current.next;
            i++;
        }
    }

    /*
        Method Name: getLastNode
        Method Parameters: None
        Method Description: Get the last node from the list
        Method Return: void
    */
    getLastNode(){
        if (this.isEmpty()){ return; }
        let current = this.head;
        while (current.next != null){
            current = current.next;
        }
        return current;
    }
}

/*
    Class Name: SLLNode
    Description: A singly linked node.
*/
class SLLNode {
    constructor(value){
        this.value = value;
        this.next = null;
    }
}
// If using NodeJS then export the class
if (typeof window === "undefined"){
    module.exports = NotSamSinglyLinkedList;
}