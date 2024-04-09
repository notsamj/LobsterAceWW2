class LocalMissionClient extends LocalClient {
    constructor(missionObject, missionSetupJSON){
        super(new LocalMission(missionObject, missionSetupJSON));
    }
}