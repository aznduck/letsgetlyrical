package edu.usc.csci310.project.requests;

public class FavoriteRemoveRequest {
    private String username;
    private int songId;

    public String getUsername() {
        return username;
    }

    public void setUsername(String name) {
        this.username = name;
    }

    public int getSongId() {
        return songId;
    }

    public void setSongId(int songId) {
        this.songId = songId;
    }
}
