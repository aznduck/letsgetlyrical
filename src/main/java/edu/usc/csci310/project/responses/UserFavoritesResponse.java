package edu.usc.csci310.project.responses;

public class UserFavoritesResponse {
    private int id;
    private String message;
    private Object favorites;

    public UserFavoritesResponse(int id, String message, Object favorites) {
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
