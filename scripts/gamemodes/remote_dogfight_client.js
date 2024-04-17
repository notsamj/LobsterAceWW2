/*
    Class Name: RemoteDogfightClient
    Description: A client for participating in a Dogfight run by a server.
*/
class RemoteDogfightClient extends RemoteClient {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        super(new RemoteDogfight());
    }
}