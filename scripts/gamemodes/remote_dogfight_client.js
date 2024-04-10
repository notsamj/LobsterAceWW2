/*
    Class Name: RemoteDogfightClient
    Description: A client for participating in a Dogfight run by a server.
*/
class RemoteDogfightClient extends RemoteClient {
    constructor(){
        super(new RemoteDogfight());
    }
}