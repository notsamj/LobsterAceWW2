/*
    Class Name: LocalMissionClient
    Description: A client for a local mission
*/
class LocalMissionClient extends LocalClient {
    /*
        Method Name: constructor
        Method Parameters:
            missionObject:
                A json object with information about the selected mission
            missionSetupJSON:
                A json object with information about specific mission instance (i.e. what plane the user is using)
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(missionObject, missionSetupJSON){
        super(new LocalMission(missionObject, missionSetupJSON));
    }
}