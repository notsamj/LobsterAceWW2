/*
    Class Name: RemoteMissionClient
    Description: A client for participating in a Mission run by a server.
*/
class RemoteMissionClient extends RemoteClient {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        super(new RemoteMission());
    }
}