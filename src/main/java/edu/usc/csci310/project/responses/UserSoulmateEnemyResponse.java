package edu.usc.csci310.project.responses;

public class UserSoulmateEnemyResponse {
    private int fromId;
    //returned type
    private int targetUserId;
    private String targetUsername;//
    private boolean isEachOther;


    public UserSoulmateEnemyResponse(int fromId, int targetUserId, String targetUsername, boolean isEachOther) {
        this.fromId = fromId;
        this.targetUserId = targetUserId;
        this.targetUsername = targetUsername;
        this.isEachOther = isEachOther;
    }

    public int getFromId() {
        return fromId;
    }

    public void setFromId(int fromId) {
        this.fromId = fromId;
    }

    public int getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(int targetUserId) {
        this.targetUserId = targetUserId;
    }

    public String getTargetUsername() {
        return targetUsername;
    }

    public void setTargetUsername(String targetUsername) {
        this.targetUsername = targetUsername;
    }

    public boolean isEachOther() {
        return isEachOther;
    }

    public void setEachOther(boolean eachOther) {
        isEachOther = eachOther;
    }
}
