package edu.usc.csci310.project.models;

public class FavoriteSong {
    public int id; // the order in which it was favorited
    public String title;
    public String artist;
    public String album;

    public FavoriteSong(int id, String title, String artist, String album) {
        this.id = id;
        this.title = title;
        this.artist = artist;
        this.album = album;
    }
}
