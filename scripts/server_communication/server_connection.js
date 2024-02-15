/*
    Class Name: ServerConnection
    Description: An object used for handling server connections.
    TODO: Comment this class
*/
class ServerConnection {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.ip = PROGRAM_DATA["settings"]["server_ip"];
        this.port = PROGRAM_DATA["settings"]["server_port"];
        this.setup = false;
    }

    setupConnection(){

    }

    /*
        Return value: JSON if got a response, false if not
    */
    request(){
        return false;
    }

    isSetup(){
        return this.setup;
    }
}