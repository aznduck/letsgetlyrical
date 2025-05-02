package edu.usc.csci310.project.responses;

import edu.usc.csci310.project.models.FavoriteSong;

import java.util.List;

public class UserFavoritesResponse {
    private int id;
    private String message;
    private List<FavoriteSong> favorites;

    public UserFavoritesResponse(int id, String message, List<FavoriteSong> favorites) {
        this.id = id;
        this.message = message;
        this.favorites = favorites;
    }

    public int getId() {
        return id;
    }

    public Object getFavorites() {
        return favorites;
    }

    public String getMessage() {
        return message;
    }
}
