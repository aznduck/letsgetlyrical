package edu.usc.csci310.project.requests;

public class FavoriteRemoveRequest extends CreateUserRequest{
    private int songId;

    public int getSongId() {
        return songId;
    }

    public void setSongId(int songId) {
        this.songId = songId;
    }
}
